import decimal
import graphene
from graphene_django.types import DjangoObjectType

from investment_tracker.models.transactions_models import TransactionsModel
from investment_tracker.services.assets_services import AssetClassesService
from investment_tracker.utils.transactions_utils import to_higher_denomination


class TransactionsType(DjangoObjectType):
    class Meta:
        model = TransactionsModel

    supply_value = graphene.Float()
    receive_value = graphene.Float()
    supply_base_conv_rate = graphene.Float()
    receive_base_conv_rate = graphene.Float()
    supply_in_base = graphene.Float()
    receive_in_base = graphene.Float()

    def resolve_supply_value(self, info):
        return to_higher_denomination(self.supply_value, asset_class_instance=self.supply_asset.asset_class)

    def resolve_receive_value(self, info):
        return to_higher_denomination(self.receive_value, asset_class_instance=self.receive_asset.asset_class)

    def resolve_supply_base_conv_rate(self, info):
        if not self.supply_base_conv_rate:
            return 0
        return to_higher_denomination(
            self.supply_base_conv_rate, asset_class_dict=AssetClassesService().get_asset_class_by_name("Currency")
        )

    def resolve_receive_base_conv_rate(self, info):
        if not self.receive_base_conv_rate:
            return 0
        return to_higher_denomination(
            self.receive_base_conv_rate, asset_class_dict=AssetClassesService().get_asset_class_by_name("Currency")
        )

    def resolve_supply_in_base(self, info):
        if not self.supply_base_conv_rate:
            return 0
        return to_higher_denomination(
            to_higher_denomination(self.supply_value, asset_class_instance=self.supply_asset.asset_class)
            * decimal.Decimal(self.supply_base_conv_rate),
            asset_class_dict=AssetClassesService().get_asset_class_by_name("Currency"),
        )

    def resolve_receive_in_base(self, info):
        if not self.receive_base_conv_rate:
            return 0
        return to_higher_denomination(
            to_higher_denomination(self.receive_value, asset_class_instance=self.receive_asset.asset_class)
            * decimal.Decimal(self.receive_base_conv_rate),
            asset_class_dict=AssetClassesService().get_asset_class_by_name("Currency"),
        )
