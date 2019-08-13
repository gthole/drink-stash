from rest_framework.permissions import IsAuthenticated, BasePermission, \
    SAFE_METHODS
from rest_framework.viewsets import ModelViewSet
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.status import HTTP_400_BAD_REQUEST, HTTP_401_UNAUTHORIZED, \
    HTTP_403_FORBIDDEN

from django.shortcuts import get_object_or_404
from django.db.models import Count
from django.contrib.auth.models import User

from PIL import Image
from io import BytesIO

from drinks.models import UserIngredient, Ingredient, Profile
from drinks.serializers import UserSerializer, UserIngredientSerializer, \
    SelfUserSerializer
from drinks.views.base import LazyViewSet


class UserPermission(BasePermission):
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request,
        # so we'll always allow GET, HEAD or OPTIONS requests.
        if request.method in SAFE_METHODS:
            return True
        return obj.id == request.user.id


class UserViewSet(ModelViewSet):
    http_method_names = ['get', 'put', 'head']
    permission_classes = (IsAuthenticated, UserPermission)
    queryset = User.objects.all().order_by('id')
    serializer_class = UserSerializer

    def get_queryset(self):
        queryset = super(UserViewSet, self).get_queryset()
        queryset = queryset.annotate(comment_count=Count('comments', distinct=True))
        queryset = queryset.annotate(recipe_count=Count('recipe', distinct=True))
        return queryset

    def get_serializer_class(self):
        paths = (
            '/api/v1/users/%s/' % self.request.user.username,
            '/api/v1/users/%d/' % self.request.user.id,
        )
        if self.request.path in paths:
            return SelfUserSerializer
        return self.serializer_class

    def get_object(self):
        """
        Get user by username or PK
        """
        queryset = self.get_queryset()
        filter = {}

        pk = self.kwargs['pk']
        if pk.isdigit():
            filter['pk'] = pk
        else:
            filter['username'] = pk

        obj = get_object_or_404(queryset, **filter)
        self.check_object_permissions(self.request, obj)
        return obj

    @action(detail=True, methods=['put'])
    def cabinet(self, request, pk=None):
        user = self.get_object()
        if user.id != request.user.id:
            return Response(status=HTTP_403_FORBIDDEN)
        ingredients = Ingredient.objects.filter(name__in=request.data).all()
        user_ingredients = UserIngredient.objects.filter(user=request.user) \
            .all()
        serializer = UserIngredientSerializer(
            many=True,
            data=request.data,
            context={
                'request': request,
                'ingredients': ingredients,
                'user_ingredients': user_ingredients
            }
        )

        if serializer.is_valid():
            for ui in (x for x in serializer.validated_data if not x.id):
                ui.save()
            UserIngredient.objects \
                .filter(user=request.user) \
                .exclude(ingredient__name__in=request.data) \
                .delete()
            request.user.ingredient_set.set(serializer.validated_data)
            return Response({'status': 'cabinet updated'})
        else:
            return Response(serializer.errors, status=HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['put'])
    def profile_image(self, request, pk=None):
        user = self.get_object()
        if user.id != request.user.id:
            return Response(status=HTTP_403_FORBIDDEN)

        (profile, created) = Profile.objects.get_or_create(user=user)

        image = request.FILES['image']

        im = Image.open(image)
        width, height = im.size

        if width > height:
            offset = (width - height) / 2
            box = (offset, 0, offset + height, height)
        else:
            offset = ((height - width) * 3) / 10
            box = (0, offset, width, offset + width)
        im = im.crop(box)

        im.resize((128, 128), Image.LANCZOS)

        if im.mode in ('RGBA', 'LA'):
            background = Image.new(im.mode[:-1], im.size, 'white')
            background.paste(im, im.split()[-1])
            im = background

        content = BytesIO()
        im.save(content, 'JPEG')

        profile.image.save('%s.jpg' % user.username, content)
        profile.save()

        return Response({'status': 'OK'})
