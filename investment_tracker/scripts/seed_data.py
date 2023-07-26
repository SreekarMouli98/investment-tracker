import os
import sys
PWD = os.getenv('PWD')
os.chdir(PWD)
sys.path.insert(0, os.getenv('PWD'))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "portfolio.settings")
os.environ["DJANGO_ALLOW_ASYNC_UNSAFE"] = "true"
import django
django.setup()
print('django loaded')

from django.db import transaction

from investment_tracker.models.assets_models import (AssetClassesModel, AssetsModel)
from investment_tracker.models.countries_models import CountriesModel

DATA = {
    "asset_classes": [
        {
            "id": 1,
            "name": "Currency",
            "decimal_places": 2
        },
    ],
    "countries": [
        {
            "id": 1,
            "name": "India",
            "code": "IND"
        }
    ],
    "assets": [
        {
            "id": 1,
            "name": "Rupee",
            "ticker": "INR",
            "asset_class_id": 1,
            "country_id": 1,    
        }
    ]
}

TABLE_INSERT_ORDER = [
    "asset_classes",
    "countries",
    "assets"
]

TABLE_INSTANCE_MAP = {
    "asset_classes": AssetClassesModel,
    "countries": CountriesModel,
    "assets": AssetsModel,
}

@transaction.atomic
def seed_data():
    print("BEGIN - Seed Data")
    table_id_map = {}
    for table_name in TABLE_INSERT_ORDER:
        Table = TABLE_INSTANCE_MAP[table_name]
        table_data = DATA[table_name]
        table_recs = [
            Table(**rec)
            for rec in table_data
        ]
        Table.objects.bulk_create(table_recs)
        print(f"Inserted {len(table_recs)} records to {table_name} table!")
    print("END - Seed Data")


if __name__ == '__main__':
    seed_data()
