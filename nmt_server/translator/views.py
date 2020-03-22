import re, json, os, linecache

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
from translator.translation_model.processing import evaluate
from django.contrib.auth import views as auth_views
from django.views.decorators.csrf import requires_csrf_token
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.core.mail import EmailMessage
from django.contrib.auth.forms import UserCreationForm
from django.conf import settings
from django.core.files.storage import FileSystemStorage
from django.db.models import Count, Max
from django.views.generic import ListView

from django_tables2 import MultiTableMixin, RequestConfig, SingleTableMixin, SingleTableView, tables
from django_tables2.export.views import ExportMixin
from django_tables2.paginators import LazyPaginator

from .apps import TranslatorConfig
from .forms import SignupForm, AddWordsForm, TransMemoryForm, SearchForm, UserSettingForm, UserDictForm
from .tokens import account_activation_token
from .models import DictWords, DictSentences, TransMemories, UserSetting
from .utils import translate_sentences, translate_file, cocondance_search
from .tables import tmTable, concondanceTable
from .filters import tmFilter


class IndexView(generic.TemplateView):
    template_name = 'translator/content.html'

# display Dictionary Page
def view_Dictionary(request):
    search_Form = SearchForm()
    return render(request, 'dictionary/content.html', {'search_Form': search_Form})

# display User_Words Page
def view_AddWords(request):
    search_Form = SearchForm()
    add_words_form = AddWordsForm(initial={'t_lang': 'th'})
    return render(request, 'user_words/content.html', {'search_Form': search_Form, 'add_words_form': add_words_form})

def view_user_dictionary(request):
    search_Form = SearchForm()
    user_dict_form = UserDictForm(initial={'t_lang': 'th'})
    return render(request, 'user_dict/content.html', {'search_Form': search_Form, 'user_dict_form': user_dict_form})

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
    # print(sentences)
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
        _word_id = int(_cont[0])
        _part = _cont[1]
        _trans = _cont[2]
        _related = _cont[3]
        _synonym = _cont[4]
        _antonym = _cont[5]
        if _word_id:
            _d = DictWords.objects.get(pk=_word_id)
            DictWords.objects.filter(id=_word_id).update(word=_vocabulary, s_lang=_s_lang, t_lang=_t_lang, trans= _trans, related=_related, synonym=_synonym, antonym=_antonym)
        else:
            _d = DictWords(word=_vocabulary, part= _part, s_lang=_s_lang, t_lang=_t_lang, user= _user, trans= _trans, related=_related, synonym=_synonym, antonym=_antonym)
            _d.save()
        for _sentence in _cont[6:]:
            if int(_sentence[0]):
                DictSentences.objects.filter(id=_sentence[0]).update(s_sentence = _sentence[1], t_sentence = _sentence[2])
            else:
                print("_d------------------------")
                print(_d)
                DictSentences(part= _part, s_sentence= _sentence[1], t_sentence = _sentence[2], dictwords=_d).save()

    return JsonResponse({'content': "Successfully Rigistry!"})

# vocabulary list query
def query_UserDictionaryList(request):
    _word = request.GET.get('seltext', "")
    _end_id = request.GET.get('end_id', 0)
    _is_approved = request.GET.get('is_approved', 0)

    if _is_approved == '2':
        query = "SELECT max(id) as mid, id, word, user from translator_dictwords WHERE id>{0} AND word LIKE '{1}%%' GROUP BY word, user ORDER BY word, user limit 50;".format(_end_id, _word)
    else:
        query = "SELECT max(id) as mid, id, word, user from translator_dictwords WHERE id>{0} AND word LIKE '{1}%%' AND is_approved='{2}' GROUP BY word, user ORDER BY word, user limit 50;".format(_end_id, _word, _is_approved)

    results = DictWords.objects.raw(query)
    response = [{'mid':result.mid, 'id':result.id, 'word':result.word, 'user':result.user} for result in results]

    # if _is_approved == '2':
    #     _filter = DictWords.objects.filter(id__gt=_end_id, word__icontains=_word)
    # else:
    #     _filter = DictWords.objects.filter(id__gt=_end_id, word__icontains=_word, is_approved=_is_approved)

    # datas = list(_filter.values('id', 'word', 'user').annotate(Count('word'), Count('user'), Max('id')).order_by('word'))
    
    # response = {}
    # # print(type(datas))
    # for i, data in enumerate(datas):
    #     # print(data)
    #     response[i] = data
    #     if i > 50:
    #         return JsonResponse(response)
    
    return JsonResponse({'content':response})

