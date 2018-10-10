from django.contrib import admin
from .models import Ingredient


@admin.register(Ingredient)
class IngredientAdmin(admin.ModelAdmin):
    search_fields = ['name']
    ordering = ['name']

admin.site.site_header = 'Drink Stash Admin'
