from django.conf.urls import url, include
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.contrib.auth import views as auth_views
from django.views.generic import TemplateView
from django.views.generic.base import RedirectView
from rest_framework_jwt.views import obtain_jwt_token
from rest_framework import routers

from drinks.views import index, IngredientViewSet, RecipeViewSet, \
    UserViewSet, CommentViewSet, TagViewSet, UserListViewSet, \
    UserListRecipeViewSet, UomViewSet, BookViewSet, ActivityViewSet

router = routers.DefaultRouter()
router.register(r'activities', ActivityViewSet)
router.register(r'books', BookViewSet)
router.register(r'ingredients', IngredientViewSet)
router.register(r'recipes', RecipeViewSet)
router.register(r'comments', CommentViewSet)
router.register(r'tags', TagViewSet)
router.register(r'lists', UserListViewSet)
router.register(r'list-recipes', UserListRecipeViewSet)
router.register(r'uom', UomViewSet)
router.register(r'users', UserViewSet)

# TODO: Serve media images with another method
urlpatterns = static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT) + [
    url(r'^api/v1/auth/', obtain_jwt_token),
    url(r'^api/v1/', include(router.urls)),
    url(r'^accounts/password_reset/$', auth_views.PasswordResetView.as_view(
        email_template_name='email/password_reset.txt',
        html_email_template_name='email/password_reset.html',
        subject_template_name='email/password_reset_subject.txt',
    ), name='auth_password_reset'),
    url(r'^accounts/', include('django.contrib.auth.urls')),
    url(r'^admin/', admin.site.urls),
    url(r'^favicon.ico$', RedirectView.as_view(
        url=settings.STATIC_URL + 'assets/favicon.ico',
        permanent=True
    )),
    url(r'^apple-touch-icon.png$', RedirectView.as_view(
        url=settings.STATIC_URL + 'assets/apple-touch-icon.png',
        permanent=True
    )),
    url(r'', index),  # React routing
    url(r'^$', index),  # React routing
]
