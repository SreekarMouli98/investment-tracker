import graphene

from etl.queries import ETLQueries
from investment_tracker.mutations import InvestmentTrackerMutations
from investment_tracker.queries import InvestmentTrackerQueries


class Query(ETLQueries, InvestmentTrackerQueries, graphene.ObjectType):
    pass


class Mutation(InvestmentTrackerMutations, graphene.ObjectType):
    pass


schema = graphene.Schema(query=Query, mutation=Mutation)
