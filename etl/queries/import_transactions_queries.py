import graphene
from graphene.types.generic import GenericScalar

from etl.tasks.import_transactions import run as import_transactions_etl
from investment_tracker.constants import ASYNC_TASKS
from investment_tracker.services.async_tasks_services import AsyncTasksService


class ImportTransactionsQuery(graphene.ObjectType):
    import_transactions = graphene.Int(
        source=graphene.String(required=True),
        encoded_files=GenericScalar(required=True),
    )

    def resolve_import_transactions(self, info, source, encoded_files):
        async_task_id = AsyncTasksService().create_async_task(
            ASYNC_TASKS["IMPORT_TRANSACTIONS"]
        )
        import_transactions_etl.delay(async_task_id, source, encoded_files)
        return async_task_id
