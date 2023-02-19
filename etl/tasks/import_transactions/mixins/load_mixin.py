from django.db import transaction
from django.utils import timezone

from etl.tasks.compute_holdings import run as compute_holdings_etl
from investment_tracker.constants import ASYNC_TASKS
from investment_tracker.models import AssetsModel, TransactionsModel
from investment_tracker.services.async_tasks_services import AsyncTasksService


class LoadMixin:
    @transaction.atomic
    def load(self, transformed_data: dict) -> None:
        """Loads transactions to database"""
        assets = transformed_data.get("assets", [])
        AssetsModel.objects.bulk_create(assets)
        transactions = transformed_data.get("transactions", [])
        TransactionsModel.objects.bulk_create(transactions)
        oldest_transactions_date = timezone.now()
        for transaction in transactions:
            if transaction.transacted_at < oldest_transactions_date:
                oldest_transactions_date = transaction.transacted_at
        async_task_id = AsyncTasksService().create_async_task(ASYNC_TASKS["COMPUTE_HOLDINGS"])
        compute_holdings_etl.delay(async_task_id, oldest_transactions_date)
