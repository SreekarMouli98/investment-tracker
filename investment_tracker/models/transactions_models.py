from django.db import models


class TransactionsModel(models.Model):
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
    created_at = models.DateTimeField(null=False)
    knowledge_begin_date = models.DateTimeField(null=False)
    knowledge_end_date = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "transactions"
