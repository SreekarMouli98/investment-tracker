import graphene
from graphql import GraphQLError

from etl.tasks.compute_holdings import run as compute_holdings_etl
from investment_tracker.constants import ASYNC_TASKS
from investment_tracker.schema.transactions_schema import TransactionsType
from investment_tracker.models.transactions_models import TransactionsModel
from investment_tracker.accessors.transactions_accessors import TransactionsAccessor
from investment_tracker.services.assets_services import AssetClassesService
from investment_tracker.services.async_tasks_services import AsyncTasksService
from investment_tracker.utils.transactions_utils import to_lower_denomination


class CreateTransactionMutation(graphene.Mutation):
    class Arguments:
        supply_asset_id = graphene.ID(required=True)
        supply_value = graphene.Float(required=True)
        supply_base_conv_rate = graphene.Float(required=True)
        receive_asset_id = graphene.ID(required=True)
        receive_value = graphene.Float(required=True)
        receive_base_conv_rate = graphene.Float(required=True)
        transacted_at = graphene.DateTime(required=True)

    transaction = graphene.Field(TransactionsType)

    def mutate(
        self,
        info,
        supply_asset_id,
        supply_value,
        supply_base_conv_rate,
        receive_asset_id,
        receive_value,
        receive_base_conv_rate,
        transacted_at,
    ):
        base_asset_class = AssetClassesService().get_asset_class_by_name("Currency")
        transaction = TransactionsModel(
            supply_asset_id=supply_asset_id,
            supply_value=to_lower_denomination(supply_value, asset_id=supply_asset_id),
            supply_base_conv_rate=to_lower_denomination(supply_base_conv_rate, asset_class_dict=base_asset_class),
            receive_asset_id=receive_asset_id,
            receive_value=to_lower_denomination(receive_value, asset_id=receive_asset_id),
            receive_base_conv_rate=to_lower_denomination(receive_base_conv_rate, asset_class_dict=base_asset_class),
            transacted_at=transacted_at,
        )
        transaction = TransactionsAccessor().persist(transaction)
        async_task_id = AsyncTasksService().create_async_task(ASYNC_TASKS["COMPUTE_HOLDINGS"])
        compute_holdings_etl.delay(async_task_id, transacted_at)
        return CreateTransactionMutation(transaction=transaction)


class UpdateTransactionMutation(graphene.Mutation):
    class Arguments:
        transaction_id = graphene.ID(required=True)
        supply_asset_id = graphene.ID(required=True)
        supply_value = graphene.Float(required=True)
        supply_base_conv_rate = graphene.Float(required=True)
        receive_asset_id = graphene.ID(required=True)
        receive_value = graphene.Float(required=True)
        receive_base_conv_rate = graphene.Float(required=True)
        transacted_at = graphene.DateTime(required=True)

    ok = graphene.Boolean()

    def mutate(
        self,
        info,
        transaction_id,
        supply_asset_id,
        supply_value,
        supply_base_conv_rate,
        receive_asset_id,
        receive_value,
        receive_base_conv_rate,
        transacted_at,
    ):
        base_asset_class = AssetClassesService().get_asset_class_by_name("Currency")
        TransactionsAccessor().update_transaction(
            transaction_id,
            supply_asset_id=supply_asset_id,
            supply_value=to_lower_denomination(supply_value, asset_id=supply_asset_id),
            supply_base_conv_rate=to_lower_denomination(supply_base_conv_rate, asset_class_dict=base_asset_class),
            receive_asset_id=receive_asset_id,
            receive_value=to_lower_denomination(receive_value, asset_id=receive_asset_id),
            receive_base_conv_rate=to_lower_denomination(receive_base_conv_rate, asset_class_dict=base_asset_class),
            transacted_at=transacted_at,
        )
        async_task_id = AsyncTasksService().create_async_task(ASYNC_TASKS["COMPUTE_HOLDINGS"])
        compute_holdings_etl.delay(async_task_id, transacted_at)
        return UpdateTransactionMutation(ok=True)


class DeleteTransactionMutation(graphene.Mutation):
    class Arguments:
        transaction_id = graphene.ID(required=True)

    ok = graphene.Boolean()

    def mutate(self, info, transaction_id):
        try:
            transaction = TransactionsAccessor().get_transaction_by_id(transaction_id)
        except TransactionsModel.DoesNotExist:
            raise GraphQLError("Transaction doesn't exist!")
        transaction.delete()
        async_task_id = AsyncTasksService().create_async_task(ASYNC_TASKS["COMPUTE_HOLDINGS"])
        compute_holdings_etl.delay(async_task_id, transaction.transacted_at)
        return DeleteTransactionMutation(ok=True)


class TransactionsMutation(graphene.ObjectType):
    create_transaction = CreateTransactionMutation.Field()
    update_transaction = UpdateTransactionMutation.Field()
    delete_transaction = DeleteTransactionMutation.Field()
