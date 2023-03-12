import graphene

from investment_tracker.accessors.async_tasks_accessor import AsyncTasksAccessor
from investment_tracker.schema.async_tasks_schema import AsyncTasksType


class AsyncTasksQuery(graphene.ObjectType):
    task_by_id_or_latest = graphene.Field(
        AsyncTasksType, task_id=graphene.ID(required=False, default_value=False)
    )
    tasks = graphene.List(AsyncTasksType, limit=graphene.Int(), offset=graphene.Int())
    tasks_count = graphene.Int()

    def resolve_task_by_id_or_latest(self, info, task_id):
        if task_id:
            return AsyncTasksAccessor().get_task_by_id(task_id)
        else:
            return AsyncTasksAccessor().get_latest_task()

    def resolve_tasks(self, info, limit=None, offset=None):
        return AsyncTasksAccessor().get_tasks(
            limit=limit, offset=offset, order_by=["-created_at"]
        )

    def resolve_tasks_count(self, info):
        return AsyncTasksAccessor().count_tasks()
