import os
import sys
import unicodedata
import re
import math
import psutil
import time
import datetime
from io import open
import random
from random import shuffle
import argparse
import numpy as np

import torch
from torch.autograd import Variable
import torch.nn as nn
import torch.nn.functional as F
from torch import optim
import torch.cuda
import deepcut

use_cuda = torch.cuda.is_available()

# from .encoder import EncoderRNN
# from .decoder import DecoderAttn
def uniToAscii(sentence):
    return ''.join(
        c for c in unicodedata.normalize('NFD', sentence)
        if unicodedata.category(c) != 'Mn'
    )


"""Lowercase, trim, and remove non-letter characters (from pytorch)"""
def normalizeString(s, isEn=True, tagging = True):
    # if isEn:
    #     s = re.sub(r" ##AT##-##AT## ", r" ", s)
    #     s = uniToAscii(s.lower().strip())
    #     # s = re.sub(r"([.!?])", r" \1", s)
    #     # s = re.sub(r"[^a-zA-Z.!?]+", r" ", s)
    # else:
    #     # s = re.sub(r"[^a-zA-Z.!?]+", r" ", s)
    #     if not tagging:
    #         s = s.replace(" ", "")
    return s   

  
"""Denote patterns that sentences must start with to be kept in dataset. 
Can be changed if desired (from pytorch)"""
eng_prefixes = (
    "i am ", "i m ",
    "he is", "he s ",
    "she is", "she s",
    "you are", "you re ",
    "we are", "we re ",
    "they are", "they re "
)

"""Filters each input-output pair, keeping sentences that are less than max_length 
if start_filter is true, also filters out sentences that don't start with eng_prefixes"""
def filterPair(p, max_length, start_filter):
    filtered = len(p[0].split(' ')) < max_length and \
        len(p[1].split(' ')) < max_length 
    if start_filter:
        return filtered and p[0].startswith(eng_prefixes)
    else:
        return filtered
"""Filters all of the input-output language pairs in the dataset using filterPair 
for each pair (from pytorch)"""
def filterPairs(pairs, max_length, start_filter):
    return [pair for pair in pairs if filterPair(pair, max_length, start_filter)]

"""start of sentence tag"""
SOS_token = 0

"""end of sentence tag"""
EOS_token = 1

"""unknown word tag (this is used to handle words that are not in our Vocabulary)"""
UNK_token = 2


"""Lang class, used to store the vocabulary of each language"""
class Lang:
    def __init__(self, language):
        self.language_name = language
        self.word_to_index = {"SOS":SOS_token, "EOS":EOS_token, "<UNK>":UNK_token}
        self.word_to_count = {}
        self.index_to_word = {SOS_token: "SOS", EOS_token: "EOS", UNK_token: "<UNK>"}
        self.vocab_size = 3
        self.cutoff_point = -1


    def countSentence(self, sentence, tagging):
        if self.language_name == 'en' or tagging:
            for word in sentence.split(' '):
                self.countWords(word)
        if self.language_name == 'th' and not tagging:
            for word in deepcut.tokenize(sentence):
                self.countWords(word)


    """counts the number of times each word appears in the dataset"""
    def countWords(self, word):
        if word not in self.word_to_count:
            self.word_to_count[word] = 1
        else:
            self.word_to_count[word] += 1

    """if the number of unique words in the dataset is larger than the
    specified max_vocab_size, creates a cutoff point that is used to
    leave infrequent words out of the vocabulary"""
    def createCutoff(self, max_vocab_size):
        word_freqs = list(self.word_to_count.values())
        word_freqs.sort(reverse=True)
        if len(word_freqs) > max_vocab_size:
            self.cutoff_point = word_freqs[max_vocab_size]

    """assigns each unique word in a sentence a unique index"""
    def addSentence(self, sentence, tagging):
        new_sentence = ''
        if self.language_name == 'en' or tagging:
            for word in sentence.split(' '):
                unk_word = self.addWord(word)
                if not new_sentence:
                    new_sentence =unk_word
                else:
                    new_sentence = new_sentence + ' ' + unk_word
        if self.language_name == 'th' and not tagging:
            for word in deepcut.tokenize(sentence):
                unk_word = self.addWord(word)
                if not new_sentence:
                    new_sentence =unk_word
                else:
                    new_sentence = new_sentence + ' ' + unk_word
           
        return new_sentence

    """assigns a word a unique index if not already in vocabulary
    and it appeaars often enough in the dataset
    (self.word_to_count is larger than self.cutoff_point)"""
    def addWord(self, word):
        if self.word_to_count[word] > self.cutoff_point:
            if word not in self.word_to_index:
                self.word_to_index[word] = self.vocab_size
                self.index_to_word[self.vocab_size] = word
                self.vocab_size += 1
            return word
        else:
            return self.index_to_word[2]

