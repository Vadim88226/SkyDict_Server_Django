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
    path('upload_file', views.upload_file, name='index'),
    path('add_words', views.add_words, name='index'),
    path('vocabulary_list', views.vocabulary_list, name='index'),
    path('query_user_dictionary', views.query_user_dictionary, name='index'),
]
