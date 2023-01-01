import graphene

from .assets_queries import *
from .countries_queries import *


class InvestmentTrackerQueries(AssetsQuery, CountriesQuery, graphene.ObjectType):
    pass