'''prepares both the input and output Lang classes from the passed dataset'''

def prepareLangs(lang1, lang2, file_path, reverse=False, tagging = False):
    print("Reading lines...")

    if len(file_path) == 2:
        lang1_lines = open(file_path[0], encoding='utf-8').\
            read().strip().split('\n')

        lang2_lines = open(file_path[1], encoding='utf-8').\
            read().strip().split('\n')

        if len(lang1_lines) != len(lang2_lines):
            print("Input and output text sizes do not align")
            print("Number of lang1 lines: %s " %len(lang1_lines))
            print("Number of lang2 lines: %s " %len(lang2_lines))
            quit()

        pairs = []

        for line in range(len(lang1_lines)):
            pairs.append([normalizeString(lang1_lines[line], isEn=True, tagging=True),
                          normalizeString(lang2_lines[line], isEn=False, tagging=tagging)])            


    elif len(file_path) == 1:
        lines = open(file_path[0], encoding='utf-8').\
    	read().strip().split('\n')
        pairs = []
        for l in lines:
            s = l.split('|')
            pairs.append([normalizeString(s[0], isEn=True, tagging=tagging), normalizeString(s[1], isEn=False, tagging=tagging)])

    if reverse:
        pairs = [list(reversed(p)) for p in pairs]
        input_lang = Lang(lang2)
        output_lang = Lang(lang1)
    else:
        input_lang = Lang(lang1)
        output_lang = Lang(lang2)

    return input_lang, output_lang, pairs

"""completely prepares both input and output languages 
and returns cleaned and trimmed train and test pairs"""

def prepareData(lang1, lang2, file_path, max_vocab_size=50000, 
                reverse=False, trim=0, start_filter=False, perc_train_set=0.9, 
                print_to=None, tagging=False):
    
    input_lang, output_lang, pairs = prepareLangs(lang1, lang2, 
                                                  file_path, reverse, tagging=tagging)
    
    print("Read %s sentence pairs" % len(pairs))
    
    if print_to:
        with open(print_to,'a') as f:
            f.write("Read %s sentence pairs \n" % len(pairs))
    
    if trim != 0:
        pairs = filterPairs(pairs, trim, start_filter)
        print("Trimmed to %s sentence pairs" % len(pairs))
        if print_to:
            with open(print_to,'a') as f:
                f.write("Read %s sentence pairs \n" % len(pairs))

    print("Read filtered %s sentence pairs" % len(pairs))

    print("Counting words...")
    for pair in pairs:
        input_lang.countSentence(pair[0], tagging)
        output_lang.countSentence(pair[1], tagging)


    input_lang.createCutoff(max_vocab_size)
    output_lang.createCutoff(max_vocab_size)

    pairs = [(input_lang.addSentence(pair[0], tagging),output_lang.addSentence(pair[1], tagging)) 
             for pair in pairs]

    shuffle(pairs)
    
    train_pairs = pairs[:math.ceil(perc_train_set*len(pairs))]
    test_pairs = pairs[math.ceil(perc_train_set*len(pairs)):]

    print("Train pairs: %s" % (len(train_pairs)))
    print("Test pairs: %s" % (len(test_pairs)))
    print("Counted Words -> Trimmed Vocabulary Sizes (w/ EOS and SOS tags):")
    print("%s, %s -> %s" % (input_lang.language_name, len(input_lang.word_to_count),
                            input_lang.vocab_size,))
    print("%s, %s -> %s" % (output_lang.language_name, len(output_lang.word_to_count), 
                            output_lang.vocab_size))
    print()

    if print_to:
        with open(print_to,'a') as f:
            f.write("Train pairs: %s" % (len(train_pairs)))
            f.write("Test pairs: %s" % (len(test_pairs)))
            f.write("Counted Words -> Trimmed Vocabulary Sizes (w/ EOS and SOS tags):")
            f.write("%s, %s -> %s" % (input_lang.language_name, 
                                      len(input_lang.word_to_count),
                                      input_lang.vocab_size,))
            f.write("%s, %s -> %s \n" % (output_lang.language_name, len(output_lang.word_to_count), 
                            output_lang.vocab_size))
        
    return input_lang, output_lang, train_pairs, test_pairs

