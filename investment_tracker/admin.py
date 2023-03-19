from django.contrib import admin

from investment_tracker.models import AssetClassesModel
from investment_tracker.models import AssetsModel
from investment_tracker.models import AsyncTasksModel
from investment_tracker.models import ConversionRatesModel
from investment_tracker.models import CountriesModel
from investment_tracker.models import HoldingsModel
from investment_tracker.models import TransactionsModel

admin.site.register(AssetClassesModel)
admin.site.register(AssetsModel)
admin.site.register(AsyncTasksModel)
admin.site.register(ConversionRatesModel)
admin.site.register(CountriesModel)
admin.site.register(HoldingsModel)
admin.site.register(TransactionsModel)
