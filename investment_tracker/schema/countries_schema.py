from graphene_django.types import DjangoObjectType

from investment_tracker.models.countries_models import CountriesModel


class CountriesType(DjangoObjectType):
    class Meta:
        model = CountriesModel
