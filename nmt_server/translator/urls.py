from django.urls import path
from django.views.decorators.csrf import csrf_exempt
from . import views
app_name = 'translator'
urlpatterns = [
    path('', views.IndexView.as_view(), name='index'),
    path('query_dict/', views.query_dict, name='query_dict'),
    path('trans_sentences/', views.trans_sentences, name='trans_sentences'),
    
]
