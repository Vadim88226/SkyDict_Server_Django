from __future__ import unicode_literals
from django.db import models
from django.contrib.auth.models import User
from django.core.validators import FileExtensionValidator
from datetime import datetime


class DictWords(models.Model):
    word = models.CharField(max_length=255)
    part = models.CharField(max_length=50,default='noun')
    s_lang = models.CharField(max_length=10,default='en')
    t_lang = models.CharField(max_length=10,default='th')
    trans = models.TextField(blank=True)
    related = models.TextField(blank=True)
    synonym = models.TextField(blank=True)
    antonym = models.TextField(blank=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    is_approved = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    

class DictSentences(models.Model):
    dictwords = models.ForeignKey(DictWords, on_delete=models.CASCADE)
    part = models.CharField(max_length=50,default='name')
    s_sentence = models.TextField(blank=True)
    t_sentence = models.TextField(blank=True)

class TransMemories(models.Model):    
    file_url = models.FileField(upload_to='concordances/', validators=[FileExtensionValidator(allowed_extensions=['tmx'])])
    name = models.CharField(max_length=50,default='none')
    s_lang = models.CharField(max_length=5,default='en')
    t_lang = models.CharField(max_length=5,default='th')
    subject = models.CharField(max_length=50,default='')
    note = models.TextField(blank=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True, blank=True)
    sdltm_url = models.FileField(upload_to='concordances/')

class UserSetting(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    s_lang = models.CharField(max_length=5,default='en')
    t_lang = models.CharField(max_length=5,default='th')
    matchRate = models.IntegerField(default=50)
    ignoreTags = models.BooleanField(default=False)

class BilingualCorpus(models.Model):
    file_url = models.FileField(upload_to='corpus_files/', validators=[FileExtensionValidator(allowed_extensions=['txt', 'csv', 'tmx', 'xlsx'])])
    file_name = models.CharField(max_length=255)
    name = models.CharField(max_length=50,default='none')
    s_lang = models.CharField(max_length=5,default='en')
    t_lang = models.CharField(max_length=5,default='th')
    note = models.TextField(blank=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True, blank=True)

class POSTaggedCorpus(models.Model):
    file_url = models.FileField(upload_to='pos_tagged_files/', validators=[FileExtensionValidator(allowed_extensions=['txt', 'csv', 'tmx', 'xlsx'])])
    file_name = models.CharField(max_length=255)
    name = models.CharField(max_length=50,default='none')
    s_lang = models.CharField(max_length=5,default='en')
    t_lang = models.CharField(max_length=5,default='th')
    note = models.TextField(blank=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True, blank=True)

class CorpusStatus(models.Model):
    status = models.CharField(max_length=50, default='Unchecked')

class BilingualSentence(models.Model):
    corpus = models.ForeignKey(BilingualCorpus, on_delete=models.CASCADE)
    source = models.TextField(blank=True)
    target = models.TextField(blank=True)
    status = models.ForeignKey(CorpusStatus, blank=True, null=True, on_delete=models.SET_NULL)

class POSTaggedSentence(models.Model):
    corpus = models.ForeignKey(POSTaggedCorpus, on_delete=models.CASCADE)
    source = models.TextField(blank=True)
    target = models.TextField(blank=True)
    tagged_source = models.TextField(blank=True)
    tagged_target = models.TextField(blank=True)
    status = models.ForeignKey(CorpusStatus, blank=True, null=True, on_delete=models.SET_NULL)