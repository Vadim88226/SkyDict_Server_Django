from django.urls import path
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import views as auth_views

from . import views
app_name = 'translator'
urlpatterns = [
    path('', views.IndexView.as_view(), name='index'),
    path('query_dict/', views.query_dict, name='query_dict'),
    path('trans_sentences/', views.trans_sentences, name='trans_sentences'),
    path('log_in/', views.log_in, name='index'),
    path('sign_up/', views.register, name ='register'), 
    path('log_out/', views.log_out, name='index'),
    path('detect_similar_words/', views.detect_similar_words, name='index'),
    path('text_similar_words/', views.text_similar_words, name='index'),
    path('upload_file', views.upload_file, name='index'),
    path('add_words', views.add_words, name='index'),
    path('query_UserDictionaryList', views.query_UserDictionaryList, name='index'),
    path('query_WordContents', views.query_WordContents, name='index'),
    path('lexitron_list', views.lexitron_list, name='index'),
    path('update_sentence', views.update_sentence, name='index'),
    path('delete_sentence', views.delete_sentence, name='index'),
    path('update_vocabulary', views.update_vocabulary, name='index'),
    path('approve_vocabulary', views.approve_vocabulary, name='index'),
    path('delete_vocabulary', views.delete_vocabulary, name='index'),
    path('update_corpussentence/', views.update_CorpusSentence, name='update_CorpusSentence'),
    path('get_corpussentence/', views.get_CorpusSentence, name='get_CorpusSentence'),
    path('export_bilingualcorpus/', views.export_BilingualCorpus, name='export_BilingualCorpus')
    
]
