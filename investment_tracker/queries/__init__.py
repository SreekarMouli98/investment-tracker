import graphene

from investment_tracker.queries.async_tasks_queries import AsyncTasksQuery

from .assets_queries import *
from .countries_queries import *
from .transactions_queries import *


class InvestmentTrackerQueries(AssetsQuery, AsyncTasksQuery, CountriesQuery, TransactionsQuery, graphene.ObjectType):
    pass
