from __future__ import unicode_literals
from django.db import models
from django.contrib.auth.models import User
from datetime import datetime

# class TransModel(models.Model):
#     question_text = models.CharField(max_length=200)
#     pub_date = models.DateTimeField('date published')
#     def __str__(self):
#         return self.question_text
#     def was_published_recently(self):
#         return timezone.now() >= self.pub_date >= timezone.now() - datetime.timedelta(days=1)

class DictWords(models.Model):
    word = models.CharField(max_length=70)
    part = models.CharField(max_length=50,default='noun')
    s_lang = models.CharField(max_length=5,default='en')
    t_lang = models.CharField(max_length=5,default='th')
    trans = models.TextField(blank=True)
    user = models.CharField(max_length=70, default='unknown')
    is_approved = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    

class DictSentences(models.Model):
    dictwords = models.ForeignKey(DictWords, on_delete=models.CASCADE)
    part = models.CharField(max_length=50,default='name')
    s_sentence = models.TextField(blank=True)
    t_sentence = models.TextField(blank=True)
    # is_approved = models.IntegerField(default=0)
    # created_at = models.DateTimeField(auto_now_add=True)
    # updated_at = models.DateTimeField(auto_now=True)
    # def __str__(self):
    #     return self.part

class TransMemories(models.Model):
    file_url = models.FileField(upload_to='concondances/')
    name = models.CharField(max_length=50,default='none')
    s_lang = models.CharField(max_length=5,default='en')
    t_lang = models.CharField(max_length=5,default='th')
    subject = models.CharField(max_length=50,default='')
    note = models.TextField(blank=True)
    user = models.CharField(max_length=70, default='unknown')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class UserSetting(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    s_lang = models.CharField(max_length=5,default='en')
    t_lang = models.CharField(max_length=5,default='th')
    matchRate = models.IntegerField(default=50)
    ignoreTags = models.BooleanField(default=False)
