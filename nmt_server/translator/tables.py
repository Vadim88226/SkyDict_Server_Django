from django.utils.safestring import mark_safe
from django_tables2.utils import Accessor, AttributeDict
import django_tables2 as tables
from .models import tm_model

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
    class Meta:
        model = tm_model
        template_name = "django_tables2/bootstrap-responsive.html"
        fields = ('check', 'name', 'subject', 'note', 's_lang', 't_lang', 'user', 'file_url')
        attrs = {"class": "table table-hover paleblue"}

class concondanceTable(tables.Table):
    class Meta:
        model = tm_model
        template_name = "django_tables2/bootstrap-responsive.html"
        fields = ('id', 'name', 'subject', 'note', 's_lang', 't_lang', 'user', 'file_url')
        attrs = {"class": "table table-hover paleblue"}
