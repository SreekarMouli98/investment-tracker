import graphene

from .assets_mutations import *


class InvestmentTrackerMutations(AssetsMutation, graphene.ObjectType):
    pass
