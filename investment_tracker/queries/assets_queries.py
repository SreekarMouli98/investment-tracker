import graphene
from investment_tracker.accessors.assets_accessors import AssetsAccessor

from investment_tracker.schema.assets_schema import AssetsType


class AssetsQuery(graphene.ObjectType):
    assets = graphene.List(AssetsType)

    def resolve_assets(self, info):
        return AssetsAccessor().get_assets()
