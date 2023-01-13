import graphene

from investment_tracker.schema.transactions_schema import TransactionsType
from investment_tracker.accessors.transactions_accessors import TransactionsAccessor


class TransactionsQuery(graphene.ObjectType):
    transactions = graphene.List(
        TransactionsType,
        limit=graphene.Int(),
        offset=graphene.Int(),
    )

    def resolve_transactions(self, info, limit=None, offset=None):
        return TransactionsAccessor().get_transactions(limit=limit, offset=offset, order_by=["-transacted_at"])
