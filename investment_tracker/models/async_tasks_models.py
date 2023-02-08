from django.db import models


class AsyncTasksModel(models.Model):
    class Statuses(models.TextChoices):
        PENDING = "PENDING"
        IN_PROGRESS = "IN_PROGRESS"
        COMPLETED = "COMPLETED"
        FAILED = "FAILED"

    task_name = models.CharField(max_length=128, null=False)
    status = models.CharField(max_length=128, null=False, choices=Statuses.choices)
    percentage = models.IntegerField(null=False, default=0)
    created_at = models.DateTimeField(auto_now_add=True, null=False)
    started_at = models.DateTimeField(null=True)
    ended_at = models.DateTimeField(null=True)

    class Meta:
        db_table = "async_tasks"
