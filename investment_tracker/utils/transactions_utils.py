import decimal

from investment_tracker.accessors import AssetsAccessor

decimal.getcontext().prec = 38


def to_lower_denomination(value, asset_id=None, asset=None, asset_class_dict=None):
    final_value = decimal.Decimal(value)
    decimal_places = None
    if asset_id:
        asset = AssetsAccessor().get_asset_by_id(asset_id)
        decimal_places = asset.asset_class.decimal_places
    if asset:
        decimal_places = asset.asset_class.decimal_places
    if asset_class_dict:
        decimal_places = asset_class_dict["decimal_places"]
    final_value = final_value * (10**decimal_places)
    final_value = round(final_value, 0)
    return final_value


def to_higher_denomination(value, asset_class_instance=None, asset_class_dict=None):
    final_value = decimal.Decimal(value)
    decimal_places = None
    if asset_class_instance:
        decimal_places = asset_class_instance.decimal_places
    if asset_class_dict:
        decimal_places = asset_class_dict["decimal_places"]
    final_value = final_value / (10**decimal_places)
    final_value = round(final_value, decimal_places)
    return final_value


def calculate_average_buy(
    prev_avg_buy, prev_holding_val, transacted_val, transacted_amt
):
    prev_total_amt = prev_avg_buy * prev_holding_val
    return (prev_total_amt + transacted_amt) / (prev_holding_val + transacted_val)


def get_base_asset():
    """Temporary function to get the base asset"""
    return AssetsAccessor().get_assets(tickers=["INR"])[0]
