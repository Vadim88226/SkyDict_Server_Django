import re
from django.shortcuts import render, get_object_or_404, redirect
from django.http import HttpResponse, Http404, HttpResponseRedirect, JsonResponse
from django.template import loader
from django.template import Context 
from django.urls import reverse
from django.views import generic
from django.utils import timezone
from django.contrib import messages
from django.contrib.auth import authenticate, login 
from django.contrib.auth.decorators import login_required 
from django.contrib.auth.forms import AuthenticationForm 

from .forms import UserRegisterForm 
from django.core.mail import send_mail 
from django.core.mail import EmailMultiAlternatives

from .models import TransModel
from .apps import TranslatorConfig
from translator.translation_model.processing import evaluate
from translator.translation_model.processing import normalizeString, normalizeString_fix


class IndexView(generic.TemplateView):
    template_name = 'translator/index.html'

def query_dict(request):
    selectedText = request.GET.get('seltext', None)
    dict = TranslatorConfig.en_th_dict    
    try:
        response = dict.dict[selectedText]
    except KeyError:
        response = ""
    print(response)
    data = {
        'content' : response
    }
    return JsonResponse(data)

def trans_sentences(request):
    sentences = request.GET.get('seltext', '')
    s_lang = request.GET.get('sl', '')
    t_lang = request.GET.get('tl', '')

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



        print(pre_sentences)
        for i, sent in enumerate(pre_sentences):
            output_sentences = output_sentences.replace(sent,predicted_sentences[i])
        data = {
            'content' : output_sentences
        }


    else:
        data = {
            'content' : "no supported"
        }

    return JsonResponse(data)

def register(request): 
    if request.method == 'POST': 
        form = UserRegisterForm(request.POST) 
        if form.is_valid(): 
            form.save() 
            username = form.cleaned_data.get('username') 
            email = form.cleaned_data.get('email') 
            ######################### mail system ####################################  
            htmly = loader.get_template('translator / Email.html') 
            d = { 'username': username } 
            subject, from_email, to = 'welcome', 'your_email@gmail.com', email 
            html_content = htmly.render(d) 
            msg = EmailMultiAlternatives(subject, html_content, from_email, [to]) 
            msg.attach_alternative(html_content, "text / html") 
            msg.send() 
            ##################################################################  
            messages.success(request, f'Your account has been created ! You are now able to log in') 
            return redirect('login') 
    else: 
        form = UserRegisterForm() 
    return render(request, 'translator / register.html', {'form': form, 'title':'reqister here'}) 

def Login(request): 
    if request.method == 'POST': 
   
        # AuthenticationForm_can_also_be_used__ 
   
        username = request.POST['username'] 
        password = request.POST['password'] 
        user = authenticate(request, username = username, password = password) 
        if user is not None: 
            form = login(request, user) 
            messages.success(request, f' wecome {username} !!') 
            return redirect('index') 
        else: 
            messages.info(request, f'account done not exit plz sign in') 
    form = AuthenticationForm() 
    return render(request, 'translator / login.html', {'form':form, 'title':'log in'}) 