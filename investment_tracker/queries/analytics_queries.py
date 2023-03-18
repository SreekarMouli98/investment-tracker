import graphene
from graphene.types.generic import GenericScalar

from investment_tracker.services.analytics_services import AnalyticsService


class AnalyticsQuery(graphene.ObjectType):
    invested_amount = GenericScalar()
    total_assets = GenericScalar()
    asset_class_diversification = GenericScalar()
    networth_growth = GenericScalar()
    assets_tree_map = GenericScalar()

    def resolve_invested_amount(self, info):
        return AnalyticsService().get_invested_amount()

    def resolve_total_assets(self, info):
        return AnalyticsService().get_total_assets()

    def resolve_asset_class_diversification(self, info):
        return AnalyticsService().get_asset_class_diversification()

    def resolve_networth_growth(self, info):
        return AnalyticsService().get_networth_growth()

    def resolve_assets_tree_map(self, info):
        return AnalyticsService().get_assets_tree_map()
