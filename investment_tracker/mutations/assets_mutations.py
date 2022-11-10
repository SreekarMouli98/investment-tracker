import graphene
from graphql import GraphQLError

from investment_tracker.schema.assets_schema import AssetClassesType, AssetsType
from investment_tracker.models.assets_models import AssetClassesModel, AssetsModel
from investment_tracker.accessors.assets_accessors import AssetClassesAccessor, AssetsAccessor


class CreateAssetClassMutation(graphene.Mutation):
    class Arguments:
        name = graphene.String(required=True)
        decimal_places = graphene.Int(required=True)

    asset_class = graphene.Field(AssetClassesType)

    def mutate(self, info, name, decimal_places):
        asset_class = AssetClassesModel(name=name, decimal_places=decimal_places)
        asset_class = AssetClassesAccessor().persist(asset_class)
        return CreateAssetClassMutation(asset_class=asset_class)


class UpdateAssetClassMutation(graphene.Mutation):
    class Arguments:
        asset_class_id = graphene.ID(required=True)
        name = graphene.String(required=True)
        decimal_places = graphene.Int(required=True)

    ok = graphene.Boolean()

    def mutate(self, info, asset_class_id, name, decimal_places):
        AssetClassesAccessor().update_asset_class(asset_class_id, name=name, decimal_places=decimal_places)
        return UpdateAssetClassMutation(ok=True)


class DeleteAssetClassMutation(graphene.Mutation):
    class Arguments:
        asset_class_id = graphene.ID(required=True)

    ok = graphene.Boolean()

    def mutate(self, info, asset_class_id):
        try:
            asset_class = AssetClassesAccessor().get_asset_class_by_id(asset_class_id)
        except AssetClassesModel.DoesNotExist:
            raise GraphQLError("Asset Class doesn't exist!")
        asset_class.delete()
        return DeleteAssetClassMutation(ok=True)


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
        identity = graphene.String(required=True)
        asset_class = graphene.Int(required=True)
        origin = graphene.Int(required=True)

    ok = graphene.Boolean()

    def mutate(self, info, asset_id, identity, asset_class, origin):
        if not identity:
            raise GraphQLError("Invalid identity!")
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
    create_asset_class = CreateAssetClassMutation.Field()
    update_asset_class = UpdateAssetClassMutation.Field()
    delete_asset_class = DeleteAssetClassMutation.Field()
    create_asset = CreateAssetMutation.Field()
    update_asset = UpdateAssetMutation.Field()
    delete_asset = DeleteAssetMutation.Field()
