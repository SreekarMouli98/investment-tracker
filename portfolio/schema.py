import channels_graphql_ws
import graphene

from investment_tracker.mutations import InvestmentTrackerMutations
from investment_tracker.queries import InvestmentTrackerQueries
from investment_tracker.subscriptions import InvestmentTrackerSubscriptions


class Query(InvestmentTrackerQueries, graphene.ObjectType):
    pass


class Mutation(InvestmentTrackerMutations, graphene.ObjectType):
    pass


class Subscription(InvestmentTrackerSubscriptions, graphene.ObjectType):
    pass


schema = graphene.Schema(query=Query, mutation=Mutation, subscription=Subscription)


class WSConsumer(channels_graphql_ws.GraphqlWsConsumer):
    schema = schema
