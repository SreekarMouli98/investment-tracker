from investment_tracker.models import AssetsModel, TransactionsModel


class LoadMixin:
    def load(self, transformed_data: dict) -> None:
        """Loads transactions to database"""
        assets = transformed_data.get("assets", [])
        AssetsModel.objects.bulk_create(assets)
        transactions = transformed_data.get("transactions", [])
        TransactionsModel.objects.bulk_create(transactions)
