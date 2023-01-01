from django.db import models


class CountriesModel(models.Model):
    name = models.CharField(max_length=128, null=False)
    code = models.CharField(max_length=128, null=False)

    class Meta:
        db_table = "countries"
