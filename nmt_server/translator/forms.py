from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User


class SignupForm(UserCreationForm):
    class Meta:
        model = User
        fields = ('email', 'username', 'first_name', 'last_name', 'password1','password2')
class DictForm(forms.Form):
    find_word = forms.CharField(label='', widget=forms.TextInput(attrs={'placeholder': 'Enter word','autofocus':True}))