"""nmt_server URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from material.admin.sites import site
from translator import views

admin.site.site_header = "SkyDict Admin"
admin.site.site_title = "SkyDict Admin Page"
admin.site.index_title = "Welcome to SkyDict Admin Page"
admin.autodiscover()
urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('translator.urls'), name = 'translator'),
    path('translator/', include('translator.urls')),
    path('dictionary/', views.view_Dictionary, name="dictionary_view"),
    path('concondance/', views.view_ConcondanceSearch, name="view_ConcondanceSearch"),
    path('manipulate_TM/', views.manipulate_TM, name="manipulate_TM"),
    path('update_UserSetting/', views.update_UserSetting, name="update_UserSetting"),
    path('user_words/', views.view_AddWords, name="view_user_words"),
    path('user_dictionary/', views.view_user_dictionary, name="view_user_dictionary"),
    path('account_activation_sent/', views.account_activation_sent, name='account_activation_sent'),
    path('activate/<uidb64>/<token>/', views.activate, name='activate'),
    path('upload_translationMemories/', views.upload_translationMemories, name='upload_translationMemories'),
]