"""converts a sentence to one hot encoding vectors - pytorch allows us to just
use the number corresponding to the unique index for that word,
rather than a complete one hot encoding vector for each word"""
def indexesFromSentence(lang, sentence, tagging):
    indexes = []
    for word in sentence.split(' '):
        try:
            indexes.append(lang.word_to_index[word])
        except:
            indexes.append(lang.word_to_index["<UNK>"])
    return indexes


def tensorFromSentence(lang, sentence, tagging):
    indexes = indexesFromSentence(lang, sentence, tagging)
    indexes.append(EOS_token)
    result = torch.LongTensor(indexes).view(-1)
    if use_cuda:
        return result.cuda()
    else:
        return result
      
"""converts a pair of sentence (input and target) to a pair of tensors"""
def tensorsFromPair(input_lang, output_lang, pair, tagging):
    input_variable = tensorFromSentence(input_lang, pair[0], tagging)
    target_variable = tensorFromSentence(output_lang, pair[1], tagging)
    return (input_variable, target_variable)
  

"""converts from tensor of one hot encoding vector indices to sentence"""
def sentenceFromTensor(lang, tensor):
    raw = tensor.data
    words = []
    for num in raw:
        words.append(lang.index_to_word[num.item()])
    return ' '.join(words)


"""pads batches to allow for sentences of variable lengths to be computed in parallel"""
def pad_batch(batch):
    padded_inputs = torch.nn.utils.rnn.pad_sequence(batch[0],padding_value=EOS_token)
    padded_targets = torch.nn.utils.rnn.pad_sequence(batch[1],padding_value=EOS_token)
    return (padded_inputs, padded_targets)

input_lang_name = 'en'
output_lang_name = 'th'

"""name of your dataset"""
dataset = 'orig'

"""file path of dataset in the form of a tuple. If translated sentences are
stored in two files, this tuple will have two elements"""
raw_data_file_path = ('dataset/train.tags.th-en1.en', 'dataset/train.tags.th-en1.th')
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




def evaluate(input_lang, output_lang, encoder, decoder, sentence, tagging, cutoff_length):
	with torch.no_grad():
		input_variable = tensorFromSentence(input_lang, sentence, tagging)
		input_variable = input_variable.view(-1,1)
		enc_h_hidden, enc_c_hidden = encoder.create_init_hiddens(1)

		enc_hiddens, enc_outputs = encoder(input_variable, enc_h_hidden, enc_c_hidden)

		decoder_input = Variable(torch.LongTensor(1,1).fill_(output_lang.word_to_index.get("SOS")).cuda()) if use_cuda \
						else Variable(torch.LongTensor(1,1).fill_(output_lang.word_to_index.get("SOS")))
		dec_h_hidden = enc_outputs[0]
		dec_c_hidden = enc_outputs[1]

		decoded_words = []

		for di in range(cutoff_length):
			pred, dec_outputs = decoder(decoder_input, dec_h_hidden, dec_c_hidden, enc_hiddens)

			topv, topi = pred.topk(1,dim=1)
			ni = topi.item()
			if ni == output_lang.word_to_index.get("EOS"):
				decoded_words.append('<EOS>')
				break
			else:
				decoded_words.append(output_lang.index_to_word[ni])

			decoder_input = Variable(torch.LongTensor(1,1).fill_(ni).cuda()) if use_cuda \
							else Variable(torch.LongTensor(1,1).fill_(ni))
			dec_h_hidden = dec_outputs[0]
			dec_c_hidden = dec_outputs[1]

		output_sentence = ' '.join(decoded_words)
    
		return output_sentence

