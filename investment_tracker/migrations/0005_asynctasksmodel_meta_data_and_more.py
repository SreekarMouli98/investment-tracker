# Generated by Django 4.1 on 2023-02-25 04:37
from django.db import migrations
from django.db import models


class Migration(migrations.Migration):

    dependencies = [
        ("investment_tracker", "0004_conversionratesmodel_date"),
    ]

    operations = [
        migrations.AddField(
            model_name="asynctasksmodel",
            name="meta_data",
            field=models.JSONField(null=True),
        ),
        migrations.DeleteModel(
            name="ConversionRatesModel",
        ),
    ]
