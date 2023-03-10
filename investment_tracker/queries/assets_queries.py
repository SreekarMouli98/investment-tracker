import graphene

from investment_tracker.accessors.assets_accessors import AssetClassesAccessor
from investment_tracker.accessors.assets_accessors import AssetsAccessor
from investment_tracker.schema.assets_schema import AssetClassesType
from investment_tracker.schema.assets_schema import AssetsType
from investment_tracker.utils.transactions_utils import get_base_asset


class AssetsQuery(graphene.ObjectType):
    asset_classes = graphene.List(AssetClassesType)
    assets = graphene.List(
        AssetsType,
        limit=graphene.Int(),
        offset=graphene.Int(),
        asset_classes=graphene.List(graphene.String),
        countries=graphene.List(graphene.String),
        search_text=graphene.String(),
    )
    assets_count = graphene.Int(
        asset_classes=graphene.List(graphene.String),
        countries=graphene.List(graphene.String),
        search_text=graphene.String(),
    )
    base_asset = graphene.Field(AssetsType)

    def resolve_asset_classes(self, info):
        return AssetClassesAccessor().get_asset_classes()

    def resolve_assets(
        self,
        info,
        limit=None,
        offset=None,
        asset_classes=None,
        countries=None,
        search_text=None,
    ):
        return AssetsAccessor().get_assets(
            limit=limit,
            offset=offset,
            asset_classes=asset_classes,
            countries=countries,
            search_text=search_text,
            order_by=["name"],
        )

    def resolve_assets_count(
        self, info, asset_classes=None, countries=None, search_text=None
    ):
        return AssetsAccessor().count_assets(
            asset_classes=asset_classes,
            countries=countries,
            search_text=search_text,
        )

    def resolve_base_asset(self, info):
        return get_base_asset()
