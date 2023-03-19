import graphene

from investment_tracker.accessors.holdings_accessors import HoldingsAccessor
from investment_tracker.schema.holdings_schema import HoldingsType


class HoldingsQuery(graphene.ObjectType):
    holdings = graphene.List(
        HoldingsType,
        limit=graphene.Int(),
        offset=graphene.Int(),
    )
    holdings_count = graphene.Int()

    def resolve_holdings(self, _, limit=None, offset=None):
        return HoldingsAccessor().get_holdings(
            latest=True, limit=limit, offset=offset, order_by=["asset__ticker"]
        )

    def resolve_holdings_count(self, _):
        return HoldingsAccessor().count_holdings(latest=True)
