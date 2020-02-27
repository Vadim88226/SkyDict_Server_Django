import re, json
import linecache
from langdetect import detect
from django.shortcuts import render, get_object_or_404, redirect
from django.http import HttpResponse, Http404, HttpResponseRedirect, JsonResponse
from django.template import loader
from django.contrib.sites.shortcuts import get_current_site
from django.utils.encoding import force_bytes, force_text
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.urls import reverse
from django.views import generic
from django.utils import timezone
from .apps import TranslatorConfig
from translator.translation_model.processing import evaluate
from django.contrib.auth import views as auth_views
from django.views.decorators.csrf import requires_csrf_token
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.core.mail import EmailMessage
from .forms import SignupForm, DictForm, AddWordsForm
from .tokens import account_activation_token
from django.contrib.auth.forms import UserCreationForm
from django.conf import settings
from django.core.files.storage import FileSystemStorage
from .models import DictWords, DictSentences
from .utils import translate_sentences, translate_file



class IndexView(generic.TemplateView):
    template_name = 'translator/content.html'

# display Dictionary Page
def DictionaryView(request):
    search_input_form = DictForm()
    return render(request, 'dictionary/content.html', {'search_input_form': search_input_form})

# display User_Words Page
def User_WordsView(request):
    search_input_form = DictForm()
    add_words_form = AddWordsForm()
    return render(request, 'user_words/content.html', {'search_input_form': search_input_form, 'add_words_form': add_words_form})

# query word for Lexitron dictionary
def search_dict(word, lang):
    dict = TranslatorConfig.en_th_dict
    if lang == 'th':
        dict = TranslatorConfig.th_en_dict
    try:
        response = dict.dict[word]
    except KeyError:
        response = ""
    except UnicodeDecodeError:
        response = ""
    return response

# query example sentences contains with query word
def query_example_sentences(word, s_lang):
    match = re.compile(r'\b({0})\b'.format(word), flags=re.IGNORECASE)
    dataset_file = TranslatorConfig.raw_data_file_path[0]
    ref_file = TranslatorConfig.raw_data_file_path[1]
    if s_lang == 'th':
        dataset_file = TranslatorConfig.raw_data_file_path[1]
        ref_file = TranslatorConfig.raw_data_file_path[0]

    example_sentences = ""
    example_sentences_more = ""
    with open(dataset_file, encoding="utf8") as fp:
        cnt = 0
        index = 1
        for line in fp:
            if match.search(line):
                line = re.sub(r'\b({0})\b'.format(word), "<b>" + word + "</b>", line)
                if cnt < 5:
                    ref_sentences = linecache.getline(ref_file, index)
                    example_sentences += "<ul><li>" + line +  "</li><li>" + ref_sentences + "</li></ul>"
                elif cnt < 30:
                    ref_sentences = linecache.getline(ref_file, index)
                    example_sentences_more += "<ul><li>" + line +  "</li><li>" + ref_sentences + "</li></ul>"
                else:
                    break
                cnt += 1
            index += 1
    return example_sentences, example_sentences_more

# detect language of query sentence
def detect_source_language(sentence):
    if detect(sentence) == 'th':
        return 'th'
    return 'en'

# query word for query language
def query_dict(request):
    selectedText = request.GET.get('seltext', None)
    s_lang = request.GET.get('sl', '')
    t_lang = request.GET.get('tl', '')

    s_lang = detect_source_language(selectedText)
    response = search_dict(selectedText, s_lang)

    sentences, sentences_more = query_example_sentences(selectedText, s_lang)
    data = {
        'content' : response,
        'sentences' : sentences,
        'sentences_more' : sentences_more
    }
    return JsonResponse(data)

# translate the senteces
def trans_sentences(request):
    sentences = request.GET.get('seltext', '')
    s_lang = request.GET.get('sl', '')
    t_lang = request.GET.get('tl', '')

    if s_lang == t_lang:
        selectedText = sentences.strip()
        data = {
            'content' : selectedText
        }
        return JsonResponse(data)
    # if senteces has only one word, display the content of dictionary
    if len(sentences.split()) == 1:
        selectedText = sentences.strip()
        response = search_dict(selectedText, s_lang)
        if response != "":
            response = re.search('<dtrn>.+</dtrn>', response).group()
            response = response.replace("<dtrn>", "").replace("</dtrn>", "")
        data = {
            'content' : response
        }
        return JsonResponse(data)
    # if sentences is valid, display the translated senteces
    if s_lang==t_lang:
        data = {
            'content' : sentences
        }
        return JsonResponse(data)

    if s_lang=='en' and t_lang=='th':
        output_sentences = translate_sentences(sentences)
        data = {
            'content' : output_sentences
        }


    else:
        data = {
            'content' : "unsupported"
        }

    return JsonResponse(data)

