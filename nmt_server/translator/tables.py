from django.utils.safestring import mark_safe
from django_tables2.utils import Accessor, AttributeDict
import django_tables2 as tables
from .models import TransMemories
import itertools

class MaterializeCheckColumn(tables.CheckBoxColumn):
    def render(self, value, bound_column, record):
        default = {"type": "checkbox", "name": bound_column.name, "value": value}
        if self.is_checked(value, record):
            default.update({"checked": "checked"})

        general = self.attrs.get("input")
        specific = self.attrs.get("td__input")
        attrs = tables.utils.AttributeDict(default, **(specific or general or {}))
        # return mark_safe("<p><label><input %s/><span></span></label></p>" % attrs.as_html())
        return mark_safe("<input %s/>" % attrs.as_html())
        
class tmTable(tables.Table):
    check = MaterializeCheckColumn(accessor='id')
    counter = tables.Column(verbose_name='No', empty_values=(), orderable=False)
    name = tables.Column(verbose_name='TM Name')
    updated_at = tables.Column(verbose_name='Last Modified')
    s_lang = tables.Column(verbose_name="Languages")
    user = tables.Column(verbose_name='Owner')
    class Meta:
        model = TransMemories
        template_name = "django_tables2/bootstrap-responsive.html"
        fields = ('counter', 'name', 's_lang', 'updated_at', 'user', 'check')
        attrs = {"class": "table table-hover paleblue"}
    def render_counter(self):
        self.row_counter = getattr(self, 'row_counter', itertools.count(1))
        return next(self.row_counter)
    def render_s_lang(self, value, record):
        return mark_safe('''%s -> %s''' % (value, record.t_lang))

class concondanceTable(tables.Table):
    class Meta:
        model = TransMemories
        template_name = "django_tables2/bootstrap-responsive.html"
        fields = ('id', 'name', 'subject', 'note', 's_lang', 't_lang', 'user', 'file_url')
        attrs = {"class": "table table-hover paleblue"}
