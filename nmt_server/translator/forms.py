from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User
from .models import TransMemories, UserSetting, BilingualCorpus, POSTaggedCorpus

class SignupForm(UserCreationForm):
    class Meta:
        model = User
        fields = ('email', 'username', 'first_name', 'last_name', 'password1','password2')

class AddWordsForm(forms.Form):
    s_language = [('en', 'English'), ('th','Thai')]
    s_lang = forms.ChoiceField(label='Translate from ', choices=s_language)
    t_lang = forms.ChoiceField(label=' to ', choices=s_language)
    Vocabulary = forms.CharField(widget=forms.TextInput(attrs={'placeholder':'Enter Vocabulary'}))
    fields = ('noun','verb','adj',      'adv',   'idiom', 'prep',       'conj',       'pron',   'classifier', 'abbreviation','interjection', 'prefix', 'suffix', 'determiner', 'slang','article', 'other')
    labels = ('noun','verb','adjective','adverb','idiom', 'preposition','conjunction','pronoun','classifier', 'abbreviation','interjection', 'prefix', 'suffix', 'determiner', 'slang','article', 'other')
    chklabels = list(zip(fields,labels))
    part1 = forms.MultipleChoiceField(label='', widget=forms.CheckboxSelectMultiple, choices=chklabels[0:6])
    part2 = forms.MultipleChoiceField(label='', widget=forms.CheckboxSelectMultiple, choices=chklabels[6:12])
    part3 = forms.MultipleChoiceField(label='', widget=forms.CheckboxSelectMultiple, choices=chklabels[12:])
    chk_agree = forms.ChoiceField(label='', widget=forms.CheckboxInput)

class UserDictForm(forms.Form):
    s_language = [('en', 'English'), ('th','Thai')]
    s_lang = forms.ChoiceField(label='Translate from ', choices=s_language)
    t_lang = forms.ChoiceField(label=' to ', choices=s_language)

class TransMemoryForm(forms.ModelForm):
    s_language = [('en', 'English'), ('th','Thai')]
    s_lang = forms.ChoiceField(label='Source Language: ', choices=s_language)
    t_lang = forms.ChoiceField(label='Target Language: ', choices=s_language)
    file_url = forms.FileField(label="File: ")
    # sdltm_url = forms.FileField(label="File: ")
    name = forms.CharField(label="Name: ", widget=forms.TextInput(attrs={'placeholder':'Enter Name','class':'form-control'}))
    subject = forms.CharField(label="Subject: ", widget=forms.TextInput(attrs={'placeholder':'Enter Subject'}))
    note = forms.CharField(label="Note: ", widget=forms.Textarea(attrs={'rows': 5,'class':'form-control'}))
    user = forms.CharField(label='', widget=forms.HiddenInput())
    class Meta:
        model = TransMemories
        fields = ['name', 'subject', 's_lang', 't_lang', 'file_url', 'user', 'note']

class SearchForm(forms.Form):
    searchTM = forms.CharField(label='Search TM', required=False, widget=forms.TextInput(attrs={'placeholder':'Search TM'}))
    searchCondance = forms.CharField(label='Search Words', required=False, widget=forms.TextInput(attrs={'placeholder':'Entry Words'}))
    searchWord = forms.CharField(label='',required=False, widget=forms.TextInput(attrs={'placeholder': 'Enter word','autofocus':True, 'autocomplete': 'off'} ))

class UserSettingForm(forms.ModelForm):
    s_language = [('all', 'All'), ('en', 'English'), ('th','Thai')]
    s_lang = forms.ChoiceField(label='Source Language', choices=s_language)
    t_lang = forms.ChoiceField(label='Target Language', choices=s_language)
    matchRate = forms.CharField(label='', widget=forms.TextInput(attrs={'placeholder':'Match Rate','class':'form-control'}))
    ignoreTags = forms.BooleanField(label='Ignore inline tags', required=False)
    class Meta:
        model = UserSetting
        fields = ['user', 's_lang', 't_lang', 'ignoreTags', 'matchRate']

     
class BilingualCorpusForm(forms.ModelForm):
    s_language = [('en', 'English'), ('th','Thai')]
    s_lang = forms.ChoiceField(label='Source Language: ', choices=s_language)
    t_lang = forms.ChoiceField(label='Target Language: ', choices=s_language)
    file_url = forms.FileField(label="File: ")
    # sdltm_url = forms.FileField(label="File: ")
    name = forms.CharField(label="Name: ", widget=forms.TextInput(attrs={'placeholder':'Enter Name','class':'form-control'}))
    # subject = forms.CharField(label="Subject: ", widget=forms.TextInput(attrs={'placeholder':'Enter Subject'}))
    note = forms.CharField(label="Note: ", widget=forms.Textarea(attrs={'rows': 5,'class':'form-control'}))
    user = forms.CharField(label='', widget=forms.HiddenInput())
    class Meta:
        model = BilingualCorpus
        fields = ['name', 's_lang', 't_lang', 'file_url', 'user', 'note']

class POSTaggedCorpusForm(forms.ModelForm):
    s_language = [('en', 'English'), ('th','Thai')]
    s_lang = forms.ChoiceField(label='Source Language: ', choices=s_language)
    t_lang = forms.ChoiceField(label='Target Language: ', choices=s_language)
    file_url = forms.FileField(label="File: ")
    tagged_file_url = forms.FileField(label="File: ")
    name = forms.CharField(label="Name: ", widget=forms.TextInput(attrs={'placeholder':'Enter Name','class':'form-control'}))
    # subject = forms.CharField(label="Subject: ", widget=forms.TextInput(attrs={'placeholder':'Enter Subject'}))
    note = forms.CharField(label="Note: ", widget=forms.Textarea(attrs={'rows': 5,'class':'form-control'}))
    user = forms.CharField(label='', widget=forms.HiddenInput())
    print(POSTaggedCorpus)
    class Meta:
        model = POSTaggedCorpus
        fields = ['name',  's_lang', 't_lang', 'file_url', 'tagged_file_url', 'user', 'note']

