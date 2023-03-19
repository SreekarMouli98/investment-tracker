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

    @staticmethod
    def resolve_value(holding, _):
        return to_higher_denomination(
            holding.value, asset_class_instance=holding.asset.asset_class
        )

    @staticmethod
    def resolve_average_buy(holding, _):
        return to_higher_denomination(
            holding.average_buy,
            asset_class_dict=AssetClassesService().get_asset_class_by_name("Currency"),
        )

    @staticmethod
    def resolve_value_in_base(holding, _):
        return to_higher_denomination(
            holding.value_in_base,
            asset_class_dict=AssetClassesService().get_asset_class_by_name("Currency"),
        )