# log in function
def log_in(request):
    _email = request.GET.get('_email', '')
    _pwd = request.GET.get('_pwd')
    user = authenticate(username=_email, password = _pwd)
    print(user)
    if user is not None: 
        login(request, user) 
        data = {
            'content' :'ok' 
        }
        
    else: 
        data = {
            'content' : 'unregistered'
        }
    return JsonResponse(data)

# log out function
def log_out(request):
    logout(request)
    return JsonResponse({'content':'ok'})

# sign up function
def register(request):
    print(request.method)
    if request.method == "POST":
        form = SignupForm(data=request.POST)
        if form.is_valid():
            user = form.save(commit=False)
            user.is_active = False
            user.save()
            current_site = get_current_site(request)
            # mail_subject = 'Activate your SkyDict account.'
            # print(mail_subject)
            message = loader.render_to_string('account_activation_email.html', {
                'user': user,
                'domain': current_site.domain,
                'uid':urlsafe_base64_encode(force_bytes(user.pk)),
                'token':account_activation_token.make_token(user),
            })
            # user.email_user(mail_subject, message)
            mail = EmailMessage('Activate your SkyDict account.', message, to=[user.email], from_email=settings.EMAIL_HOST_USER)
            mail.content_subtype = 'html'
            mail.send()
            return JsonResponse({'content':'<p>Please confirm your email address to complete the registration. </p>'})
        else:
            return JsonResponse({'content': str(form.errors)})
        
    else:
        form = SignUpForm()
    return render(request, 'translator/index.html', {'form': form})

# display send mail of user sign up
def account_activation_sent(request):
    return render(request, 'account_activation_sent.html')

# user sign up mail activation
def activate(request, uidb64, token):
    try:
        uid = force_text(urlsafe_base64_decode(uidb64))
        user = User.objects.get(pk=uid)
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        user = None
    if user is not None and account_activation_token.check_token(user, token):
        user.is_active = True
        user.profile.email_confirmed = True
        user.save()
        login(request, user)
        data = {
            'content' : 'registered'
        }
        return JsonResponse(data)
    else:
        return render(request, 'account_activation_invalid.html')

# query matched words list
def detect_similar_words(request):
    query = request.GET.get('seltext', None)
    # print(query)
    s_lang = request.GET.get('sl', None)
    s_lang = detect_source_language(query)
    dict = TranslatorConfig.en_th_dict
    words_list = TranslatorConfig.en_words_list
    if s_lang == 'th':
        dict = TranslatorConfig.th_en_dict
        words_list = TranslatorConfig.th_words_list
    cnt = 0
    responses = ""
    for word in words_list:
        response = search_dict(word, s_lang)
        if word.startswith(query) and response != "":
            cnt += 1
            response = re.search('<dtrn>.+</dtrn>', response).group()
            response = response.replace("<dtrn>", "").replace("</dtrn>", "")
            responses += "<ul><li>" + word + "</li><li>" + response + "</li></ul>"
            if cnt >= 10:
                return JsonResponse({'content':responses})
    return JsonResponse({'content': responses})

def upload_file(request):
    if request.method == 'POST' and request.FILES['docTrans']:
        source_file = request.FILES['docTrans']
        fs = FileSystemStorage()
        filename = fs.save(source_file.name, source_file)
        uploaded_file_url = fs.path(filename)
        print(uploaded_file_url)
        trans_file_url = translate_file(uploaded_file_url, "en", "th")
        return JsonResponse({'content': trans_file_url})
    return JsonResponse({'content': ""})

def add_words(request):
    _user = request.GET.get('user')
    _s_lang = request.GET.get('sl')
    _t_lang = request.GET.get('tl')
    _vocabulary = request.GET.get('vocabulary', None)
    _content = json.loads(request.GET.get('content', None))
    
    for _cont in _content:
        _part = _cont[0]
        _trans = _cont[1]
        _e = DictWords(word=_vocabulary, part= _part, s_lang=_s_lang, t_lang=_t_lang, trans= _trans, user= _user)
        _e.save()
        _w_id = _e.id
        for _sentence in _cont[2:]:
            _e = DictSentences(word_id=_w_id, part= _part, s_sentence= _sentence[0], t_sentence = _sentence[1])
            _e.save()

    return JsonResponse({'content': "Successfuly Registry!"})