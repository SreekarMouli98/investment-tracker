import base64
import pandas as pd
import traceback
from datetime import datetime
from django.utils.timezone import make_aware
from io import BytesIO
from openpyxl import load_workbook
from celery import shared_task

from investment_tracker.accessors import AssetsAccessor, AssetClassesAccessor, CountriesAccessor
from investment_tracker.models import AssetsModel, TransactionsModel
from investment_tracker.services import AsyncTasksService
from investment_tracker.utils.transactions_utils import to_lower_denomination


def extract(source_data: str) -> list[dict]:
    """Extracts data from Zerodha Tradebook xlsx"""
    _, file_data = source_data.split(";base64,")
    data = BytesIO(base64.b64decode(file_data))
    wb = load_workbook(filename=data, read_only=True)
    table_cols = (
        "Order No.",
        "Order Time.",
        "Trade No.",
        "Trade Time",
        "Security/Contract Description",
        "Buy(B) / Sell(S)",
        "Quantity",
        "Gross Rate / Trade Price Per Unit (Rs)",
        "Brokerage per Unit (Rs)",
        "Net Rate per Unit (Rs)",
        "Closing Rate per Unit (Only for Derivatives) (Rs)",
        "Net Total (Before Levies) (Rs)",
        "Remarks",
        "ISIN",
    )
    data = []
    for sheetname in wb.sheetnames:
        found_cols = False
        found_data = False
        sheet = wb[sheetname]
        sheet_transactions = []
        for row in sheet.values:
            if found_data and row[0] is None:
                break
            elif found_data:
                sheet_transactions.append(row)
            elif found_cols and not found_data:
                found_data = True
            elif row == table_cols:
                found_cols = True
        sheet_transactions_df = pd.DataFrame(sheet_transactions, columns=table_cols)
        sheet_transactions_df["Date"] = sheetname
        data.extend(sheet_transactions_df.to_dict("records"))
    return data


def transform(extracted_data: list[dict]) -> dict:
    """Transforms extracted data from Zerodha Tradebook xlsx"""
    asset_classes = AssetClassesAccessor().get_asset_classes()
    asset_classes_map = {asset_class.name: asset_class.id for asset_class in asset_classes}
    countries = CountriesAccessor().get_countries()
    countries_map = {country.code: country.id for country in countries}
    table_cols = (
        "Order No.",
        "Order Time.",
        "Trade No.",
        "Trade Time",
        "Security/Contract Description",
        "Buy(B) / Sell(S)",
        "Quantity",
        "Gross Rate / Trade Price Per Unit (Rs)",
        "Brokerage per Unit (Rs)",
        "Net Rate per Unit (Rs)",
        "Closing Rate per Unit (Only for Derivatives) (Rs)",
        "Net Total (Before Levies) (Rs)",
        "Remarks",
        "ISIN",
        "Date",
    )
    transactions_df = pd.DataFrame(extracted_data, columns=table_cols)
    transactions_df["Security/Contract Description"] = transactions_df["Security/Contract Description"].apply(
        lambda item: item.split()[0]
    )
    tickers = set(transactions_df["Security/Contract Description"].tolist())
    existing_assets = AssetsAccessor().get_assets(tickers=list(tickers) + ["INR"])
    assets_map = {asset.ticker: asset for asset in existing_assets}
    missing_assets = tickers.difference(assets_map.keys())
    new_assets = []
    for ticker in missing_assets:
        asset = AssetsModel(
            name=ticker, ticker=ticker, asset_class_id=asset_classes_map["Stock"], country_id=countries_map["IND"]
        )
        assets_map[ticker] = asset
        new_assets.append(asset)
    transactions_df["supply_asset"] = transactions_df.apply(
        lambda row: assets_map["INR"]
        if row["Buy(B) / Sell(S)"] in ("buy", "B")
        else assets_map[row["Security/Contract Description"]],
        axis=1,
    )
    transactions_df["supply_value"] = transactions_df.apply(
        lambda row: to_lower_denomination(row["Net Total (Before Levies) (Rs)"], asset=assets_map["INR"]) * -1
        if row["Buy(B) / Sell(S)"] in ("buy", "B")
        else to_lower_denomination(row["Quantity"], asset=assets_map[row["Security/Contract Description"]]),
        axis=1,
    )
    transactions_df["receive_asset"] = transactions_df.apply(
        lambda row: assets_map[row["Security/Contract Description"]]
        if row["Buy(B) / Sell(S)"] in ("buy", "B")
        else assets_map["INR"],
        axis=1,
    )
    transactions_df["receive_value"] = transactions_df.apply(
        lambda row: to_lower_denomination(row["Quantity"], asset=assets_map[row["Security/Contract Description"]])
        if row["Buy(B) / Sell(S)"] in ("buy", "B")
        else to_lower_denomination(row["Net Total (Before Levies) (Rs)"], asset=assets_map["INR"]),
        axis=1,
    )
    transactions_df["transacted_at"] = transactions_df.apply(
        lambda row: make_aware(datetime.strptime(row["Date"], "%d-%m-%Y")),
        axis=1,
    )
    transactions_df = transactions_df.drop(columns=list(table_cols))
    transactions = transactions_df.to_dict("records")
    transactions = [TransactionsModel(**transaction) for transaction in transactions]
    return {"transactions": transactions, "assets": new_assets}


def load(transformed_data: dict) -> None:
    """Loads transactions to database"""
    assets = transformed_data.get("assets", [])
    AssetsModel.objects.bulk_create(assets)
    transactions = transformed_data.get("transactions", [])
    TransactionsModel.objects.bulk_create(transactions)


@shared_task
def run(async_task_id: int, source_data: str) -> None:
    try:
        AsyncTasksService().set_in_progress(async_task_id, percentage=25)
        extracted_data = extract(source_data)
        AsyncTasksService().update_progress(async_task_id, 50)
        transformed_data = transform(extracted_data)
        AsyncTasksService().update_progress(async_task_id, 75)
        load(transformed_data)
        AsyncTasksService().set_completed(async_task_id)
    except Exception as ex:
        traceback.print_exc()
        AsyncTasksService().set_failed(async_task_id)
