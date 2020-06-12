from django.utils.safestring import mark_safe
from django_tables2.utils import Accessor, AttributeDict
import django_tables2 as tables
from .models import TransMemories, BilingualCorpus, POSTaggedCorpus, BilingualSentence, POSTaggedSentence
import itertools
from django.conf import settings

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
    check = MaterializeCheckColumn(accessor='id', attrs={"td":{'class': 'match_rate'}})
    counter = tables.Column(verbose_name='#', empty_values=(), orderable=False)
    name = tables.Column(verbose_name='TM Name')
    updated_at = tables.DateTimeColumn(verbose_name='Last Modified', format='d/m/Y')
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
        return mark_safe('''%s > %s''' % (value.upper(), record.t_lang.upper()))

class concordanceTable(tables.Table):
    source = tables.Column(orderable=False, attrs={"th":{'width':'40%'}})
    target = tables.Column(orderable=False, attrs={"th":{'width':'40%'}})
    tm_name = tables.Column(orderable=False)
    match_rate = tables.Column(orderable=False, attrs={"td":{'class': 'match_rate'}})
    class Meta:
        template_name = "django_tables2/bootstrap-responsive.html"
        attrs = {"class": "table table-hover paleblue"}

    
class BilingualCorpusTable(tables.Table):
    check = MaterializeCheckColumn(accessor='id', attrs={"td":{'class': 'match_rate'}})
    counter = tables.Column(verbose_name='#', empty_values=(), orderable=False)
    name = tables.Column(verbose_name='Name')
    # updated_at = tables.DateTimeColumn(verbose_name='Last Modified', format='d/m/Y')
    s_lang = tables.Column(verbose_name="Languages")
    user = tables.Column(verbose_name='Owner')
    file_name = tables.Column(verbose_name='Bilingual Corpus File')

    export = tables.TemplateColumn("<button class='export_btn' style='cursor:pointer;width: 100%;' ><i class='fas'>&#xf56e;</i></button>")

    class Meta:
        model = BilingualCorpus
        template_name = "django_tables2/bootstrap-responsive.html"
        fields = ('counter', 'name', 's_lang', 'file_name', 'user', 'check', 'export')

        attrs = {"class": "table table-hover paleblue"}
    def render_counter(self):
        self.row_counter = getattr(self, 'row_counter', itertools.count(1))
        return next(self.row_counter)
    def render_s_lang(self, value, record):
        return mark_safe('''%s > %s''' % (value.upper(), record.t_lang.upper()))
    
   
    
class POSTaggedCorpusTable(tables.Table):
    check = MaterializeCheckColumn(accessor='id', attrs={"td":{'class': 'match_rate'}})
    counter = tables.Column(verbose_name='#', empty_values=(), orderable=False)
    name = tables.Column(verbose_name='Name')
    s_lang = tables.Column(verbose_name="Languages")
    user = tables.Column(verbose_name='Owner')
    file_name = tables.Column(verbose_name='POS Tagged Corpus File')
    export = tables.TemplateColumn("<button class='export_btn' style='cursor:pointer;width: 100%;' ><i class='fas'>&#xf56e;</i></button>")
    class Meta:
        model = POSTaggedCorpus
        template_name = "django_tables2/bootstrap-responsive.html"
        fields = ('counter', 'name', 's_lang', 'file_name', 'user', 'check', 'export')
        attrs = {"class": "table table-hover paleblue"}
    def render_counter(self):
        self.row_counter = getattr(self, 'row_counter', itertools.count(1))
        return next(self.row_counter)
    def render_s_lang(self, value, record):
        return mark_safe('''%s > %s''' % (value.upper(), record.t_lang.upper()))



class BilingualSentenceTable(tables.Table):
    counter = tables.Column(verbose_name='#', empty_values=(), orderable=False)
    source = tables.Column(verbose_name='Source')
    target = tables.Column(verbose_name='Target')
    status = tables.Column(verbose_name='Status', accessor='status.status')
    class Meta:
        model = BilingualSentence
        template_name = "django_tables2/bootstrap-responsive.html"
        fields = ('counter', 'source', 'target', 'status')
        attrs = {"class": "table table-hover paleblue", "id": "corpusfilecontenttable"}
    def render_counter(self):
        self.row_counter = getattr(self, 'row_counter', itertools.count(1))
        return next(self.row_counter)
