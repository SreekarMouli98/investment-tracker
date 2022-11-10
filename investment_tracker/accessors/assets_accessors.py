from investment_tracker.models.assets_models import AssetClassesModel, AssetsModel


class AssetClassesAccessor:
    def get_asset_classes(self):
        qs = AssetClassesModel.objects.all()
        return list(qs)

    def get_asset_class_by_id(self, asset_class_id):
        return AssetClassesModel.objects.get(id=asset_class_id)

    def persist(self, asset_class):
        asset_class.save()
        return asset_class

    def update_asset_class(self, asset_class_id, **updates):
        return AssetClassesModel.objects.filter(id=asset_class_id).update(**updates)


class AssetsAccessor:
    def get_assets(self, annotate=None, as_dicts=False, projection=None):
        qs = AssetsModel.objects.all()
        if annotate:
            qs = qs.annotate(**annotate)
        if projection:
            qs = qs.values(*projection)
        if as_dicts:
            qs = qs.values()
        return list(qs)

    def get_asset_by_id(self, asset_id):
        return AssetsModel.objects.get(id=asset_id)

    def persist(self, asset):
        asset.save()
        return asset

    def update_asset(self, asset_id, **updates):
        return AssetsModel.objects.filter(id=asset_id).update(**updates)
