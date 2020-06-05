import re
import ast
import os, subprocess
from pptx import Presentation
from pptx.enum.action import PP_ACTION
from docx import Document
from docx.opc.constants import RELATIONSHIP_TYPE as RT
from lxml import etree
from translator.translation_model.processing import evaluate, normalizeString, normalizeString_fix
from .models import BilingualCorpus, POSTaggedCorpus, BilingualSentence, POSTaggedSentence

from .apps import TranslatorConfig
from django.conf import settings
from translate.storage.tmx import tmxfile

import textdistance
import difflib
from nltk.corpus import stopwords
cachedStopWords = stopwords.words("english")

def removeStopwords(text):
    return ' '.join([word for word in text.split() if word not in cachedStopWords])
def compare_matchrate(element):
    return element['match_rate']
# cocondance search
# def concordance_search(tm_objects, searchCon, matchRate, search_lang):
#     out_sequences_per_tm = []
#     for tm_object in tm_objects:
#         tm_url = os.path.join(settings.MEDIA_ROOT, getattr(tm_object, 'file_url').name)
#         print(os.path.join(settings.MEDIA_ROOT, tm_url))
#         tm_s_lang = getattr(tm_object, 's_lang')
#         tm_t_lang = getattr(tm_object, 't_lang')
#         tm_name = getattr(tm_object, 'name')
#         if os.path.isfile( tm_url):
#             fin = open(tm_url, 'rb')
#             tmx_file = tmxfile(fin, tm_s_lang, tm_t_lang)
#             if search_lang == "all":
#                 pass
#             else:
#                 source_sequences = []
#                 target_sequences = []
#                 for node in tmx_file.unit_iter():
#                     source_sequences.append(node.getsource().lower())
#                     target_sequences.append(node.gettarget().lower())
#                 extracted = process.extract(searchCon.lower(), source_sequences, scorer=fuzz.partial_ratio, limit=len(source_sequences))
#                 s_sequences = [sent for sent in extracted if sent[1] >= int(matchRate)]
#                 for entry in s_sequences:
#                     for i, sequence in enumerate(source_sequences):
#                         if entry[0] == sequence:
#                             out_sequences_per_tm.append({'source':entry[0], 'target': target_sequences[i], 'tm_name':tm_name, 'match_rate':entry[1]})
#                             break
#     out_sequences_per_tm.sort(key=compare_matchrate, reverse=True)
#     return out_sequences_per_tm

# # levenshtein match
def concordance_search(tm_objects, searchCon, matchRate, search_lang):
    # normalized_levenshtein = NormalizedLevenshtein()
    out_sequences = []
    q_tokens = removeStopwords(searchCon).split()
    for tm_object in tm_objects:
        tm_url = os.path.join(settings.MEDIA_ROOT, getattr(tm_object, 'file_url').name)
        tm_s_lang = getattr(tm_object, 's_lang')
        tm_t_lang = getattr(tm_object, 't_lang')
        tm_name = getattr(tm_object, 'name')
        if os.path.isfile( tm_url):
            fin = open(tm_url, 'rb')
            tmx_file = tmxfile(fin, tm_s_lang, tm_t_lang)
            for node in tmx_file.unit_iter():
                sequence = node.getsource()
                s_tokens = removeStopwords(sequence).split()
                average_rate = 0
                index_list = []
                ordering = False
                for q_token in q_tokens:
                    q_index = s_tokens.index(q_token) if q_token in s_tokens else -1
                    if q_index == -1:
                        matched = difflib.get_close_matches(q_token, s_tokens, n=1, cutoff=0.85)
                        if len(matched) > 0:
                            average_rate += float(textdistance.ratcliff_obershelp(q_token,matched[0]))
                    else:
                        average_rate += 1
                        index_list.append([q_token, q_index])
                average_rate = int(average_rate / max(len(s_tokens), len(q_tokens)) * 100)
                if average_rate >= matchRate:
                    out_sequences.append({'source':sequence, 'target': node.gettarget(), 'tm_name':tm_name, 'match_rate':average_rate})
    out_sequences.sort(key=compare_matchrate, reverse=True)
    return out_sequences

# Concordance Search by SDL SDK
def concordance_search_sdk(tm_objects, searchCon, matchRate, search_lang):
    out_sequences = []
    q_tokens = removeStopwords(searchCon).split()
    for tm_object in tm_objects:
        tm_url = os.path.join(settings.MEDIA_ROOT, getattr(tm_object, 'sdltm_url').name)
        tm_s_lang = getattr(tm_object, 's_lang')
        tm_t_lang = getattr(tm_object, 't_lang')
        tm_name = getattr(tm_object, 'name')
        if os.path.isfile( tm_url):
            exe_path = r"C:\\Program Files (x86)\\SDL\\SDL Trados Studio\\Studio15\\concordance_search.exe"
            cmd = [exe_path, tm_url, "False",searchCon, "1000", str(matchRate)]
            param = []
            p = subprocess.Popen(cmd,
                        stdin=subprocess.PIPE,
                        stdout=subprocess.PIPE,
                        stderr=subprocess.PIPE,
                        universal_newlines=True,
                        encoding='utf-8')
            searchResults, err = p.communicate('\n'.join(map(str, param)))
            searchResults = ast.literal_eval(searchResults)
            for result in searchResults:
                out_sequences.append({'source':result.get("sourceTU"), 'target': result.get('targetTU'), 'tm_name':tm_name, 'match_rate':result.get("Match")})
    out_sequences.sort(key=compare_matchrate, reverse=True)
    return out_sequences

