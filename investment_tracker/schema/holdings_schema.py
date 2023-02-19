import graphene
from graphene_django.types import DjangoObjectType

from investment_tracker.models.holdings_models import HoldingsModel
from investment_tracker.services.assets_services import AssetClassesService
from investment_tracker.utils.transactions_utils import to_higher_denomination


class HoldingsType(DjangoObjectType):
    class Meta:
        model = HoldingsModel

    value = graphene.Float()
    average_buy = graphene.Float()
    value_in_base = graphene.Float()

    def resolve_value(self, info):
        return to_higher_denomination(self.value, asset_class_instance=self.asset.asset_class)

    def resolve_average_buy(self, info):
        return to_higher_denomination(
            self.average_buy, asset_class_dict=AssetClassesService().get_asset_class_by_name("Currency")
        )

    def resolve_value_in_base(self, info):
        return to_higher_denomination(
            self.value_in_base, asset_class_dict=AssetClassesService().get_asset_class_by_name("Currency")
        )
