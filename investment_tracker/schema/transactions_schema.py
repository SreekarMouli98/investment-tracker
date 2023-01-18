import graphene
from graphene_django.types import DjangoObjectType

from investment_tracker.models.transactions_models import TransactionsModel
from investment_tracker.utils.transactions_utils import to_higher_denomination


class TransactionsType(DjangoObjectType):
    class Meta:
        model = TransactionsModel

    supply_value = graphene.Float()
    receive_value = graphene.Float()

    def resolve_supply_value(self, info):
        return to_higher_denomination(self.supply_value, asset_class_instance=self.supply_asset.asset_class)

    def resolve_receive_value(self, info):
        return to_higher_denomination(self.receive_value, asset_class_instance=self.receive_asset.asset_class)
