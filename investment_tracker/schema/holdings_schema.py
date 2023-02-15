import graphene
from graphene_django.types import DjangoObjectType

from investment_tracker.models.holdings_models import HoldingsModel
from investment_tracker.utils.transactions_utils import to_higher_denomination


class HoldingsType(DjangoObjectType):
    class Meta:
        model = HoldingsModel

    value = graphene.Float()

    def resolve_value(self, info):
        return to_higher_denomination(self.value, asset_class_instance=self.asset.asset_class)
