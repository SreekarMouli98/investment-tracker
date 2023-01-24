import graphene

from .assets_queries import *
from .countries_queries import *
from .transactions_queries import *


class InvestmentTrackerQueries(AssetsQuery, CountriesQuery, TransactionsQuery, graphene.ObjectType):
    pass
