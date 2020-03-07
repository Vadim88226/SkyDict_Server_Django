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
from django.db.models import Count


class IndexView(generic.TemplateView):
    template_name = 'translator/content.html'

# display Dictionary Page
def DictionaryView(request):
    search_input_form = DictForm()
    return render(request, 'dictionary/content.html', {'search_input_form': search_input_form})

# display User_Words Page
def User_WordsView(request, suburl = ""):
    search_input_form = DictForm()
    add_words_form = AddWordsForm(initial={'t_lang': 'Thai'})
    return render(request, 'user_words/content.html', {'search_input_form': search_input_form, 'add_words_form': add_words_form, 'suburl': suburl})

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
    with open(dataset_file, encoding="utf8") as fp:
        cnt = 0
        index = 1
        for line in fp:
            if match.search(line):
                line = re.sub(r'\b({0})\b'.format(word), "<b>" + word + "</b>", line)
                ref_sentences = linecache.getline(ref_file, index)
                example_sentences += "<ul><li>" + line +  "</li><li>" + ref_sentences + "</li></ul>"
                if cnt >= 30:
                    break
                cnt += 1
            index += 1
    return example_sentences

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
    lexi_dict_data = search_dict(selectedText, s_lang)
    user_dict_records = DictWords.objects.filter(word=selectedText, s_lang=s_lang, is_approved = 1)
    user_dict_data = ""
    user_sentences_data = ""
    for i, data in enumerate(user_dict_records):
        if i == 0:
            user_dict_data += "<k>" + getattr(data, 'word') + "</k>\n"
        user_dict_data += "<i><co><abr>" + getattr(data, 'part') + "</abr></co></i>\n"
        user_dict_data += "<dtrn>" + getattr(data, 'trans') + "</dtrn>"
        user_sentences_records = DictSentences.objects.filter(dictwords = data)
        for j, sentence in enumerate(user_sentences_records):
            user_sentences_data += "<ul><li>" + getattr(sentence, 's_sentence') + "</li>"
            user_sentences_data += "<li>" + getattr(sentence, 't_sentence') + "</li></ul>"
    response = {}
    response["dictionary"] = {}
    response["dictionary"]["Lexitron Dictionary"] = lexi_dict_data
    response["dictionary"]["User Dictionary"] = user_dict_data
    sentences = query_example_sentences(selectedText, s_lang)
    response["sentences"] = {}
    response["sentences"]["WIT Copus"] = sentences
    response["sentences"]["User Dictionary"] = user_sentences_data
    return JsonResponse(response)

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
    if request.method == "POST":
        form = SignupForm(data=request.POST)
        if form.is_valid():
            user = form.save(commit=False)
            user.is_active = False
            user.save()
            current_site = get_current_site(request)
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

# query matched words list
def text_similar_words(request):
    query = request.GET.get('seltext', None)
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
            if cnt >= 5:
                return JsonResponse({'content':responses})
    return JsonResponse({'content': responses})

# file uploading and downloading for translate
def upload_file(request):
    if request.method == 'POST' and request.FILES['docTrans']:
        s_lang = request.POST.get('sl', None)
        t_lang = request.POST.get('tl', None)
        source_file = request.FILES['docTrans']
        fs = FileSystemStorage()
        filename = fs.save(source_file.name, source_file)
        uploaded_file_url = fs.path(filename)
        trans_file_url, tfilename = translate_file(uploaded_file_url, s_lang, t_lang)
        return JsonResponse({'content': tfilename})
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
        _d = DictWords(word=_vocabulary, part= _part, s_lang=_s_lang, t_lang=_t_lang, trans= _trans, user= _user)
        _d.save()
        for _sentence in _cont[2:]:
            _s = DictSentences(part= _part, s_sentence= _sentence[0], t_sentence = _sentence[1], dictwords=_d)
            _s.save()

    return JsonResponse({'content': "Successfully Rigistry!"})

# vocabulary list query
def vocabulary_list(request):
    _word = request.GET.get('seltext', "")
    _is_approved = request.GET.get('is_approved', 0)
    if len(_word) and _is_approved == '2':
        _filter = DictWords.objects.filter(word=_word)
    elif len(_word):
        _filter = DictWords.objects.filter(word=_word, is_approved=_is_approved)
    else:
        _filter = DictWords.objects.filter(is_approved=_is_approved)
    # print(_filter)
    datas = list(_filter.order_by('word').values("word", "user").annotate(Count('word'), Count('user')))
    response = {}
    for i, data in enumerate(datas):
        response[i] = data
    # print( response )
    
    return JsonResponse(response)

def query_user_dictionary(request):
    _word = request.GET.get('seltext')
    _user = request.GET.get('user')
    _is_approved = request.GET.get('is_approved', 0)


    user_dict_records = DictWords.objects.filter(word=_word, user=_user, is_approved = _is_approved)
    print(user_dict_records)
    user_dict_data = {}
    for i, data in enumerate(user_dict_records):
        user_dict_data[i] = {}
        user_dict_data[i]['word_id'] = getattr(data, 'id')
        user_dict_data[i]['part'] = getattr(data, 'part')
        user_dict_data[i]['trans']= getattr(data, 'trans')
        user_dict_data[i]['user']= getattr(data, 'user')
        user_sentences_records = DictSentences.objects.filter(dictwords = data)
        user_dict_data[i]['sentences'] = {}
        for j, sentence in enumerate(user_sentences_records):
            user_dict_data[i]['sentences'][j] = {}
            user_dict_data[i]['sentences'][j]['sent_id'] = getattr(sentence, 'id')
            user_dict_data[i]['sentences'][j]['s_sentence'] = getattr(sentence, 's_sentence')
            user_dict_data[i]['sentences'][j]['t_sentence'] = getattr(sentence, 't_sentence')

    return JsonResponse(user_dict_data)


def update_sentence(request):
    _sent_id = request.GET.get('sent_id')
    _s_sentence = request.GET.get('s_sentence')
    _t_sentence = request.GET.get('t_sentence')
    DictSentences.objects.filter(id=int(_sent_id)).update(s_sentence = _s_sentence, t_sentence = _t_sentence)

    return JsonResponse({'content': "You successfully updated these sentence!"})

def delete_sentence(request):
    _sent_id = request.GET.get('sent_id')
    DictSentences.objects.filter(id=int(_sent_id)).delete()

    return JsonResponse({'content': "You deleted these sentences."})

def update_vocabulary(request):
    _word_id = request.GET.get('word_id')
    _trans = request.GET.get('trans')
    DictWords.objects.filter(id=int(_word_id)).update(trans=_trans)
    return JsonResponse({'content': "You updated this vocabulary."})

def approve_vocabulary(request):
    _word = request.GET.get('word')
    _user = request.GET.get('user')
    DictWords.objects.filter(word=_word, user=_user).update(is_approved=1)
    return JsonResponse({'content': "You successfully approved this vocabulary."})

def delete_vocabulary(request):
    _word = request.GET.get('word')
    _user = request.GET.get('user')
    DictWords.objects.filter(word=_word, user=_user).delete()
    return JsonResponse({'content': "You deleted this vocabulary."})