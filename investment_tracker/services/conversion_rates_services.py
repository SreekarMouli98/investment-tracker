import decimal
import logging
import os

import requests
from django.utils import timezone

from investment_tracker.accessors.conversion_rates_accessors import ConversionRatesAccessor
from investment_tracker.models.conversion_rates_models import ConversionRatesModel
from investment_tracker.services.assets_services import AssetClassesService
from investment_tracker.utils.transactions_utils import get_base_asset, to_lower_denomination


logger = logging.getLogger(__name__)


class ConversionRatesService:
    def get_conversion_rate(
        self, from_asset, to_asset, date=None, skip_persist=False, new_conversion_rates=None, failed_conversions=None
    ):
        logger.info(f"Get conversion rate between {from_asset.ticker} and {to_asset.ticker}")
        date = timezone.now() if date is None else date
        new_conversion_rates = [] if new_conversion_rates is None else new_conversion_rates
        failed_conversions = [] if failed_conversions is None else failed_conversions
        if from_asset.ticker == to_asset.ticker:
            return to_lower_denomination(1, asset=to_asset)
        crypto_asset_class = AssetClassesService().get_asset_class_by_name("Crypto")
        includes_crypto = (
            from_asset.asset_class.id == crypto_asset_class["id"] or to_asset.asset_class.id == crypto_asset_class["id"]
        )
        rate = None
        conv_rate = ConversionRatesAccessor().get_conversion_rate(between=[from_asset, to_asset], date=date)
        if conv_rate:
            rate = decimal.Decimal(conv_rate.conv_rate)
            if conv_rate.from_asset == to_asset:
                rate = 1 / rate
        elif includes_crypto:
            url = f"http://api.coinlayer.com/{date.strftime('%Y-%m-%d')}"
            crypto_asset = None
            final_asset = None
            is_inverse = False
            if from_asset.asset_class.id == crypto_asset_class["id"]:
                crypto_asset = from_asset
                final_asset = to_asset
            else:
                crypto_asset = to_asset
                final_asset = from_asset
                is_inverse = True
            currency_asset_class = AssetClassesService().get_asset_class_by_name("Currency")
            if final_asset.asset_class.id != currency_asset_class["id"]:
                base_asset = get_base_asset()
                crypto_to_base = self.get_conversion_rate(crypto_asset, base_asset, date=date)
                base_to_final = self.get_conversion_rate(base_asset, final_asset, date=date)
                rate = crypto_to_base * base_to_final
            else:
                params = {
                    "access_key": os.environ.get("CRYPTO_CONVERSION_API_KEY"),
                    "target": final_asset.ticker,
                    "symbols": crypto_asset.ticker,
                }
                res = requests.get(url=url, params=params)
                data = res.json()
                try:
                    if not data["success"]:
                        raise Exception()
                    rate = to_lower_denomination(data["rates"][crypto_asset.ticker], asset=final_asset)
                except Exception:
                    failed_conversions.append((crypto_asset, final_asset))
                    rate = to_lower_denomination(1, asset=final_asset)
                conv_rate = ConversionRatesModel(
                    from_asset=crypto_asset, to_asset=final_asset, conv_rate=rate, date=date
                )
                if skip_persist:
                    new_conversion_rates.append(conv_rate)
                else:
                    ConversionRatesAccessor().persist(conv_rate)
            if is_inverse:
                rate = 1 / rate
        else:
            url = f"https://api.getgeoapi.com/v2/currency/historical/{date.strftime('%Y-%m-%d')}"
            params = {
                "api_key": os.environ.get("CURRENCY_CONVERSION_API_KEY"),
                "from": from_asset.ticker,
                "to": to_asset.ticker,
            }
            res = requests.get(url=url, params=params)
            data = res.json()
            try:
                if data["status"] == "failed":
                    raise Exception()
                rate = to_lower_denomination(data["rates"][to_asset.ticker]["rate"], asset=to_asset)
            except Exception:
                failed_conversions.append((from_asset, to_asset))
                rate = to_lower_denomination(1, asset=to_asset)
            conv_rate = ConversionRatesModel(from_asset=from_asset, to_asset=to_asset, conv_rate=rate, date=date)
            if skip_persist:
                new_conversion_rates.append(conv_rate)
            else:
                ConversionRatesAccessor().persist(conv_rate)
        logger.info(f"Get conversion rate between {from_asset.ticker} and {to_asset.ticker} = {rate}")
        return rate

    def get_conversion_rate_cached(self, from_asset, to_asset, *args, cached_conversion_rates=None, **kwargs):
        logger.info(f"Get conversion rate cached between {from_asset.ticker} and {to_asset.ticker}")
        cached_conversion_rates = {} if cached_conversion_rates is None else cached_conversion_rates
        assets = (from_asset.ticker, to_asset.ticker)
        reversed_assets = tuple(reversed(assets))
        conv_rate = None
        if assets in cached_conversion_rates:
            conv_rate = cached_conversion_rates[assets]
        elif reversed_assets in cached_conversion_rates:
            conv_rate = cached_conversion_rates[reversed_assets]
            conv_rate = 1 / conv_rate
        else:
            conv_rate = self.get_conversion_rate(from_asset, to_asset, *args, **kwargs)
            cached_conversion_rates[assets] = conv_rate
        return conv_rate