# get filename and extention
def get_nameNextention(url):
    return os.path.splitext(url)

# translate text file
def translate_text_file(s_url, t_url, s_lang, t_lang):
    t_file = open(t_url, "w", encoding="utf-8")
    with open(s_url, "r", encoding='utf-8') as file:
        lines = file.readlines()
        for line in lines:
            translated_line = translate_sentences(line)
            t_file.write(translated_line)
    file.close()

# translate senteces
def translate_sentences(sentences):
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
            predicted = evaluate(input_lang, output_lang, encoder, decoder, normalizeString(sentence), False, cutoff_length=30)
            predicted = predicted.replace(" ", "")
            predicted = predicted.replace("<EOS>", "")

            predicted_sentences.append(predicted)
    for i, sent in enumerate(pre_sentences):
        output_sentences = output_sentences.replace(sent,predicted_sentences[i])
    return output_sentences

# translate file and return traslated file url
def translate_file(uploaded_file_url, s_lang, t_lang):
    filename, extention = get_nameNextention(uploaded_file_url)

    trans_file_url = filename + "_" + t_lang + extention
    if extention == '.txt':
        translate_text_file(uploaded_file_url, trans_file_url, s_lang, t_lang)
    elif extention == '.docx':
        translate_docx_file(uploaded_file_url, trans_file_url, s_lang, t_lang)
    elif extention == '.pptx':
        translate_pptx_file(uploaded_file_url, trans_file_url, s_lang, t_lang)
    elif extention == '.xliff':
        translate_xliff_file(uploaded_file_url, trans_file_url, s_lang, t_lang)
    elif extention == '.sdlxliff':
        translate_sdlxliff_file(uploaded_file_url, trans_file_url, s_lang, t_lang)
    else:
        pass
    return trans_file_url, os.path.basename(trans_file_url)

# translate docx file
def translate_docx_file(s_url, t_url, s_lang, t_lang):
    document = Document(s_url)
    for paragraph in document.paragraphs:
        inline = paragraph.runs
        
        # hyperlink = p.xpath("./w:hyperlink/w:r/w:t")
        # hyperlink_text = ""
        # for link in hyperlink:
        #     link.text = "abcd"
        #     hyperlink_text += link.text
        # print(hyperlink_text)
        for i in range(len(inline)):
            orig = inline[i].text
            if orig.strip() != "":
                result = translate_sentences(orig)
                inline[i].text = result
    for table in document.tables:
        for row in table.rows:
            for cell in row.cells:
                orig = cell.text
                if orig.strip() != "":
                    cell.text = translate_sentences(orig)

    document.save(t_url)

# translate pptx file
def translate_pptx_file(s_url, t_url, s_lang, t_lang):
    prs = Presentation(s_url)
    for slide in prs.slides:
        for shape in slide.shapes:
            if shape.has_text_frame:
                text_frame = shape.text_frame
                for p in text_frame.paragraphs:
                    inline = p.runs
                    for i in range(len(inline)):
                        orig = inline[i].text
                        if orig.strip() != "":
                            result = translate_sentences(orig)
                            inline[i].text = result
            if shape.has_table:
                for row in shape.table.rows:
                    for cell in row.cells:
                        for p in cell.text_frame.paragraphs:
                            inline = p.runs
                            for i in range(len(inline)):
                                orig = inline[i].text
                                if orig.strip() != "":
                                    result = translate_sentences(orig)
                                    inline[i].text = result
    prs.save(t_url)

#translate xliff file
def translate_xliff_file(s_url, t_url, s_lang, t_lang):
    tree = etree.parse(s_url)
    root = tree.getroot()


    for element in root:
        Source = element.attrib['source-language']
        Target =  element.attrib['target-language']

    source_lines = []
    for all_tags in root.findall('.//{urn:oasis:names:tc:xliff:document:1.2}source'):
        source_lines.append(all_tags.text)


    for i, all_tags in enumerate(root.findall('.//{urn:oasis:names:tc:xliff:document:1.2}target')):
        all_tags.text = translate_sentences(source_lines[i])

    tree.write(t_url, xml_declaration=True, encoding='UTF-8')

# translate sdlxliff file
def translate_sdlxliff_file(s_url, t_url, s_lang, t_lang):
    tree = etree.parse(s_url)
    root = tree.getroot()

    for element in root:
        Source = element.attrib['source-language']
        Target =  element.attrib['target-language']

    source_lines = []
    for source in root.findall('.//{urn:oasis:names:tc:xliff:document:1.2}seg-source'):
        for e in source:
            for g in e:
                if "mrk" in g.tag:
                    source_lines.append(g.text)
        pass
    cnt = 0
    for target in root.findall('.//{urn:oasis:names:tc:xliff:document:1.2}target'):
        for e in target:
            for g in e:
                if "mrk" in g.tag:
                    g.text = translate_sentences(source_lines[cnt])
                    cnt += 1

    tree.write(t_url, xml_declaration=True, encoding='UTF-8')

