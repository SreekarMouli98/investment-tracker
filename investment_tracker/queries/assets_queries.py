import graphene

from investment_tracker.schema.assets_schema import AssetClassesType, AssetsType
from investment_tracker.accessors.assets_accessors import AssetClassesAccessor, AssetsAccessor


class AssetsQuery(graphene.ObjectType):
    asset_classes = graphene.List(AssetClassesType)
    assets = graphene.List(AssetsType)

    def resolve_asset_classes(self, info):
        return AssetClassesAccessor().get_asset_classes()

    def resolve_assets(self, info):
        return AssetsAccessor().get_assets()
