from __future__ import unicode_literals
from django.db import models
from datetime import datetime


class DictWords(models.Model):
    id = models.AutoField(primary_key=True)
    word = models.CharField(max_length=70)
    part = models.CharField(max_length=50,default='noun')
    s_lang = models.CharField(max_length=5,default='en')
    t_lang = models.CharField(max_length=5,default='th')
    trans = models.TextField(blank=True)
    user = models.CharField(max_length=70, default='unknown')
    is_allowed = models.IntegerField(default=0)
    timestamp_fields = ('created_at', 'modified_at')
    def __str__(self):
        return self.word

class DictSentences(models.Model):
    id = models.AutoField(primary_key=True)
    word_id = models.IntegerField()
    part = models.CharField(max_length=50,default='name')
    s_sentence = models.TextField(blank=True)
    t_sentence = models.TextField(blank=True)
    is_allowed = models.IntegerField(default=0)
    timestamp_fields = ('created_at', 'modified_at')
    def __str__(self):
        return self.part