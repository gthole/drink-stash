from django.conf.urls import url, include
from django.conf import settings
from django.contrib import admin
from django.contrib.auth import views as auth_views
from django.views.generic import TemplateView
from django.views.generic.base import RedirectView
from rest_framework_jwt.views import obtain_jwt_token
from rest_framework import routers

from drinks.views import index, IngredientViewSet, RecipeViewSet, \
    UserViewSet, CommentViewSet, UserFavoriteViewSet

router = routers.DefaultRouter()
router.register(r'ingredients', IngredientViewSet)
router.register(r'recipes', RecipeViewSet)
router.register(r'comments', CommentViewSet)
router.register(r'users', UserViewSet)
router.register(r'favorites', UserFavoriteViewSet)

urlpatterns = [
    url(r'^api/v1/auth/', obtain_jwt_token),
    url(r'^api/v1/', include(router.urls)),
    url(r'^admin/', admin.site.urls),
    url(r'^favicon.ico$', RedirectView.as_view(
        url=settings.STATIC_URL + 'assets/favicon.ico',
        permanent=True
    )),
    url(r'^apple-touch-icon.png$', RedirectView.as_view(
        url=settings.STATIC_URL + 'assets/apple-touch-icon.png',
        permanent=True
    )),
    url(r'', index),  # Angular routing
    url(r'^$', index),  # Angular routing
]
