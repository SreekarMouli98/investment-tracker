from investment_tracker.models.async_tasks_models import AsyncTasksModel
from investment_tracker.utils.db_utils import apply_limit_offset_order_by


class AsyncTasksAccessor:
    def persist(self, async_task):
        async_task.save()
        return async_task

    def update_async_task(self, async_task_id, **updates):
        return AsyncTasksModel.objects.filter(id=async_task_id).update(**updates)

    def get_latest_task(self):
        qs = AsyncTasksModel.objects.filter().order_by("-created_at")
        return qs.first()

    def get_task_by_id(self, task_id):
        qs = AsyncTasksModel.objects.filter(id=task_id)
        return qs.first()

    def get_tasks(self, limit=None, offset=None, order_by=None):
        qs = AsyncTasksModel.objects.filter()
        apply_limit_offset_order_by(qs, limit=limit, offset=offset, order_by=order_by)
        return list(qs)

    def count_tasks(self):
        qs = AsyncTasksModel.objects.filter()
        return qs.count()
