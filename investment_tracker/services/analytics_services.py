import pandas as pd
from django.db import connection

from investment_tracker.utils.transactions_utils import calculate_change_rate
from investment_tracker.utils.transactions_utils import get_base_asset
from investment_tracker.utils.transactions_utils import to_higher_denomination


class AnalyticsService:
    def get_invested_amount(self):
        res = {"value": 0, "change": 0}
        base_asset = get_base_asset()
        current_invested_amount_sql = """
            SELECT SUM(value_in_base::int)
            FROM holdings
            WHERE
                date = (
                    SELECT MAX(date)
                    FROM holdings
                )
        """
        previous_invested_amount_sql = """
            SELECT SUM(value_in_base::int)
            FROM holdings
            WHERE
                date = (
                    SELECT MAX(date)
                    FROM holdings
                    WHERE
                        date < (
                            SELECT MAX(date)
                            FROM holdings
                        )
                )
        """
        with connection.cursor() as cursor:
            cursor.execute(current_invested_amount_sql)
            current_invested_amount_res = cursor.fetchone()
            if not current_invested_amount_res[0]:
                return res
            current_invested_amount = to_higher_denomination(
                current_invested_amount_res[0],
                asset_class_instance=base_asset.asset_class,
            )
            res["value"] = float(current_invested_amount)
            cursor.execute(previous_invested_amount_sql)
            previous_invested_amount_res = cursor.fetchone()
            if not previous_invested_amount_res[0]:
                return res
            previous_invested_amount = to_higher_denomination(
                previous_invested_amount_res[0],
                asset_class_instance=base_asset.asset_class,
            )
            change = calculate_change_rate(
                current_invested_amount, previous_invested_amount
            )
            res["change"] = float(change)
        return res

    def get_total_assets(self):
        res = {"value": 0, "change": 0}
        current_assets_count_sql = """
            SELECT COUNT(id)
            FROM holdings
            WHERE
                date = (
                    SELECT MAX(date)
                    FROM holdings
                )
        """
        previous_assets_count_sql = """
            SELECT COUNT(id)
            FROM holdings
            WHERE
                date = (
                    SELECT MAX(date)
                    FROM holdings
                    WHERE
                        date < (
                            SELECT MAX(date)
                            FROM holdings
                        )
                )
        """
        with connection.cursor() as cursor:
            cursor.execute(current_assets_count_sql)
            current_assets_count_res = cursor.fetchone()
            current_assets_count = current_assets_count_res[0]
            cursor.execute(previous_assets_count_sql)
            previous_assets_count_res = cursor.fetchone()
            previous_assets_count = previous_assets_count_res[0]
            change = calculate_change_rate(current_assets_count, previous_assets_count)
            res["value"] = current_assets_count
            res["change"] = change
        return res

    def get_asset_class_diversification(self):
        res = []
        base_asset = get_base_asset()
        grouped_holdings_sql = """
            SELECT
                asset_classes.name,
                SUM(holdings.value_in_base::int)
            FROM holdings
            LEFT JOIN assets
                ON (
                    holdings.asset_id = assets.id
                )
            LEFT JOIN asset_classes
                ON (
                    assets.asset_class_id = asset_classes.id
                )
            WHERE
                date = (
                    SELECT MAX(date)
                    FROM holdings
                )
            GROUP BY asset_classes.name
        """
        with connection.cursor() as cursor:
            cursor.execute(grouped_holdings_sql)
            grouped_holdings_res = cursor.fetchall()
            grouped_holdings_df = pd.DataFrame(
                grouped_holdings_res, columns=["name", "value"]
            )
            if grouped_holdings_df.empty:
                return res
            grouped_holdings_df["id"] = grouped_holdings_df["name"]
            grouped_holdings_df["value"] = grouped_holdings_df["value"].apply(
                lambda val: float(
                    to_higher_denomination(
                        val, asset_class_instance=base_asset.asset_class
                    )
                )
            )
            total = grouped_holdings_df["value"].sum()
            grouped_holdings_df["percentage"] = (
                grouped_holdings_df["value"] / total * 100
            )
            res = grouped_holdings_df.to_dict("records")
            return res

    def get_networth_growth(self):
        res = []
        base_asset = get_base_asset()
        networth_growth_sql = """
            SELECT
                date,
                SUM(value_in_base::int) AS "value"
            FROM holdings
            WHERE
                date in (
                    SELECT MAX(date)
                    FROM holdings
                    GROUP BY TO_CHAR(date, 'yyyy-mm')
                    LIMIT 10
                )
            GROUP BY date
            ORDER BY date
        """
        with connection.cursor() as cursor:
            cursor.execute(networth_growth_sql)
            networth_growth_res = cursor.fetchall()
            columns = ["date", "value"]
            networth_growth_df = pd.DataFrame(networth_growth_res, columns=columns)
            if networth_growth_df.empty:
                return res
            networth_growth_df["x"] = networth_growth_df["date"].apply(
                lambda date: date.strftime("%b %Y")
            )
            networth_growth_df["y"] = networth_growth_df["value"].apply(
                lambda value: float(
                    to_higher_denomination(
                        value, asset_class_instance=base_asset.asset_class
                    )
                )
            )
            networth_growth_df = networth_growth_df.drop(columns=columns)
            networth_growth = networth_growth_df.to_dict("records")
            res.append({"id": "Networth", "data": networth_growth})
            return res

    def get_assets_tree_map(self):
        res = {}
        base_asset = get_base_asset()
        all_assets_sql = """
            SELECT
                asset_classes.name,
                assets.name,
                holdings.value_in_base::int
            FROM holdings
            LEFT JOIN assets
                ON (
                    holdings.asset_id = assets.id
                )
            LEFT JOIN asset_classes
                ON (
                    assets.asset_class_id = asset_classes.id
                )
            WHERE
                date = (
                    SELECT MAX(date)
                    FROM holdings
                )
        """
        with connection.cursor() as cursor:
            cursor.execute(all_assets_sql)
            all_assets_res = cursor.fetchall()
            all_assets_df = pd.DataFrame(
                all_assets_res, columns=["asset_class", "name", "loc"]
            )
            if all_assets_df.empty:
                return res
            all_assets_df["loc"] = all_assets_df["loc"].apply(
                lambda val: float(
                    to_higher_denomination(
                        val, asset_class_instance=base_asset.asset_class
                    )
                )
            )
            all_assets = (
                all_assets_df.groupby("asset_class")[["name", "loc"]]
                .apply(lambda df: df.to_dict("records"))
                .to_dict()
            )
            res = {
                "name": "Assets",
                "children": [
                    {
                        "name": asset_class_name,
                        "children": children,
                    }
                    for asset_class_name, children in all_assets.items()
                ],
            }
            return res
