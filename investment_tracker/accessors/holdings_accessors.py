from django.db.models import Max

from investment_tracker.models import HoldingsModel


class HoldingsAccessor:
    def get_holdings(
        self,
        latest=False,
        latest_before_date=None,
        after_date=None,
        id_only=False,
        limit=None,
        offset=None,
        order_by=None,
    ):
        qs = HoldingsModel.objects.filter()
        if latest:
            res = self.get_latest_holding_date()
            exact_date = res["date__max"]
            qs = qs.filter(date=exact_date)
        if latest_before_date:
            res = self.get_latest_holding_date(before_date=latest_before_date)
            exact_date = res["date__max"]
            qs = qs.filter(date=exact_date)
        if after_date:
            qs = qs.filter(date__gte=after_date)
        if id_only:
            qs = qs.values_list("id", flat=True)
        if order_by:
            qs = qs.order_by(*order_by)
        if offset is not None and limit is not None:
            qs = qs[offset : offset + limit]
        return list(qs)

    def get_latest_holding_date(self, before_date=None):
        qs = HoldingsModel.objects.filter()
        if before_date:
            qs = qs.filter(date__lt=before_date)
        res = qs.aggregate(Max("date"))
        return res

    def delete_holdings_by_ids(self, ids):
        qs = HoldingsModel.objects.filter(id__in=ids)
        return qs.delete()

    def count_holdings(self, latest=False):
        qs = HoldingsModel.objects.filter()
        if latest:
            res = self.get_latest_holding_date()
            exact_date = res["date__max"]
            qs = qs.filter(date=exact_date)
        return qs.count()
