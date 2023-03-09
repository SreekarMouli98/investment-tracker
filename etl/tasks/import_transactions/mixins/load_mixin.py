import logging
from django.db import transaction
from django.utils import timezone

from etl.tasks.compute_holdings import run as compute_holdings_etl
from investment_tracker.constants import ASYNC_TASKS
from investment_tracker.models import AssetsModel, ConversionRatesModel, TransactionsModel
from investment_tracker.services.async_tasks_services import AsyncTasksService

logger = logging.getLogger(__name__)


class LoadMixin:
    @transaction.atomic
    def load(self, transformed_data: dict) -> None:
        """Loads transactions to database"""
        logger.info("[Import Transactions ETL]: Load -> Begin")
        assets = transformed_data.get("assets", [])
        logger.info(f"[Import Transactions ETL]: Load -> Inserting {len(assets)} new assets")
        AssetsModel.objects.bulk_create(assets)
        transactions = transformed_data.get("transactions", [])
        logger.info(f"[Import Transactions ETL]: Load -> Inserting {len(transactions)} new transactions")
        TransactionsModel.objects.bulk_create(transactions)
        conversion_rates = transformed_data.get("conversion_rates", [])
        logger.info(f"[Import Transactions ETL]: Load -> Inserting {len(conversion_rates)} new conversion rates")
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
        logger.info(f"[Import Transactions ETL]: Load -> Triggering Compute Holdings ETL")
        compute_holdings_etl.delay(async_task_id, oldest_transactions_date)
        logger.info("[Import Transactions ETL]: Load -> End")
        return (warnings,)
