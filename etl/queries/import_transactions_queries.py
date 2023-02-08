import graphene

from etl.tasks.import_transactions.import_transactions_from_zerodha import (
    run as import_transactions_from_zerodha_etl,
)
from investment_tracker.constants import ASYNC_TASKS
from investment_tracker.services.async_tasks_services import AsyncTasksService


class ImportTransactionsQuery(graphene.ObjectType):
    import_transactions = graphene.Int(
        source=graphene.String(required=True), decoded_file=graphene.String(required=True)
    )

    def resolve_import_transactions(self, info, source, decoded_file):
        async_task_id = AsyncTasksService().create_async_task(ASYNC_TASKS["IMPORT_TRANSACTIONS"])
        if source == "Zerodha":
            import_transactions_from_zerodha_etl.delay(async_task_id, decoded_file)
        return async_task_id
