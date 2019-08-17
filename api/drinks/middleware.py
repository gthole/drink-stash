from datetime import timedelta
from django.utils.timezone import now
from django.db.models import Q
from drinks.models import Profile


class LastSeenMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)

        # Update last visit time after request finished processing.
        if request.user.is_authenticated:
            ts = now()
            Profile.objects.filter(
                Q(last_seen__lt=(ts - timedelta(hours=1))) |
                Q(last_seen=None),
                user_id=request.user.pk,
            ).update(last_seen=ts)

        return response


