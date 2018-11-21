from django.contrib import admin
from .models import Ingredient, Quantity, Recipe


@admin.register(Ingredient)
class IngredientAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'generic')
    search_fields = ['name']
    ordering = ['name']


class QuantityInline(admin.TabularInline):
    model = Quantity
    min_num = 2
    extra = 3


@admin.register(Recipe)
class RecipeAdmin(admin.ModelAdmin):
    inlines = [
        QuantityInline,
    ]

    exclude = ['added_by',]

    def save_model(self, request, instance, form, change):
        if not change:
            self.added_by = request.user
        super(RecipeAdmin, self).save_model(request, instance, form, change)


admin.site.site_header = 'Drink Stash Admin'
