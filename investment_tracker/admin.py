from django.contrib import admin

from investment_tracker.models import *

admin.site.register(CountriesModel)
admin.site.register(AssetClassesModel)
admin.site.register(AssetsModel)
admin.site.register(TransactionsModel)
