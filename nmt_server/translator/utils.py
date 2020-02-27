import re
import os
from pptx import Presentation
from pptx.enum.action import PP_ACTION
from docx import Document
from docx.opc.constants import RELATIONSHIP_TYPE as RT
from lxml import etree
from translator.translation_model.processing import evaluate, normalizeString, normalizeString_fix
from .apps import TranslatorConfig
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
    print(filename)
    print(extention)
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
    return trans_file_url

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
        # print(all_tags)
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
    for source in root.findall('.//{urn:oasis:names:tc:xliff:document:1.2}source'):
        for e in source:
            if "g" in e.tag:
                source_lines.append(e.text)
        pass
    cnt = 0
    for target in root.findall('.//{urn:oasis:names:tc:xliff:document:1.2}target'):
        for e in target:
            if "g" in e.tag:
                print(e.tag)
                e.text = translate_sentences(source_lines[cnt])
                cnt += 1

    tree.write(t_url, xml_declaration=True, encoding='UTF-8')

