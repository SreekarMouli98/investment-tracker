import pandas as pd
from datetime import datetime
from io import StringIO

from etl.tasks.base_etl import ETL
from etl.tasks.import_transactions.mixins.load_mixin import LoadMixin
from etl.utils.common_utils import decode_base64_data
from investment_tracker.accessors import AssetsAccessor, AssetClassesAccessor
from investment_tracker.models import AssetsModel, TransactionsModel
from investment_tracker.utils.transactions_utils import to_lower_denomination

VAULD_TABLE_COLS = {
    "S_NO": "S.No",
    "DATE_TIME": "Date & time",
    "ASSET_EXCHANGED_TOKEN": "Asset Exchanged (Token)",
    "ASSET_EXCHANGED_AMOUNT": "Asset Exchanged (Amount)",
    "ASSET_RECEIVED_TOKEN": "Asset Received (Token)",
    "ASSET_RECEIVED_AMOUNT": "Asset Received (Amount)",
    "CONVERSION_RATE": "Conversion Rate",
    "CURRENT_CONVERSION_RATE": "Current Conversion Rate",
    "CHANGE_IN_CONVERSION_CHANGE": "% Change in Conversion Change",
    "FEES_TOKEN": "Fees (Token)",
    "FEES_AMOUNT": "Fees (Amount)",
    "TYPE": "Type",
    "STATUS": "Status",
}


class ImportTransactionsFromVauldETL(LoadMixin, ETL):
    def extract(self, source_data: dict) -> list[dict]:
        """Extracts data from Vauld Tradebook xlsx"""
        data = {
            "crypto_exchanges": source_data.get("crypto_exchanges"),
            "fiat_exchanges": source_data.get("fiat_exchanges"),
        }
        for key, value in data.items():
            file_data = decode_base64_data(value)
            file_data = file_data.decode("utf-8")
            file_data_df = pd.read_csv(StringIO(file_data))
            data[key] = file_data_df.to_dict("records")
        return data

    def transform(self, extracted_data: list[dict]) -> dict:
        """Transforms extracted data from Vauld Tradebook xlsx"""
        asset_classes = AssetClassesAccessor().get_asset_classes()
        asset_classes_map = {asset_class.name: asset_class.id for asset_class in asset_classes}
        data = []
        for value in extracted_data.values():
            data.extend(value)
        transactions_df = pd.DataFrame(data, columns=list(VAULD_TABLE_COLS.values()))
        tickers = set(
            transactions_df[VAULD_TABLE_COLS["ASSET_EXCHANGED_TOKEN"]].tolist()
            + transactions_df[VAULD_TABLE_COLS["ASSET_RECEIVED_TOKEN"]].tolist()
        )
        existing_assets = AssetsAccessor().get_assets(tickers=list(tickers) + ["INR"])
        assets_map = {asset.ticker: asset for asset in existing_assets}
        missing_assets = tickers.difference(assets_map.keys())
        new_assets = []
        for ticker in missing_assets:
            asset = AssetsModel(name=ticker, ticker=ticker, asset_class_id=asset_classes_map["Crypto"])
            assets_map[ticker] = asset
            new_assets.append(asset)
        transactions_df["supply_asset"] = transactions_df.apply(
            lambda row: assets_map[row[VAULD_TABLE_COLS["ASSET_EXCHANGED_TOKEN"]]],
            axis=1,
        )
        transactions_df["supply_value"] = transactions_df.apply(
            lambda row: to_lower_denomination(
                row[VAULD_TABLE_COLS["ASSET_EXCHANGED_AMOUNT"]],
                asset=assets_map[row[VAULD_TABLE_COLS["ASSET_EXCHANGED_TOKEN"]]],
            ),
            axis=1,
        )
        transactions_df["receive_asset"] = transactions_df.apply(
            lambda row: assets_map[row[VAULD_TABLE_COLS["ASSET_RECEIVED_TOKEN"]]],
            axis=1,
        )
        transactions_df["receive_value"] = transactions_df.apply(
            lambda row: to_lower_denomination(
                row[VAULD_TABLE_COLS["ASSET_RECEIVED_AMOUNT"]],
                asset=assets_map[row[VAULD_TABLE_COLS["ASSET_RECEIVED_TOKEN"]]],
            ),
            axis=1,
        )
        transactions_df["transacted_at"] = transactions_df.apply(
            lambda row: datetime.strptime(
                row[VAULD_TABLE_COLS["DATE_TIME"]].replace("(India Standard Time)", "").rstrip(),
                "%a %b %d %Y %H:%M:%S %Z%z",
            ),
            axis=1,
        )
        transactions_df = transactions_df.drop(columns=list(VAULD_TABLE_COLS.values()))
        transactions = transactions_df.to_dict("records")
        transactions = [TransactionsModel(**transaction) for transaction in transactions]
        return {"transactions": transactions, "assets": new_assets}
