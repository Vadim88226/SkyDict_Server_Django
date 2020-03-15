from .models import TransMemories
import django_filters

class tmFilter(django_filters.FilterSet):
    class Meta:
        model = TransMemories
        # fields = ['name', 's_lang', 't_lang', ]
        fields = ['id', 'name', 'subject', 'note', 's_lang', 't_lang', 'user']
