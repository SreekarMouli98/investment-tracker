# pylint: disable=R0901
import graphene

from .analytics_queries import *
from .assets_queries import *
from .async_tasks_queries import *
from .countries_queries import *
from .holdings_queries import *
from .transactions_queries import *


class InvestmentTrackerQueries(
    AnalyticsQuery,
    AssetsQuery,
    AsyncTasksQuery,
    CountriesQuery,
    HoldingsQuery,
    TransactionsQuery,
    graphene.ObjectType,
):
    pass
