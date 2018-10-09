from django.contrib import admin
from .models import Ingredient


@admin.register(Ingredient)
class IngredientAdmin(admin.ModelAdmin):
        pass

admin.site.site_header = 'Drink Stash Admin'
