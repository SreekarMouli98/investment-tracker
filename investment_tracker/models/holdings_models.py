from django.db import models


class HoldingsModel(models.Model):
    asset = models.ForeignKey(
        "investment_tracker.AssetsModel",
        null=False,
        on_delete=models.CASCADE,
    )
    value = models.CharField(max_length=36, null=False)
    date = models.DateTimeField(null=False)

    class Meta:
        db_table = "holdings"
