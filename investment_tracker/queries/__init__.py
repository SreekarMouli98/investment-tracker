import graphene

from .assets_queries import *
from .countries_queries import *
from .holdings_queries import *
from .transactions_queries import *
from investment_tracker.queries.async_tasks_queries import AsyncTasksQuery


class InvestmentTrackerQueries(
    AssetsQuery,
    AsyncTasksQuery,
    CountriesQuery,
    HoldingsQuery,
    TransactionsQuery,
    graphene.ObjectType,
):
    pass