class EncoderRNN(nn.Module):
	def __init__(self,input_size,hidden_size,layers=1,dropout=0.1, bidirectional=True):
		super(EncoderRNN, self).__init__()
		if bidirectional:
			self.directions = 2
		else:
			self.directions = 1
		self.input_size = input_size
		self.hidden_size = hidden_size
		self.num_layers = layers
		self.dropout = dropout
		self.embedder = nn.Embedding(input_size,hidden_size)
		self.dropout = nn.Dropout(dropout)
		self.lstm = nn.LSTM(input_size=hidden_size,hidden_size=hidden_size,
                        num_layers=layers,dropout=dropout,
                        bidirectional=bidirectional,batch_first=False)
		self.fc = nn.Linear(hidden_size*self.directions, hidden_size)

	def forward(self, input_data, h_hidden, c_hidden):
		embedded_data = self.embedder(input_data)
		embedded_data = self.dropout(embedded_data)
		hiddens, outputs = self.lstm(embedded_data, (h_hidden, c_hidden))

		return hiddens, outputs

	"""creates initial hidden states for encoder corresponding to batch size"""
	def create_init_hiddens(self, batch_size):
		h_hidden = torch.zeros(self.num_layers*self.directions, 
                                    batch_size, self.hidden_size)
		c_hidden = torch.zeros(self.num_layers*self.directions, 
                                    batch_size, self.hidden_size)
		if torch.cuda.is_available():
			return h_hidden.cuda(), c_hidden.cuda()
		else:
			return h_hidden, c_hidden


class DecoderAttn(nn.Module):
	def __init__(self, hidden_size, output_size, layers=1, dropout=0.1, bidirectional=True):
		super(DecoderAttn, self).__init__()

		if bidirectional:
			self.directions = 2
		else:
			self.directions = 1
		self.output_size = output_size
		self.hidden_size = hidden_size
		self.num_layers = layers
		self.dropout = dropout
		self.embedder = nn.Embedding(output_size,hidden_size)
		self.dropout = nn.Dropout(dropout)
		self.score_learner = nn.Linear(hidden_size*self.directions, 
                                   hidden_size*self.directions)
		self.lstm = nn.LSTM(input_size=hidden_size,hidden_size=hidden_size,
                        num_layers=layers,dropout=dropout,
                        bidirectional=bidirectional,batch_first=False)
		self.context_combiner = nn.Linear((hidden_size*self.directions)
                                      +(hidden_size*self.directions), hidden_size)
		self.tanh = nn.Tanh()
		self.output = nn.Linear(hidden_size, output_size)
		self.soft = nn.Softmax(dim=1)
		self.log_soft = nn.LogSoftmax(dim=1)


	def forward(self, input_data, h_hidden, c_hidden, encoder_hiddens):

		embedded_data = self.embedder(input_data)
		embedded_data = self.dropout(embedded_data)	
		batch_size = embedded_data.shape[1]
		hiddens, outputs = self.lstm(embedded_data, (h_hidden, c_hidden))	
		top_hidden = outputs[0].view(self.num_layers,self.directions,
                                 hiddens.shape[1],
                                 self.hidden_size)[self.num_layers-1]
		top_hidden = top_hidden.permute(1,2,0).contiguous().view(batch_size,-1, 1)

		prep_scores = self.score_learner(encoder_hiddens.permute(1,0,2))
		scores = torch.bmm(prep_scores, top_hidden)
		attn_scores = self.soft(scores)
		con_mat = torch.bmm(encoder_hiddens.permute(1,2,0),attn_scores)
		h_tilde = self.tanh(self.context_combiner(torch.cat((con_mat,
                                                         top_hidden),dim=1)
                                              .view(batch_size,-1)))
		pred = self.output(h_tilde)
		pred = self.log_soft(pred)

		
		return pred, outputs

