from django.conf.urls import url, include
from django.contrib import admin
from django.contrib.auth import views as auth_views
from django.views.generic import TemplateView
from rest_framework_jwt.views import obtain_jwt_token
from rest_framework import routers

from drinks.views import index, RecipeViewSet

router = routers.DefaultRouter()
router.register(r'recipes', RecipeViewSet)

urlpatterns = [
    url(r'^api/v1/auth/', obtain_jwt_token),
    url(r'^api/v1/', include(router.urls)),
    url(r'', index),  # Angular routing
    url(r'^$', index),  # Angular routing
]
