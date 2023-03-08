from django.db import models


class HoldingsModel(models.Model):
    asset = models.ForeignKey(
        "investment_tracker.AssetsModel",
        null=False,
        on_delete=models.CASCADE,
    )
    value = models.CharField(max_length=50, null=False)
    date = models.DateTimeField(null=False)
    average_buy = models.CharField(max_length=50, null=False)
    value_in_base = models.CharField(max_length=50, null=False)

    class Meta:
        db_table = "holdings"
