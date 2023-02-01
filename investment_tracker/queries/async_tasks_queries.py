import graphene
from django.utils import timezone

from investment_tracker.schema.async_tasks_schema import AsyncTasksType
from investment_tracker.accessors.async_tasks_accessor import AsyncTasksAccessor
from investment_tracker.utils.common_utils import end_of_day, start_of_day


class AsyncTasksQuery(graphene.ObjectType):
    active_tasks = graphene.List(AsyncTasksType)

    def resolve_active_tasks(self, info):
        dt = timezone.now()
        return AsyncTasksAccessor().get_async_tasks(
            within=[start_of_day(dt), end_of_day(dt)],
            order_by=["-created_at"],
        )
