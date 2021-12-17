from rest_framework_jwt.utils import jwt_payload_handler as base
from django.contrib.auth.backends import ModelBackend
from django.contrib.auth import get_user_model
from django.db.models import Q

UserModel = get_user_model()


class EmailBackend(ModelBackend):
    """
    Allow users to log in with their email addresses as well as username
    https://github.com/django/django/blob/master/django/contrib/auth/backends.py#L36
    """

    def authenticate(self, request, username=None, password=None, **kwargs):
        if username is None or password is None:
            return
        try:
            user = UserModel._default_manager.get(
                Q(username=username) | Q(email__iexact=username)
            )
        except UserModel.DoesNotExist:
            # Run the default password hasher once to reduce the timing
            # difference between an existing and a nonexistent user (#20760).
            UserModel().set_password(password)
        else:
            if user.check_password(password) and self.user_can_authenticate(user):
                return user


def jwt_payload_handler(user):
    """
    Extend the payload in the auth token to indicate staff status
    """
    payload = base(user)
    payload['is_staff'] = user.is_staff
    payload['image'] = user.profile.profile
    return payload
