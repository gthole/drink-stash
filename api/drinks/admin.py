from django.contrib import admin
from .models import Ingredient


@admin.register(Ingredient)
class IngredientAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'generic')
    search_fields = ['name']
    ordering = ['name']

admin.site.site_header = 'Drink Stash Admin'
