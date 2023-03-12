import graphene

from .assets_mutations import *
from .transactions_mutations import *


class InvestmentTrackerMutations(
    AssetsMutation, TransactionsMutation, graphene.ObjectType
):
    pass
