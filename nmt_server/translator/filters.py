from .models import tm_model
import django_filters

class tmFilter(django_filters.FilterSet):
    class Meta:
        model = tm_model
        # fields = ['name', 's_lang', 't_lang', ]
        fields = ['id', 'name', 'subject', 'note', 's_lang', 't_lang', 'user']

