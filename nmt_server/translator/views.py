import re
import linecache
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
from translator.translation_model.processing import normalizeString, normalizeString_fix
from django.contrib.auth import views as auth_views
from django.views.decorators.csrf import requires_csrf_token
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.core.mail import EmailMessage
from .forms import SignupForm, DictForm
from .tokens import account_activation_token
from django.contrib.auth.forms import UserCreationForm
from django.conf import settings
from nltk.corpus import words
words_list = list(set(words.words()))


class IndexView(generic.TemplateView):
    template_name = 'translator/content.html'

# display Dictionary Page
def DictionaryView(request):
    form = DictForm();
    return render(request, 'dictionary/content.html', {'form': form})

# query word for Lexitron dictionary
def search_dict(word, lang):
    dict = TranslatorConfig.en_th_dict
    if lang == 'th':
        dict = TranslatorConfig.th_en_dict
    try:
        response = dict.dict[word]
    except KeyError:
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
                ref_sentences = linecache.getline(ref_file, index)
                example_sentences+="<ul><li>" + line +  "</li><li>" + ref_sentences + "</li></ul>"
                if cnt > 10:
                    break
                cnt += 1
            index += 1
    return example_sentences

# query word for query language
def query_dict(request):
    selectedText = request.GET.get('seltext', None)
    s_lang = request.GET.get('sl', '')
    t_lang = request.GET.get('tl', '')
    response = search_dict(selectedText, s_lang)

    sentences = query_example_sentences(selectedText, s_lang)
    print(sentences)
    data = {
        'content' : response,
        'sentences' : sentences
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
        output_sentences = sentences
        nlp = TranslatorConfig.en_nlp
        tokens = nlp(sentences)
        predicted_sentences = []
        pre_sentences = []
        encoder = TranslatorConfig.encoder
        decoder = TranslatorConfig.decoder
        input_lang = TranslatorConfig.input_lang
        output_lang = TranslatorConfig.output_lang

        for sent in tokens.sents:
            pre_sentence = sent.string.strip()
            for sent1 in pre_sentence.splitlines():
                if sent1=='':
                    continue
                pre_sentences.append(sent1)
                sentence = re.sub(' +', ' ', sent1)
                # sentence = normalizeString_fix(sentence, True)
                print(sentence)
                predicted = evaluate(input_lang, output_lang, encoder, decoder, sentence, False, cutoff_length=30)
                predicted = predicted.replace(" ", "")
                predicted = predicted.replace("<EOS>", "")

                predicted_sentences.append(predicted)



        # print(pre_sentences)
        for i, sent in enumerate(pre_sentences):
            output_sentences = output_sentences.replace(sent,predicted_sentences[i])
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
    print(query)
    s_lang = request.GET.get('sl', None)
    dict = TranslatorConfig.en_th_dict
    if s_lang == 'th':
        dict = TranslatorConfig.th_en_dict
    cnt = 0
    responses = ""
    for word in words_list:
        response = search_dict(word, s_lang)
        if word.startswith(query) and response != "":
            cnt += 1
            response = re.search('<dtrn>.+</dtrn>', response).group()
            response = response.replace("<dtrn>", "").replace("</dtrn>", "")
            responses += "<ul><li>" + word + "</li><li>" + response + "</li></ul>"
            if cnt >= 4:
                return JsonResponse({'content':responses})
    return JsonResponse({'content': responses})


