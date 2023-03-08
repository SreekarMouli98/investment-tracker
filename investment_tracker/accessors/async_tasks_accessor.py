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

    def get_tasks(self, limit=None, offset=None, order_by=None):
        qs = AsyncTasksModel.objects.filter()
        if order_by:
            qs = qs.order_by(*order_by)
        if offset is not None and limit is not None:
            qs = qs[offset : offset + limit]
        return list(qs)

    def count_tasks(self):
        qs = AsyncTasksModel.objects.filter()
        return qs.count()
