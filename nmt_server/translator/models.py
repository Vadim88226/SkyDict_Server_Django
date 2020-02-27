from __future__ import unicode_literals
from django.db import models
from datetime import datetime

class TransModel(models.Model):
    question_text = models.CharField(max_length=200)
    pub_date = models.DateTimeField('date published')
    def __str__(self):
        return self.question_text
    def was_published_recently(self):
        return timezone.now() >= self.pub_date >= timezone.now() - datetime.timedelta(days=1)

class DictWords(models.Model):
    id = models.IntegerField(primary_key=True)
    word = models.CharField(max_length=70)
    part = models.CharField(max_length=50,default='noun')
    s_lang = models.CharField(max_length=5,default='en')
    t_lang = models.CharField(max_length=5,default='th')
    trans = models.TextField(blank=True)
    user = models.CharField(max_length=70, default='unknown')
    is_allowed = models.IntegerField(default=0)
    timestamp_fields = ('created_at', 'modified_at')
    def __str__(self):
        return self.id

class DictSentences(models.Model):
    id = models.IntegerField(primary_key=True)
    word = models.CharField(max_length=70)
    part = models.CharField(max_length=50,default='name')
    s_sentence = models.TextField(blank=True)
    t_sentence = models.TextField(blank=True)
    user = models.CharField(max_length=70, default='unknown')
    is_allowed = models.IntegerField(default=0)
    timestamp_fields = ('created_at', 'modified_at')
    def __str__(self):
        return self.id