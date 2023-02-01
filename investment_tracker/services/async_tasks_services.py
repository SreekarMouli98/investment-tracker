from django.utils import timezone

from investment_tracker.accessors.async_tasks_accessor import AsyncTasksAccessor
from investment_tracker.models.async_tasks_models import AsyncTasksModel


class AsyncTasksService:
    def create_async_task(self, task_name, status=AsyncTasksModel.Statuses.PENDING, percentage=0):
        async_task = AsyncTasksModel(task_name=task_name, status=status, percentage=percentage)
        async_task = AsyncTasksAccessor().persist(async_task)
        return async_task.id

    def set_in_progress(self, async_task_id):
        AsyncTasksAccessor().update_async_task(
            async_task_id, status=AsyncTasksModel.Statuses.IN_PROGRESS, started_at=timezone.now()
        )

    def update_progress(self, async_task_id, percentage):
        AsyncTasksAccessor().update_async_task(
            async_task_id, status=AsyncTasksModel.Statuses.COMPLETED, percentage=percentage
        )

    def set_completed(self, async_task_id):
        AsyncTasksAccessor().update_async_task(
            async_task_id, status=AsyncTasksModel.Statuses.COMPLETED, percentage=100, ended_at=timezone.now()
        )

    def set_failed(self, async_task_id):
        AsyncTasksAccessor().update_async_task(
            async_task_id, status=AsyncTasksModel.Statuses.FAILED, ended_at=timezone.now()
        )
