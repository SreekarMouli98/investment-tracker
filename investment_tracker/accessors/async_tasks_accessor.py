from investment_tracker.models.async_tasks_models import AsyncTasksModel


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
