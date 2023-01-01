from investment_tracker.models.countries_models import CountriesModel


class CountriesAccessor:
    def get_countries(self):
        qs = CountriesModel.objects.all()
        return list(qs)
