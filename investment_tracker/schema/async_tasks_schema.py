from graphene.types.generic import GenericScalar
from graphene_django.types import DjangoObjectType

from investment_tracker.models.async_tasks_models import AsyncTasksModel


class AsyncTasksType(DjangoObjectType):
    class Meta:
        model = AsyncTasksModel

    meta_data = GenericScalar()

    def resolve_meta_data(self, _):
        return self.meta_data
