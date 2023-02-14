from django.db.models import Max

from investment_tracker.models import HoldingsModel


class HoldingsAccessor:
    def get_holdings(self, after_date, id_only=False):
        qs = HoldingsModel.objects.filter()
        if after_date:
            qs = qs.filter(date__gte=after_date)
        if id_only:
            qs = qs.values_list("id", flat=True)
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
