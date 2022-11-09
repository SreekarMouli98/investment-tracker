import graphene
from graphql import GraphQLError

from investment_tracker.models.assets_models import AssetsModel
from investment_tracker.schema.assets_schema import AssetsType
from investment_tracker.accessors.assets_accessors import AssetsAccessor


class CreateAssetMutation(graphene.Mutation):
    class Arguments:
        identity = graphene.String(required=True)
        asset_class = graphene.Int(required=True)
        origin = graphene.Int(required=False, default_value=-1)

    asset = graphene.Field(AssetsType)

    def mutate(self, info, identity, asset_class, origin):
        origin = None if origin == -1 else origin
        asset = AssetsModel(identity=identity, asset_class_id=asset_class, origin_id=origin)
        asset = AssetsAccessor().persist(asset)
        return CreateAssetMutation(asset=asset)


class UpdateAssetMutation(graphene.Mutation):
    class Arguments:
        asset_id = graphene.ID(required=True)
        identity = graphene.String(required=False, default_value="")
        asset_class = graphene.Int(required=False, default_value=-1)
        origin = graphene.Int(required=False, default_value=-1)

    ok = graphene.Boolean()

    def mutate(self, info, asset_id, identity, asset_class, origin):
        if not identity:
            raise GraphQLError("Invalid identity!")
        asset_class = None if asset_class == -1 else asset_class
        origin = None if origin == -1 else origin
        AssetsAccessor().update_asset(asset_id, identity=identity, asset_class_id=asset_class, origin_id=origin)
        return UpdateAssetMutation(ok=True)


class DeleteAssetMutation(graphene.Mutation):
    class Arguments:
        asset_id = graphene.ID(required=True)

    ok = graphene.Boolean()

    def mutate(self, info, asset_id):
        try:
            asset = AssetsAccessor().get_asset_by_id(asset_id)
        except AssetsModel.DoesNotExist:
            raise GraphQLError("Asset doesn't exist!")
        asset.delete()
        return DeleteAssetMutation(ok=True)


class AssetsMutation(graphene.ObjectType):
    create_asset = CreateAssetMutation.Field()
    update_asset = UpdateAssetMutation.Field()
    delete_asset = DeleteAssetMutation.Field()
