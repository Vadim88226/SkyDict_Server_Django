import re
from django.shortcuts import render, get_object_or_404
from django.http import HttpResponse, Http404, HttpResponseRedirect, JsonResponse
from django.template import loader
from django.urls import reverse
from django.views import generic
from django.utils import timezone
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

