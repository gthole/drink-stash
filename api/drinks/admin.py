from django.contrib import admin
from .models import Ingredient, Quantity, Recipe, Book, \
    BookUser, Tag, Uom


@admin.register(Ingredient)
class IngredientAdmin(admin.ModelAdmin):
    list_display = ('name', 'category')
    exclude = ('description', 'generic')
    search_fields = ('name',)
    ordering = ('name',)


@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ('name',)
    search_fields = ('name',)
    ordering = ('name',)


@admin.register(Uom)
class UomAdmin(admin.ModelAdmin):
    list_display = ('name',)
    search_fields = ('name',)
    ordering = ('name',)

    def changeform_view(self, request, object_id=None, form_url='',
                        extra_context=None):
        """
        Prevent editing, since the only field is the primary key
        """
        extra_context = extra_context or {}
        if object_id is not None:
            self.readonly_fields = ('name',)
            self.show_save_and_add_another = False
            extra_context = extra_context or {}
            extra_context['show_save_and_continue'] = False
            extra_context['show_save'] = False
            # This apparently is calculated rather than taking a direct value
            # extra_context['show_save_and_add_another'] = False
        else:
            extra_context['show_save_and_continue'] = False
            self.readonly_fields = []
        return super(UomAdmin, self).changeform_view(
            request,
            object_id,
            form_url,
            extra_context
        )


class BookUserInline(admin.TabularInline):
    model = BookUser


@admin.register(Book)
class BookAdmin(admin.ModelAdmin):
    search_fields = ('name',)
    ordering = ('name',)
    list_display = ('name', 'id', 'recipe_count')
    inlines = [
        BookUserInline,
    ]

    def recipe_count(self, obj):
        return obj.recipe_set.count()


class QuantityInline(admin.TabularInline):
    model = Quantity
    min_num = 2
    extra = 3


@admin.register(Recipe)
class RecipeAdmin(admin.ModelAdmin):
    search_fields = ('name',)
    ordering = ('name',)
    list_display = ('name', 'id', 'added_by', 'book')
    inlines = [
        QuantityInline,
    ]

    exclude = ['added_by',]

    def save_model(self, request, instance, form, change):
        if not change:
            instance.added_by = request.user
        super(RecipeAdmin, self).save_model(request, instance, form, change)


admin.site.site_header = 'Drink Stash Admin'
