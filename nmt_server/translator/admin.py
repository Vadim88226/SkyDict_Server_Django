from django.contrib import admin
from django.contrib.auth.models import Group
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.forms import UserChangeForm, UserCreationForm
from translator.models import User, CorpusStatus, BilingualSentence, BilingualCorpus, POSTaggedCorpus, POSTaggedSentence

class SkyDictUserChangeForm(UserChangeForm):
    class Meta(UserChangeForm.Meta):
        model = User
class SkyDictUserCreationForm(UserCreationForm):
    class Meta(UserCreationForm.Meta):
        model = User

    def clean_username(self):
        username = self.cleaned_data['username']
        try:
            User.objects.get(username=username)
        except User.DoesNotExist:
            return username
        raise forms.ValidationError(self.error_messages['duplicate_username'])

class SkyDictUserAdmin(UserAdmin):
    form = SkyDictUserChangeForm
    add_form = SkyDictUserCreationForm
    fieldsets = ((None, {'fields': ('username', 'password')}), 
        ('Personal info', {'fields': ('first_name', 'last_name', 'email')}), 
        ('Permissions', {'fields': ('is_active', 'is_staff', 'linguist', 'is_superuser', 'groups', 'user_permissions')}), 
        ('Important dates', {'fields': ('last_login', 'date_joined')}),)

admin.site.unregister(Group)
admin.site.register(User, SkyDictUserAdmin)
admin.site.register(CorpusStatus)
admin.site.register(BilingualCorpus)
admin.site.register(POSTaggedCorpus)
admin.site.register(BilingualSentence)
admin.site.register(POSTaggedSentence)

