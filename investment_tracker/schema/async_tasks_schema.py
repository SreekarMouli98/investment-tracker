from graphene_django.types import DjangoObjectType

from investment_tracker.models.async_tasks_models import AsyncTasksModel


class AsyncTasksType(DjangoObjectType):
    class Meta:
        model = AsyncTasksModel
