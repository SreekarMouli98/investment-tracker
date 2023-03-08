import decimal
from collections import defaultdict
from django.db import transaction

from etl.tasks.base_etl import ETL
from investment_tracker.accessors import HoldingsAccessor, TransactionsAccessor
from investment_tracker.models.holdings_models import HoldingsModel
from investment_tracker.utils.transactions_utils import calculate_average_buy, get_base_asset, to_higher_denomination


class ComputeHoldingsETL(ETL):
    def extract(self, start_date):
        base_asset = get_base_asset()
        depricate_holdings = HoldingsAccessor().get_holdings(after_date=start_date, id_only=True)
        previous_holdings = HoldingsAccessor().get_latest_holding_before_date(start_date)
        transactions_from_start_date = TransactionsAccessor().get_transactions(
            after_date=start_date, order_by=["transacted_at"]
        )
        return {
            "base_asset": base_asset,
            "depricate_holdings": depricate_holdings,
            "previous_holdings": previous_holdings,
            "transactions_from_start_date": transactions_from_start_date,
        }

    def transform(self, data):
        base_asset = data["base_asset"]
        depricate_holdings = data["depricate_holdings"]
        previous_holdings = data["previous_holdings"]
        transactions_from_start_date = data["transactions_from_start_date"]
        new_holdings = []
        holdings_map = defaultdict(lambda: {"value": decimal.Decimal(0), "average_buy": decimal.Decimal(0)})
        for holding in previous_holdings:
            holdings_map[holding.asset]["value"] = decimal.Decimal(holding.value)
            holdings_map[holding.asset]["average_buy"] = decimal.Decimal(holding.average_buy)
        transcations_date_map = defaultdict(list)
        for transaction in transactions_from_start_date:
            transcations_date_map[transaction.transacted_at].append(transaction)
        dates_in_order = sorted(list(transcations_date_map.keys()))
        for date in dates_in_order:
            for transaction in transcations_date_map[date]:
                supply_asset = transaction.supply_asset
                supply_value = decimal.Decimal(transaction.supply_value)
                receive_asset = transaction.receive_asset
                receive_value = decimal.Decimal(transaction.receive_value)
                receive_base_conv_rate = decimal.Decimal(transaction.receive_base_conv_rate)
                holdings_map[supply_asset]["value"] -= supply_value
                holdings_map[receive_asset]["average_buy"] = calculate_average_buy(
                    holdings_map[receive_asset]["average_buy"],
                    holdings_map[receive_asset]["value"],
                    receive_value,
                    receive_value * receive_base_conv_rate,
                )
                holdings_map[receive_asset]["value"] += receive_value
            for asset, holding in holdings_map.items():
                if asset.ticker != base_asset.ticker:
                    new_holdings.append(
                        HoldingsModel(
                            asset=asset,
                            value=holding["value"],
                            average_buy=round(holding["average_buy"]),
                            date=date,
                            value_in_base=round(
                                to_higher_denomination(holding["value"], asset_class_instance=asset.asset_class)
                                * holding["average_buy"]
                            ),
                        )
                    )
        return {
            "depricate_holdings": depricate_holdings,
            "new_holdings": new_holdings,
        }

    @transaction.atomic
    def load(self, data):
        depricate_holdings = data["depricate_holdings"]
        new_holdings = data["new_holdings"]
        HoldingsAccessor().delete_holdings_by_ids(depricate_holdings)
        HoldingsModel.objects.bulk_create(new_holdings)
