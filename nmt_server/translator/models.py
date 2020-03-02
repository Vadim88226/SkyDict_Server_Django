from __future__ import unicode_literals
from django.db import models
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
    is_allowed = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    

class DictSentences(models.Model):
    dictwords = models.ForeignKey(DictWords, on_delete=models.CASCADE)
    part = models.CharField(max_length=50,default='name')
    s_sentence = models.TextField(blank=True)
    t_sentence = models.TextField(blank=True)
    # is_allowed = models.IntegerField(default=0)
    # created_at = models.DateTimeField(auto_now_add=True)
    # updated_at = models.DateTimeField(auto_now=True)
    # def __str__(self):
    #     return self.part