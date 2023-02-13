import graphene

from investment_tracker.schema.async_tasks_schema import AsyncTasksType
from investment_tracker.accessors.async_tasks_accessor import AsyncTasksAccessor


class AsyncTasksQuery(graphene.ObjectType):
    task_by_id_or_latest = graphene.Field(AsyncTasksType, task_id=graphene.ID(required=False, default_value=False))

    def resolve_task_by_id_or_latest(self, info, task_id):
        if task_id:
            return AsyncTasksAccessor().get_task_by_id(task_id)
        else:
            return AsyncTasksAccessor().get_latest_task()
