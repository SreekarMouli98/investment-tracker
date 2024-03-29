# Generated by Django 4.1 on 2023-02-20 04:01
import django.db.models.deletion
from django.db import migrations
from django.db import models


class Migration(migrations.Migration):

    dependencies = [
        ("investment_tracker", "0002_holdingsmodel_value_in_base"),
    ]

    operations = [
        migrations.CreateModel(
            name="ConversionRatesModel",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("conv_rate", models.CharField(max_length=50)),
                (
                    "from_asset",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="conversion_rates_with_from",
                        to="investment_tracker.assetsmodel",
                    ),
                ),
                (
                    "to_asset",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="conversion_rates_with_to",
                        to="investment_tracker.assetsmodel",
                    ),
                ),
            ],
            options={
                "db_table": "conversion_rates",
            },
        ),
    ]
