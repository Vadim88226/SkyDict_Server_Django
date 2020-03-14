from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User
from .models import tm_model

class SignupForm(UserCreationForm):
    class Meta:
        model = User
        fields = ('email', 'username', 'first_name', 'last_name', 'password1','password2')

class DictForm(forms.Form):
    find_word = forms.CharField(label='',required=False, widget=forms.TextInput(attrs={'placeholder': 'Enter word','autofocus':True, 'autocomplete': 'off'} ))

class AddWordsForm(forms.Form):
    s_language = [('en', 'English'), ('th','Thai')]
    s_lang = forms.ChoiceField(label='Translate from ', choices=s_language)
    t_lang = forms.ChoiceField(label=' to ', choices=s_language)
    Vocabulary = forms.CharField()
    fields = ('noun','verb_trans','verb_intrans','modal_verb','aux','adj','adv','prep','conj','pron','phrase','jargon','colloqial','abbreviation_or_acronym','slang','vulgar','name','organization','unique_name','other')
    labels = ('noun','verb(trans)','verb(intrans)','modal verb','aux. verb','adj.','adv.','prep.','conj.','pron.','phrase','jargon','colloqial','abbreviation or acronym','slang','vulgar','name','organization','unique name','other')
    chklabels = list(zip(fields,labels))
    chk_box1 = forms.MultipleChoiceField(label='', widget=forms.CheckboxSelectMultiple, choices=chklabels[0:7])
    chk_box2 = forms.MultipleChoiceField(label='', widget=forms.CheckboxSelectMultiple, choices=chklabels[7:14])
    chk_box3 = forms.MultipleChoiceField(label='', widget=forms.CheckboxSelectMultiple, choices=chklabels[14:])
    chk_agree = forms.ChoiceField(label='', widget=forms.CheckboxInput)

class TransMemoryForm(forms.ModelForm):
    s_language = [('en', 'English'), ('th','Thai')]
    s_lang = forms.ChoiceField(label='Source Language: ', choices=s_language)
    t_lang = forms.ChoiceField(label='Target Language: ', choices=s_language)
    file_url = forms.FileField(label="File: ")
    name = forms.CharField(label="Name: ")
    subject = forms.CharField(label="Subject: ")
    note = forms.CharField(label="Note: ", widget=forms.Textarea(attrs={'rows': 5}))
    user = forms.CharField(label='', widget=forms.HiddenInput())
    class Meta:
        model = tm_model
        fields = ['name', 'subject', 's_lang', 't_lang', 'file_url', 'user', 'note']

class ConcondanceSearchForm(forms.Form):
    ignoreTags = forms.BooleanField(label='Ignore inline tags', required=False)
    # searchTm = forms.CharField(label='Search TM',required=False, widget=forms.TextInput(attrs={'placeholder':'Search TM'}))
    searchCondance = forms.CharField(label='Entry Words', required=False, widget=forms.TextInput(attrs={'placeholder':'Entry Words'}))
    
