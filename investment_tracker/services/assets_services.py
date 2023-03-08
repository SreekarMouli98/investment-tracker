from django.core.cache import cache

from investment_tracker.accessors.assets_accessors import AssetClassesAccessor
from investment_tracker.constants import CACHE_KEYS


class AssetClassesService:
    def get_asset_class_by_name(self, name):
        asset_classes = cache.get(CACHE_KEYS["ASSET_CLASSES"])
        if not asset_classes:
            asset_classes = AssetClassesAccessor().get_asset_classes(as_dicts=True)
            cache.set(CACHE_KEYS["ASSET_CLASSES"], asset_classes)
        asset_classes_map = {asset_class["name"]: asset_class for asset_class in asset_classes}
        return asset_classes_map[name]
