from django.contrib import admin

from translator.models import CorpusStatus, BilingualSentence, BilingualCorpus, POSTaggedCorpus, POSTaggedSentence
admin.site.register(CorpusStatus)
admin.site.register(BilingualCorpus)
admin.site.register(POSTaggedCorpus)
admin.site.register(BilingualSentence)
admin.site.register(POSTaggedSentence)

