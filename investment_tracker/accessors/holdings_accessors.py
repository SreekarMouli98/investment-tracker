from django.db.models import Max

from investment_tracker.models import HoldingsModel


class HoldingsAccessor:
    def get_holdings(
        self,
        after_date=None,
        id_only=False,
        latest=False,
        limit=None,
        offset=None,
        order_by=None,
    ):
        qs = HoldingsModel.objects.filter()
        if after_date:
            qs = qs.filter(date__gte=after_date)
        if id_only:
            qs = qs.values_list("id", flat=True)
        if latest:
            res = HoldingsModel.objects.aggregate(Max("date"))
            exact_date = res["date__max"]
            qs = qs.filter(date=exact_date)
        if order_by:
            qs = qs.order_by(*order_by)
        if offset is not None and limit is not None:
            qs = qs[offset : offset + limit]
        return list(qs)

    def get_latest_holding_before_date(self, before_date):
        res = HoldingsModel.objects.filter(date__lt=before_date).aggregate(Max("date"))
        exact_date = res["date__max"]
        if not exact_date:
            return []
        qs = HoldingsModel.objects.filter(date=exact_date)
        return list(qs)

    def delete_holdings_by_ids(self, ids):
        qs = HoldingsModel.objects.filter(id__in=ids)
        return qs.delete()

    def count_holdings(self, latest=False):
        qs = HoldingsModel.objects.filter()
        if latest:
            res = HoldingsModel.objects.aggregate(Max("date"))
            exact_date = res["date__max"]
            qs = qs.filter(date=exact_date)
        return qs.count()
