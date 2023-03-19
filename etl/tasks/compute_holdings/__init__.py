import logging
import traceback
from datetime import datetime

from celery import shared_task

from etl.tasks.compute_holdings.compute_holdings import ComputeHoldingsETL
from investment_tracker.services import AsyncTasksService


logger = logging.getLogger(__name__)


@shared_task
def run(async_task_id: int, start_date: datetime) -> None:
    logger.info("[Compute Holdings ETL]: Begin")
    try:
        AsyncTasksService().set_in_progress(async_task_id, percentage=25)
        logger.info("[Compute Holdings ETL]: Compute holdings from %s", start_date)
        extracted_data = ComputeHoldingsETL().extract(start_date)
        AsyncTasksService().update_progress(async_task_id, 50)
        transformed_data = ComputeHoldingsETL().transform(extracted_data)
        AsyncTasksService().update_progress(async_task_id, 75)
        ComputeHoldingsETL().load(transformed_data)
        AsyncTasksService().set_completed(async_task_id)
    except Exception as ex:
        logger.error("[Compute Holdings ETL]: Exception -> %s", ex)
        traceback.print_exc()
        AsyncTasksService().set_failed(async_task_id)
    logger.info("[Compute Holdings ETL]: End")
