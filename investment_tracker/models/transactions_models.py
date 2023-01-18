from django.db import models


class TransactionsModel(models.Model):
    """
    Supply & Receive values will be stored with the lowest denomation to avoid any
    float point issues.
    For e.g.,
        10 Rupees will be stored as 1000 Paise.
    """

    supply_asset = models.ForeignKey(
        "investment_tracker.AssetsModel",
        null=False,
        on_delete=models.CASCADE,
        related_name="transactions_with_supplied",
    )
    supply_value = models.BigIntegerField(null=False)
    receive_asset = models.ForeignKey(
        "investment_tracker.AssetsModel",
        null=False,
        on_delete=models.CASCADE,
        related_name="transactions_with_received",
    )
    receive_value = models.BigIntegerField(null=False)
    transacted_at = models.DateTimeField(null=False)

    class Meta:
        db_table = "transactions"
