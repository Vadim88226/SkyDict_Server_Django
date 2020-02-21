from django.apps import AppConfig

import unicodedata
import re
import os
import math
import psutil
import torch
from torch.autograd import Variable
import torch.nn as nn
import torch.nn.functional as F
from torch import optim
import torch.cuda
import deepcut
from pystardict import Dictionary
from translator.translation_model.processing import prepareData
from translator.translation_model.processing import EncoderRNN
from translator.translation_model.processing import DecoderAttn

import spacy



input_lang_name = 'en'
output_lang_name = 'th'

"""name of your dataset"""
dataset = 'orig'
SITE_ROOT = os.path.dirname(os.path.realpath(__file__))

DATASET_DIR = os.path.join(SITE_ROOT, "dataset\\")
en_dataset = "train.tags.th-en1.en"
th_dataset = "train.tags.th-en1.th"


# raw_data_file_path = ('eng-fra_orig.txt',)

"""True if you want to reverse the order of the sentence pairs. For example, 
in our dataset the sentence pairs list the English sentence first followed by
the French translation. But we want to translate from French to English,
so we set reverse as True."""
reverse=False

"""Remove sentences from dataset that are longer than trim (in either language)"""
trim = 60

"""max number of words in the vocabulary for both languages"""
max_vocab_size= 100000

"""if true removes sentences from the dataset that don't start with eng_prefixes.
Typically will want to use False, but implemented to compare results with Pytorch
tutorial. Can also change the eng_prefixes to prefixes of other languages or
other English prefixes. Just be sure that the prefixes apply to the OUTPUT
language (i.e. the language that the model is translating to NOT from)"""
start_filter = False

"""denotes what percentage of the data to use as training data. the remaining 
percentage becomes test data. Typically want to use 0.8-0.9. 1.0 used here to 
compare with PyTorch results where no test set was utilized"""
perc_train_set = 1.0

"""OUTPUT OPTIONS"""

"""denotes how often to evaluate a loss on the test set and print
sample predictions on the test set.
if no test set, simply prints sample predictions on the train set."""
test_eval_every = 1

"""denotes how often to plot the loss values of train and test (if applicable)"""
plot_every = 1

"""if true creates a txt file of the output"""
create_txt = True

"""if true saves the encoder and decoder weights to seperate .pt files for later use"""
save_weights = True

"""HYPERPARAMETERS: FEEL FREE TO PLAY WITH THESE TO TRY TO ACHIEVE BETTER RESULTS"""

"""signifies whether the Encoder and Decoder should be bidirectional LSTMs or not"""
bidirectional = True
if bidirectional:
	directions = 2
else:
	directions = 1

"""number of layers in both the Encoder and Decoder"""
layers = 2

"""Hidden size of the Encoder and Decoder"""
hidden_size = 440

"""Dropout value for Encoder and Decoder"""
dropout = 0.2

"""Training set batch size"""
batch_size = 32

"""Test set batch size"""
test_batch_size = 2

"""number of epochs (full passes through the training data)"""
epochs = 200

"""Initial learning rate"""
learning_rate= 1

"""Dataset has pos-tagging(splitted by space according to the POS)"""
tagging = True

"""Learning rate schedule. Signifies by what factor to divide the learning rate
at a certain epoch. For example {5:10} would divide the learning rate by 10
before the 5th epoch and {5:10, 10:100} would divide the learning rate by 10
before the 5th epoch and then again by 100 before the 10th epoch"""
lr_schedule = {}

"""loss criterion, see https://pytorch.org/docs/stable/nn.html for other options"""
criterion = nn.NLLLoss()

use_cuda = torch.cuda.is_available()
use_cuda = False

encoder_file = SITE_ROOT + "/translation_model/testdata.orig_trim.60_vocab.100000_directions.2_layers.2_hidden.440_dropout.0.2_learningrate.1_batch.4_epochs.50_enc_weights.pt"
decoder_file = SITE_ROOT + "/translation_model/testdata.orig_trim.60_vocab.100000_directions.2_layers.2_hidden.440_dropout.0.2_learningrate.1_batch.4_epochs.50_dec_weights.pt"






en_th_dict_name = "LexitronEnTh"
th_en_dict_name = 'LexitronThEn'
en_th_dict_path = os.path.join(SITE_ROOT, 'dictionary', en_th_dict_name, en_th_dict_name)
th_en_dict_path = os.path.join(SITE_ROOT, 'dictionary', th_en_dict_name, th_en_dict_name)
class TranslatorConfig(AppConfig):

    """file path of dataset in the form of a tuple. If translated sentences are
    stored in two files, this tuple will have two elements"""
    raw_data_file_path = (DATASET_DIR + en_dataset, DATASET_DIR + th_dataset)

    input_lang, output_lang, train_pairs, test_pairs = prepareData(input_lang_name, output_lang_name, raw_data_file_path, max_vocab_size=max_vocab_size, reverse=reverse, trim=trim, 
    start_filter=start_filter, perc_train_set=perc_train_set, print_to=None, tagging=tagging)

    name = 'translator'    
    en_th_dict = Dictionary(en_th_dict_path)
    th_en_dict = Dictionary(th_en_dict_path)
    """create the Encoder"""
    encoder = EncoderRNN(input_lang.vocab_size, hidden_size, layers=layers, 
                        dropout=dropout, bidirectional=bidirectional)

    """create the Decoder"""
    decoder = DecoderAttn(hidden_size, output_lang.vocab_size, layers=layers, 
                        dropout=dropout, bidirectional=bidirectional)
    encoder.load_state_dict(torch.load(encoder_file))
    decoder.load_state_dict(torch.load(decoder_file))
    encoder.eval()
    decoder.eval()
    if use_cuda:
        print('Cuda being used')
        encoder = encoder.cuda()
        decoder = decoder.cuda()
    en_nlp = spacy.load("en_core_web_sm")


