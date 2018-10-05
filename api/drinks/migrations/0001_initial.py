# -*- coding: utf-8 -*-
# Generated by Django 1.11 on 2018-10-03 01:38
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Ingredient',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255, unique=True)),
                ('description', models.CharField(blank=True, max_length=255, null=True)),
                ('substitutions', models.ManyToManyField(to='drinks.Ingredient')),
            ],
        ),
        migrations.CreateModel(
            name='Quantity',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('amount', models.FloatField()),
                ('unit', models.IntegerField(blank=True, choices=[(1, 'oz'), (2, 'dash'), (3, 'barspoon')], null=True)),
                ('hidden', models.BooleanField(default=False)),
                ('ingredient', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='drinks.Ingredient')),
            ],
        ),
        migrations.CreateModel(
            name='Recipe',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255)),
                ('source', models.CharField(max_length=255)),
                ('directions', models.TextField(blank=True, null=True)),
                ('description', models.TextField(blank=True, null=True)),
                ('notes', models.TextField(blank=True, null=True)),
            ],
        ),
        migrations.AddField(
            model_name='quantity',
            name='recipe',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='drinks.Recipe'),
        ),
    ]
