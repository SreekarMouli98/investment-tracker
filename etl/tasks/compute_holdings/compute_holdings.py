import decimal
from collections import defaultdict

from etl.tasks.base_etl import ETL
from investment_tracker.accessors import HoldingsAccessor, TransactionsAccessor
from investment_tracker.models.holdings_models import HoldingsModel


class ComputeHoldingsETL(ETL):
    def extract(self, start_date):
        depricate_holdings = HoldingsAccessor().get_holdings(after_date=start_date, id_only=True)
        previous_holdings = HoldingsAccessor().get_latest_holding_before_date(start_date)
        transactions_from_start_date = TransactionsAccessor().get_transactions(
            after_date=start_date, order_by=["transacted_at"]
        )
        return {
            "depricate_holdings": depricate_holdings,
            "previous_holdings": previous_holdings,
            "transactions_from_start_date": transactions_from_start_date,
        }

    def transform(self, data):
        depricate_holdings = data["depricate_holdings"]
        previous_holdings = data["previous_holdings"]
        transactions_from_start_date = data["transactions_from_start_date"]
        new_holdings = []
        holdings_map = defaultdict(lambda: decimal.Decimal(0))
        for holding in previous_holdings:
            holdings_map[holding.asset] = decimal.Decimal(holding.value)
        transcations_date_map = defaultdict(list)
        for transaction in transactions_from_start_date:
            transcations_date_map[transaction.transacted_at].append(transaction)
        dates_in_order = sorted(list(transcations_date_map.keys()))
        for date in dates_in_order:
            for transaction in transcations_date_map[date]:
                holdings_map[transaction.supply_asset] -= decimal.Decimal(transaction.supply_value)
                holdings_map[transaction.receive_asset] += decimal.Decimal(transaction.receive_value)
            for asset, value in holdings_map.items():
                if asset.ticker != "INR":
                    new_holdings.append(HoldingsModel(asset=asset, value=value, date=date))
        return {
            "depricate_holdings": depricate_holdings,
            "new_holdings": new_holdings,
        }

    def load(self, data):
        depricate_holdings = data["depricate_holdings"]
        new_holdings = data["new_holdings"]
        HoldingsAccessor().delete_holdings_by_ids(depricate_holdings)
        HoldingsModel.objects.bulk_create(new_holdings)
