# Generated by Django 4.1 on 2023-02-18 09:48
from django.db import migrations
from django.db import models


class Migration(migrations.Migration):

    dependencies = [
        ("investment_tracker", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="holdingsmodel",
            name="value_in_base",
            field=models.CharField(default="0", max_length=50),
            preserve_default=False,
        ),
    ]
