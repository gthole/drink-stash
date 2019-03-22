from rest_framework.permissions import BasePermission, SAFE_METHODS
from django.contrib.auth.models import User
from .models import Recipe, Comment, UserList, UserListRecipe


class ObjectOwnerPermissions(BasePermission):
    """
    Prevent users from modifying objects that don't belong to them.
    """

    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request,
        # so we'll always allow GET, HEAD or OPTIONS requests.
        if request.method in SAFE_METHODS:
            return True

        # Comments and user lists can only be modified by their user
        if obj.__class__ in (Comment, UserList):
            return obj.user_id == request.user.id

        # User list recipes can only be modified by their user
        if obj.__class__ == UserListRecipe:
            return obj.user_list.user_id == request.user.id

        # Recipes can only be modified by the creator or staff
        if obj.__class__ == Recipe:
            return request.user.is_staff or obj.added_by.id == request.user.id

        # Users can only modify themselves, add/delete not allowed via API
        if obj.__class__ == User:
            return obj.id == request.user.id

        raise NotImplemented
