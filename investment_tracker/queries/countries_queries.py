import graphene

from investment_tracker.accessors.countries_accessor import CountriesAccessor
from investment_tracker.schema.countries_schema import CountriesType


class CountriesQuery(graphene.ObjectType):
    countries = graphene.List(CountriesType)

    def resolve_countries(self, info):
        return CountriesAccessor().get_countries()
