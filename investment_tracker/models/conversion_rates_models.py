from django.db import models


class ConversionRatesModel(models.Model):
    from_asset = models.ForeignKey(
        "investment_tracker.AssetsModel",
        null=False,
        on_delete=models.CASCADE,
        related_name="conversion_rates_with_from",
    )
    to_asset = models.ForeignKey(
        "investment_tracker.AssetsModel",
        null=False,
        on_delete=models.CASCADE,
        related_name="conversion_rates_with_to",
    )
    conv_rate = models.CharField(max_length=50)
    date = models.DateField(null=False)

    class Meta:
        db_table = "conversion_rates"
