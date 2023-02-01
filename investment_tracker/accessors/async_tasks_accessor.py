from investment_tracker.models.async_tasks_models import AsyncTasksModel


class AsyncTasksAccessor:
    def persist(self, async_task):
        async_task.save()
        return async_task

    def update_async_task(self, async_task_id, **updates):
        return AsyncTasksModel.objects.filter(id=async_task_id).update(**updates)

    def get_async_tasks(self, within=None, order_by=None):
        qs = AsyncTasksModel.objects.filter()
        if within:
            qs = qs.filter(created_at__gte=within[0], created_at__lte=within[1])
        if order_by:
            qs = qs.order_by(*order_by)
        return list(qs)
