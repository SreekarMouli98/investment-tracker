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

    @staticmethod
    def resolve_supply_value(transaction, _):
        return to_higher_denomination(
            transaction.supply_value,
            asset_class_instance=transaction.supply_asset.asset_class,
        )

    @staticmethod
    def resolve_receive_value(transaction, _):
        return to_higher_denomination(
            transaction.receive_value,
            asset_class_instance=transaction.receive_asset.asset_class,
        )

    @staticmethod
    def resolve_supply_base_conv_rate(transaction, _):
        if not transaction.supply_base_conv_rate:
            return 0
        return to_higher_denomination(
            transaction.supply_base_conv_rate,
            asset_class_dict=AssetClassesService().get_asset_class_by_name("Currency"),
        )

    @staticmethod
    def resolve_receive_base_conv_rate(transaction, _):
        if not transaction.receive_base_conv_rate:
            return 0
        return to_higher_denomination(
            transaction.receive_base_conv_rate,
            asset_class_dict=AssetClassesService().get_asset_class_by_name("Currency"),
        )

    @staticmethod
    def resolve_supply_in_base(transaction, _):
        if not transaction.supply_base_conv_rate:
            return 0
        return to_higher_denomination(
            to_higher_denomination(
                transaction.supply_value,
                asset_class_instance=transaction.supply_asset.asset_class,
            )
            * decimal.Decimal(transaction.supply_base_conv_rate),
            asset_class_dict=AssetClassesService().get_asset_class_by_name("Currency"),
        )

    @staticmethod
    def resolve_receive_in_base(transaction, _):
        if not transaction.receive_base_conv_rate:
            return 0
        return to_higher_denomination(
            to_higher_denomination(
                transaction.receive_value,
                asset_class_instance=transaction.receive_asset.asset_class,
            )
            * decimal.Decimal(transaction.receive_base_conv_rate),
            asset_class_dict=AssetClassesService().get_asset_class_by_name("Currency"),
        )
