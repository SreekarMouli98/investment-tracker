from django.db.models import Q

from investment_tracker.models import ConversionRatesModel


class ConversionRatesAccessor:
    def persist(self, conversion_rate):
        conversion_rate.save()
        return conversion_rate

    def get_conversion_rate(self, between=None, date=None):
        qs = ConversionRatesModel.objects.filter()
        if between:
            qs = qs.filter(
                Q(from_asset=between[0], to_asset=between[1]) | Q(from_asset=between[1], to_asset=between[0])
            )
        if date:
            qs = qs.filter(date=date)
        return qs.first()
