from rest_framework_jwt.utils import jwt_payload_handler as base


def jwt_payload_handler(user):
    """
    Extend the payload in the auth token to indicate staff status
    """
    payload = base(user)
    payload['is_staff'] = user.is_staff
    payload['image'] = user.profile.profile
    return payload
