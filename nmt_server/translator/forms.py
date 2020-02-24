from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User

class SignupForm(UserCreationForm):
    class Meta:
        model = User
        fields = ('email', 'username', 'first_name', 'last_name', 'password1','password2')

class DictForm(forms.Form):
    find_word = forms.CharField(label='',required=False, widget=forms.TextInput(attrs={'placeholder': 'Enter word','autofocus':True}))

class AddWordsForm(forms.Form):
    fields = ('noun','verb_trans','verb_intrans','modal_verb','aux','adj','adv','prep','conj','pron','phrase','jargon','colloqial','slang','vulgar','abbreviation_or_acronym','name','organization','unique_name','other')
    labels = ('noun','verb(trans)','verb(intrans)','modal verb','aux. verb','adj.','adv.','prep.','conj.','pron.','phrase','jargon','colloqial','slang','vulgar','abbreviation or acronym','name','organization','unique name','other')
    chklabels = list(zip(fields,labels))
    # chk_box1 = forms.MultipleChoiceField(label='', widget=forms.CheckboxSelectMultiple, choices=chklabels[0:7])
    # chk_box2 = forms.MultipleChoiceField(label='', widget=forms.CheckboxSelectMultiple, choices=chklabels[7:13])
    # chk_box3 = forms.MultipleChoiceField(label='', widget=forms.CheckboxSelectMultiple, choices=chklabels[13:])
    chk_box = forms.MultipleChoiceField(label='', widget=forms.CheckboxSelectMultiple, choices=chklabels)\