def query_WordContents(request):
    _word = request.GET.get('seltext')
    _user = request.GET.get('user')
    _is_approved = int(request.GET.get('is_approved', 0))
    if _is_approved == 2:
        user_dict_records = DictWords.objects.filter(word=_word, user=_user)
    else :
        user_dict_records = DictWords.objects.filter(word=_word, user=_user, is_approved = _is_approved)

    user_dict_data = {}
    for i, data in enumerate(user_dict_records):
        user_dict_data[i] = {}
        user_dict_data[i]['word_id'] = getattr(data, 'id')
        user_dict_data[i]['part'] = getattr(data, 'part')
        user_dict_data[i]['trans']= getattr(data, 'trans')
        user_dict_data[i]['related']= getattr(data, 'related')
        user_dict_data[i]['synonym']= getattr(data, 'synonym')
        user_dict_data[i]['antonym']= getattr(data, 'antonym')
        user_dict_data[i]['user']= getattr(data, 'user')
        user_sentences_records = DictSentences.objects.filter(dictwords_id = getattr(data, 'id'))
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
    _key_id = request.GET.get('key_id')
    _content = request.GET.get('content')
    _update = {_key_id:_content}
    DictWords.objects.filter(id=int(_word_id)).update(**_update)
    return JsonResponse({'content': "You updated this vocabulary."})

def approve_vocabulary(request):
    _word = request.GET.get('word')
    _user = request.GET.get('user')
    DictWords.objects.filter(word=_word, user=_user).update(is_approved=1)
    return JsonResponse({'content': "You successfully approved this vocabulary."})

def delete_vocabulary(request):
    _id = int(request.GET.get('id', 0))
    _word = request.GET.get('word')
    _user = request.GET.get('user')
    if _id:
        DictWords.objects.filter(id=_id).delete()
    else:
        DictWords.objects.filter(word=_word, user=_user).delete()

    return JsonResponse({'content': "You deleted this vocabulary."})

def lexitron_list(request):
    _word = request.GET.get('word')
    lang = request.GET.get('s_lang')
    mode = int(request.GET.get('mode'))
    dict = TranslatorConfig.en_th_dict
    if lang == 'th':
        dict = TranslatorConfig.th_en_dict
    _list = []
    max_count = 50
    list_count = 0
    start_flag = False
    if _word == "": start_flag = True
    for key in dict.idx.keys():
        if start_flag:
            _list.append(key)
            list_count += 1
        if key == _word:
            if mode == 0:
                _list.append(key)
            start_flag = True
        if list_count > max_count:
            return JsonResponse({'content': _list})
    return JsonResponse({'content': _list})

def view_ConcondanceSearch(request):
    sort = request.GET.get('sort', 'name')
    searchCon = request.GET.get('searchCondance', '')

    if UserSetting.objects.filter(user=request.user.id).exists() == False:
        row = UserSetting(user=request.user, s_lang='en', t_lang='th', matchRate='50', ignoreTags=0)
        row.save()

    own_settings=UserSetting.objects.get(user=request.user.id)

    s_lang = own_settings.s_lang
    t_lang = own_settings.t_lang
    match_rate = own_settings.matchRate
    tm_objects = None
    if s_lang == 'all':
        tm_objects = TransMemories.objects.all()
    else:
        tm_objects = TransMemories.objects.filter(s_lang = s_lang)
    if searchCon:
        search_result = cocondance_search(tm_objects, searchCon, match_rate, search_lang= s_lang)
    else:
        search_result = {}
    concondance_table = concondanceTable(search_result)


    search_Form = SearchForm(initial={'searchCondance':searchCon})
    # concondance_table = concondanceTable(TransMemories.objects.filter(name__contains=searchCon).order_by(sort))

    return render(request, "concondance/content.html", {
        'concondance_table': concondance_table, 
        'search_Form' : search_Form,
    })

def update_UserSetting(request):
    if request.method == 'POST':
        own_settings = UserSetting.objects.get(user=request.user.id)
        form = UserSettingForm(data=request.POST, instance=own_settings)
        if form.is_valid():
            form.save()
        return redirect("/concondance/")
    else:
        own_settings=UserSetting.objects.get(user=request.user.id)
        form = UserSettingForm(instance=own_settings)
        return HttpResponse(form)

def manipulate_TM(request):
    sort = request.GET.get('sort', 'name')
    searchTM = request.GET.get('searchTM', '')
    delID = request.POST.getlist('check')
    for _id in delID:
        try:
            TransMemories.objects.get(id = _id).delete()
        except:
            print("An exception occurred")

    table = tmTable(TransMemories.objects.filter(name__contains=searchTM).order_by(sort))
    search_Form = SearchForm(initial={'searchTM':searchTM})

    return render(request, "concondance/transMemories.html", {
        'table': table, 
        'search_Form':search_Form
        })

def upload_translationMemories(request):
    if request.method == 'POST':
        form = TransMemoryForm(request.POST, request.FILES)
        if form.is_valid():
            tm = form.save()
        return redirect('/manipulate_TM/')
    else:
        form = TransMemoryForm(initial={'t_lang':'th'})
        return HttpResponse(form)
