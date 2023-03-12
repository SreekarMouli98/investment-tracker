from django.db import models


class AssetClassesModel(models.Model):
    name = models.CharField(max_length=128, null=False)
    decimal_places = models.IntegerField(null=False)

    class Meta:
        db_table = "asset_classes"


class AssetsModel(models.Model):
    name = models.CharField(max_length=128, null=False)
    ticker = models.CharField(max_length=128, null=False)
    asset_class = models.ForeignKey(
        AssetClassesModel, null=False, on_delete=models.CASCADE
    )
    country = models.ForeignKey(
        "investment_tracker.CountriesModel",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )

    class Meta:
        db_table = "assets"
