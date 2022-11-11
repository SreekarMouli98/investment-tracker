import graphene

from investment_tracker.schema.counties_schema import CountriesType
from investment_tracker.accessors.countries_accessor import CountriesAccessor


class CountriesQuery(graphene.ObjectType):
    countries = graphene.List(CountriesType)

    def resolve_countries(self, info):
        return CountriesAccessor().get_countries()