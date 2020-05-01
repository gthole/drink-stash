from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.forms import UserCreationForm, UserChangeForm
from django.contrib.auth.models import User, Group

from .models import Ingredient, Quantity, Recipe, Book, \
    BookUser, Tag, Uom, Profile


class ButtonMixin(object):
    """
    Prevent double-clicking button double save
    """
    class Media:
        js = ('js/admin-button.js',)


@admin.register(Ingredient)
class IngredientAdmin(admin.ModelAdmin, ButtonMixin):
    list_display = ('name', 'category')
    exclude = ('description', 'generic')
    search_fields = ('name',)
    ordering = ('name',)


@admin.register(Tag)
class TagAdmin(admin.ModelAdmin, ButtonMixin):
    list_display = ('name',)
    search_fields = ('name',)
    ordering = ('name',)


@admin.register(Uom)
class UomAdmin(admin.ModelAdmin, ButtonMixin):
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
class BookAdmin(admin.ModelAdmin, ButtonMixin):
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
class RecipeAdmin(admin.ModelAdmin, ButtonMixin):
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

class EmailRequiredMixin(object):
    def __init__(self, *args, **kwargs):
        super(EmailRequiredMixin, self).__init__(*args, **kwargs)
        self.fields['email'].required = True
        self.fields['first_name'].required = True
        self.fields['last_name'].required = True


class NewUserCreationForm(EmailRequiredMixin, UserCreationForm):
    pass


class NewUserChangeForm(EmailRequiredMixin, UserChangeForm):
    pass


class BookUserInline(admin.TabularInline):
    model = BookUser
    verbose_name_plural = 'Books'
    fk_name = 'user'
    ordering = ('book__name',)

    def get_extra(self, request, obj=None, **kwargs):
        return 0;


class ProfileInline(admin.StackedInline):
    model = Profile
    can_delete = False
    verbose_name_plural = 'Profile'
    fk_name = 'user'


class CustomUserAdmin(UserAdmin):
    form = NewUserChangeForm
    add_form = NewUserCreationForm
    add_fieldsets = ((None, {
        'fields': (
            'username',
            'email',
            'first_name',
            'last_name',
            'password1',
            'password2'
        ),
        'classes': ('wide',)
    }),)

    list_display = (
        'username',
        'first_name',
        'last_name',
        'is_staff',
        'last_seen',
    )

    inlines = (ProfileInline, BookUserInline)

    def last_seen(self, obj):
        return obj.profile.last_seen

    def get_inline_instances(self, request, obj=None):
        if not obj:
            return list()
        return super(CustomUserAdmin, self).get_inline_instances(request, obj)


admin.site.unregister(Group)
admin.site.unregister(User)
admin.site.register(User, CustomUserAdmin)

admin.site.site_header = 'Drink Stash Admin'
