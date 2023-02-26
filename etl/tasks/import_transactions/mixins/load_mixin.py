from django.db import transaction
from django.utils import timezone

from etl.tasks.compute_holdings import run as compute_holdings_etl
from investment_tracker.constants import ASYNC_TASKS
from investment_tracker.models import AssetsModel, ConversionRatesModel, TransactionsModel
from investment_tracker.services.async_tasks_services import AsyncTasksService


class LoadMixin:
    @transaction.atomic
    def load(self, transformed_data: dict) -> None:
        """Loads transactions to database"""
        assets = transformed_data.get("assets", [])
        AssetsModel.objects.bulk_create(assets)
        transactions = transformed_data.get("transactions", [])
        TransactionsModel.objects.bulk_create(transactions)
        conversion_rates = transformed_data.get("conversion_rates", [])
        ConversionRatesModel.objects.bulk_create(conversion_rates)
        oldest_transactions_date = timezone.now()
        for transaction in transactions:
            if transaction.transacted_at < oldest_transactions_date:
                oldest_transactions_date = transaction.transacted_at
        failed_conversions = transformed_data.get("failed_conversions", [])
        warnings = None
        if failed_conversions:
            warnings = [
                f"Couldn't determine conversion rates for transactions between {', '.join(failed_conversions)}! Please update them manually!"
            ]
        async_task_id = AsyncTasksService().create_async_task(ASYNC_TASKS["COMPUTE_HOLDINGS"])
        compute_holdings_etl.delay(async_task_id, oldest_transactions_date)
        return (warnings,)
