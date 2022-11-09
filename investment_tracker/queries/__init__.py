import graphene

from .assets_queries import *


class InvestmentTrackerQueries(AssetsQuery, graphene.ObjectType):
    pass
