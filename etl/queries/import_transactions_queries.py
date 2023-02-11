import graphene
from graphene.types.generic import GenericScalar

from etl.tasks.import_transactions.import_transactions_from_zerodha import (
    run as import_transactions_from_zerodha_etl,
)
from etl.tasks.import_transactions.import_transactions_from_indmoney import (
    run as import_transactions_from_indmoney_etl,
)
from etl.tasks.import_transactions.import_transactions_from_vauld import (
    run as import_transactions_from_vauld_etl,
)
from investment_tracker.constants import ASYNC_TASKS
from investment_tracker.services.async_tasks_services import AsyncTasksService


class ImportTransactionsQuery(graphene.ObjectType):
    import_transactions = graphene.Int(
        source=graphene.String(required=True), encoded_files=GenericScalar(required=True)
    )

    def resolve_import_transactions(self, info, source, encoded_files):
        async_task_id = AsyncTasksService().create_async_task(ASYNC_TASKS["IMPORT_TRANSACTIONS"])
        if source == "Zerodha":
            import_transactions_from_zerodha_etl.delay(async_task_id, encoded_files)
        elif source == "INDMoney":
            import_transactions_from_indmoney_etl.delay(async_task_id, encoded_files)
        elif source == "Vauld":
            import_transactions_from_vauld_etl.delay(async_task_id, encoded_files)
        return async_task_id
