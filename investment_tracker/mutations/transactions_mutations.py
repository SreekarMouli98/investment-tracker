import graphene
from graphql import GraphQLError

from investment_tracker.schema.transactions_schema import TransactionsType
from investment_tracker.models.transactions_models import TransactionsModel
from investment_tracker.accessors.transactions_accessors import TransactionsAccessor
from investment_tracker.utils.transactions_utils import to_lower_denomination


class CreateTransactionMutation(graphene.Mutation):
    class Arguments:
        supply_asset_id = graphene.ID(required=True)
        supply_value = graphene.Float(required=True)
        receive_asset_id = graphene.ID(required=True)
        receive_value = graphene.Float(required=True)
        transacted_at = graphene.DateTime(required=True)

    transaction = graphene.Field(TransactionsType)

    def mutate(self, info, supply_asset_id, supply_value, receive_asset_id, receive_value, transacted_at):
        transaction = TransactionsModel(
            supply_asset_id=supply_asset_id,
            supply_value=to_lower_denomination(supply_value, asset_id=supply_asset_id),
            receive_asset_id=receive_asset_id,
            receive_value=to_lower_denomination(receive_value, asset_id=receive_asset_id),
            transacted_at=transacted_at,
        )
        transaction = TransactionsAccessor().persist(transaction)
        return CreateTransactionMutation(transaction=transaction)


class UpdateTransactionMutation(graphene.Mutation):
    class Arguments:
        transaction_id = graphene.ID(required=True)
        supply_asset_id = graphene.ID(required=True)
        supply_value = graphene.Float(required=True)
        receive_asset_id = graphene.ID(required=True)
        receive_value = graphene.Float(required=True)
        transacted_at = graphene.DateTime(required=True)

    ok = graphene.Boolean()

    def mutate(
        self, info, transaction_id, supply_asset_id, supply_value, receive_asset_id, receive_value, transacted_at
    ):
        TransactionsAccessor().update_transaction(
            transaction_id,
            supply_asset_id=supply_asset_id,
            supply_value=to_lower_denomination(supply_value, asset_id=supply_asset_id),
            receive_asset_id=receive_asset_id,
            receive_value=to_lower_denomination(receive_value, asset_id=receive_asset_id),
            transacted_at=transacted_at,
        )
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
        return DeleteTransactionMutation(ok=True)


class TransactionsMutation(graphene.ObjectType):
    create_transaction = CreateTransactionMutation.Field()
    update_transaction = UpdateTransactionMutation.Field()
    delete_transaction = DeleteTransactionMutation.Field()
