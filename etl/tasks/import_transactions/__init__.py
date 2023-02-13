import traceback
from celery import shared_task

from etl.tasks.import_transactions.indmoney import *
from etl.tasks.import_transactions.vauld import *
from etl.tasks.import_transactions.wazirx import *
from etl.tasks.import_transactions.zerodha import *
from investment_tracker.services import AsyncTasksService


@shared_task
def run(async_task_id: int, source: str, source_data: str) -> None:
    try:
        etl_service = None
        if source == "INDMoney":
            etl_service = ImportTransactionsFromINDMoneyETL()
        elif source == "Vauld":
            etl_service = ImportTransactionsFromVauldETL()
        elif source == "Wazirx":
            etl_service = ImportTransactionsFromWazirxETL()
        elif source == "Zerodha":
            etl_service = ImportTransactionsFromZerodhaETL()
        else:
            raise ValueError(f"Invalid source: {source}")
        AsyncTasksService().set_in_progress(async_task_id, percentage=25)
        extracted_data = etl_service.extract(source_data)
        AsyncTasksService().update_progress(async_task_id, 50)
        transformed_data = etl_service.transform(extracted_data)
        AsyncTasksService().update_progress(async_task_id, 75)
        etl_service.load(transformed_data)
        AsyncTasksService().set_completed(async_task_id)
    except Exception as ex:
        traceback.print_exc()
        AsyncTasksService().set_failed(async_task_id)
