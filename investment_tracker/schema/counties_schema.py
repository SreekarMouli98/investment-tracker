from graphene_django.types import DjangoObjectType

from investment_tracker.models.counties_models import CountriesModel


class CountiesType(DjangoObjectType):
    class Meta:
        model = CountriesModel
