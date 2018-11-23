from django.contrib import admin
from .models import Ingredient, Quantity, Recipe


@admin.register(Ingredient)
class IngredientAdmin(admin.ModelAdmin):
    list_display = ('name', 'category')
    exclude = ('description', 'generic')
    search_fields = ('name',)
    ordering = ('name',)


class QuantityInline(admin.TabularInline):
    model = Quantity
    min_num = 2
    extra = 3


@admin.register(Recipe)
class RecipeAdmin(admin.ModelAdmin):
    search_fields = ('name',)
    ordering = ('name',)
    list_display = ('name', 'id', 'added_by')
    inlines = [
        QuantityInline,
    ]

    exclude = ['added_by',]

    def save_model(self, request, instance, form, change):
        if not change:
            instance.added_by = request.user
        super(RecipeAdmin, self).save_model(request, instance, form, change)


admin.site.site_header = 'Drink Stash Admin'
