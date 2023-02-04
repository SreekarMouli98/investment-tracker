from django.utils import timezone

from investment_tracker.accessors.async_tasks_accessor import AsyncTasksAccessor
from investment_tracker.models.async_tasks_models import AsyncTasksModel
from investment_tracker.subscriptions.notifications_subscriptions import AsyncTasksSubscription
from investment_tracker.utils.common_utils import end_of_day, start_of_day


class AsyncTasksService:
    def broadcast_tasks(self):
        dt = timezone.now()
        async_tasks = AsyncTasksAccessor().get_async_tasks(
            within=[start_of_day(dt), end_of_day(dt)],
            order_by=["-created_at"],
        )
        AsyncTasksSubscription.broadcast(group="group42", payload=async_tasks)

    def create_async_task(self, task_name, status=AsyncTasksModel.Statuses.PENDING, percentage=0):
        async_task = AsyncTasksModel(task_name=task_name, status=status, percentage=percentage)
        async_task = AsyncTasksAccessor().persist(async_task)
        self.broadcast_tasks()
        return async_task.id

    def set_in_progress(self, async_task_id, percentage=10):
        AsyncTasksAccessor().update_async_task(
            async_task_id, status=AsyncTasksModel.Statuses.IN_PROGRESS, started_at=timezone.now(), percentage=percentage
        )
        self.broadcast_tasks()

    def update_progress(self, async_task_id, percentage):
        AsyncTasksAccessor().update_async_task(async_task_id, percentage=percentage)
        self.broadcast_tasks()

    def set_completed(self, async_task_id):
        AsyncTasksAccessor().update_async_task(
            async_task_id, status=AsyncTasksModel.Statuses.COMPLETED, percentage=100, ended_at=timezone.now()
        )
        self.broadcast_tasks()

    def set_failed(self, async_task_id):
        AsyncTasksAccessor().update_async_task(
            async_task_id, status=AsyncTasksModel.Statuses.FAILED, ended_at=timezone.now()
        )
        self.broadcast_tasks()
