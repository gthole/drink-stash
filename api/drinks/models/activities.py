from django.contrib.auth.models import User
from django.db.models import CharField, IntegerField, Model, TextField, \
    DateTimeField, ForeignKey, DO_NOTHING

class Activity(Model):
    id = IntegerField(primary_key=True)
    created = DateTimeField()
    recipe = ForeignKey('Recipe', on_delete=DO_NOTHING)
    user_list = ForeignKey('UserList', null=True, on_delete=DO_NOTHING)
    user = ForeignKey(User, on_delete=DO_NOTHING)
    body = TextField(null=True)
    type = CharField(max_length=12, db_column='activity_type', choices=(
        ('recipe', 'Recipe'),
        ('listrecipe', 'UserListRecipe'),
        ('comment', 'Comment'),
    ))
    count = IntegerField(db_column='row_count')

    class Meta:
        managed = False
