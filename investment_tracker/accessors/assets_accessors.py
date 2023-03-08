import pydash
from django.db.models import Q

from investment_tracker.models.assets_models import AssetClassesModel, AssetsModel


class AssetClassesAccessor:
    def get_asset_classes(self, as_dicts=False):
        qs = AssetClassesModel.objects.all()
        if as_dicts:
            qs = qs.values()
        return list(qs)

    def get_asset_class_by_id(self, asset_class_id):
        return AssetClassesModel.objects.get(id=asset_class_id)

    def persist(self, asset_class):
        asset_class.save()
        return asset_class

    def update_asset_class(self, asset_class_id, **updates):
        return AssetClassesModel.objects.filter(id=asset_class_id).update(**updates)


class AssetsAccessor:
    def get_assets(
        self, limit=None, offset=None, asset_classes=None, countries=None, tickers=None, search_text=None, order_by=None
    ):
        qs = AssetsModel.objects.all()
        if asset_classes:
            qs = qs.filter(asset_class__id__in=asset_classes)
        if countries:
            include_no_country = None in countries
            countries = pydash.compact(countries)
            if countries and include_no_country:
                qs = qs.filter(Q(country__id__in=countries) | Q(country__isnull=True))
            elif countries:
                qs = qs.filter(country__id__in=countries)
            elif include_no_country:
                qs = qs.filter(country__isnull=True)
        if tickers:
            qs = qs.filter(ticker__in=tickers)
        if search_text:
            qs = qs.filter(Q(name__icontains=search_text) | Q(ticker__icontains=search_text))
        if order_by:
            qs = qs.order_by(*order_by)
        if limit is not None and offset is not None:
            qs = qs[offset : offset + limit]
        return list(qs)

    def count_assets(self, asset_classes=None, countries=None, search_text=None):
        qs = AssetsModel.objects.all()
        if asset_classes:
            qs = qs.filter(asset_class__id__in=asset_classes)
        if countries:
            qs = qs.filter(country__id__in=countries)
        if search_text:
            qs = qs.filter(Q(name__icontains=search_text) | Q(ticker__icontains=search_text))
        return qs.count()

    def get_asset_by_id(self, asset_id):
        return AssetsModel.objects.get(id=asset_id)

    def persist(self, asset):
        asset.save()
        return asset

    def update_asset(self, asset_id, **updates):
        return AssetsModel.objects.filter(id=asset_id).update(**updates)
