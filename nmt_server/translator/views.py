from django.shortcuts import render, get_object_or_404
from django.http import HttpResponse, Http404, HttpResponseRedirect, JsonResponse
from django.template import loader
from django.urls import reverse
from django.views import generic
from django.utils import timezone
from .models import TransModel
from .apps import TranslatorConfig
from translator.translation_model.processing import evaluate
from translator.translation_model.processing import normalizeString


class IndexView(generic.TemplateView):
    template_name = 'translator/index.html'

def query_dict(request):
    selectedText = request.GET.get('seltext', None)
    dict = TranslatorConfig.en_th_dict
    response = dict.dict[selectedText]
    data = {
        'content' : response
    }
    return JsonResponse(data)

def trans_sentences(request):
    sentences = request.GET.get('seltext', None)
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
        pre_sentences.append(sent.string.strip())
        sentence = ' '.join(sent.string.split())
        sentence = normalizeString(sentence, True)
        predicted = evaluate(input_lang, output_lang, encoder, decoder, sentence, False, cutoff_length=30)
        predicted = predicted.replace(" ", "")
        predicted = predicted.replace("<EOS>", "")

        predicted_sentences.append(predicted)


    for i, sent in enumerate(pre_sentences):
        output_sentences = output_sentences.replace(sent,predicted_sentences[i])




    data = {
        'content' : output_sentences
    }
    print(output_sentences)
    return JsonResponse(data)
