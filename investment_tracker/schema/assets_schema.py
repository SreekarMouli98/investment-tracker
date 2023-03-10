from graphene_django.types import DjangoObjectType

from investment_tracker.models.assets_models import AssetClassesModel
from investment_tracker.models.assets_models import AssetsModel


class AssetClassesType(DjangoObjectType):
    class Meta:
        model = AssetClassesModel


class AssetsType(DjangoObjectType):
    class Meta:
        model = AssetsModel
