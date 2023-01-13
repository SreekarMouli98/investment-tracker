from graphene_django.types import DjangoObjectType

from investment_tracker.models.transactions_models import TransactionsModel


class TransactionsType(DjangoObjectType):
    class Meta:
        model = TransactionsModel
