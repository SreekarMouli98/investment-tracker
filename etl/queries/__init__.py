import graphene

from .import_transactions_queries import *


class ETLQueries(ImportTransactionsQuery, graphene.ObjectType):
    pass
