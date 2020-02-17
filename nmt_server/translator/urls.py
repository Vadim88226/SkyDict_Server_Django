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
    # path(r'^activate/(?P<uidb64>[0-9A-Za-z_\-]+)/(?P<token>[0-9A-Za-z]{1,13}-[0-9A-Za-z]{1,20})/', views.activate, name='activate'),
    
]
