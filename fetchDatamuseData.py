import sys
import requests
import os.path
from nltk.tokenize import word_tokenize
import multiprocessing as mp
from nltk.stem import WordNetLemmatizer
import json
from ast import literal_eval

f = open("seedlings_FromHumus/text.txt", "r")
all = f.read()
SAVE_JSONS = True;

# api-endpoint
URL = "http://127.0.0.1:5000/datamuse"
# URL = "https://cqx931.pythonanywhere.com/datamuse"

# necessary data
f2 = open("seedlings_FromHumus/stopWords.txt", "r")
stopWords = f2.read().split("\n")
punctuations = [",", ".",":","'","?","!","“","”","’","(",")",";"]
plants = ["ginkgo", "plant","ivy","bamboo","pine", "dandelion"]
# no domain for koru
wnl = WordNetLemmatizer()

def batchFetch(words):
    for word1 in words:
        for word2 in words:
            if (word1 == word2):
                continue
            for plant in plants:
                fetch(word1, word2, plant)
                print(word1, word2, plant)
        print("Finish:", word1)

def fix(word, words):
    for word1 in words:
        for word2 in words:
            if (word is word1 or word is word2):
                for plant in plants:
                    fetch(word1, word2, plant)
                    print(word1, word2, plant)
    print("Fixed:", word1)

def fetch(seed, domain, plant):
    PARAMS = {
    'word':seed,
    'domain':domain,
    'type':plant
    }
    r = requests.get(url = URL, params = PARAMS)
    if (SAVE_JSONS):
        filename = seed + "_" + domain + "_" + plant
        try:
            j = literal_eval(r.content.decode('utf8'))
            with open("localStorage_extra/" + filename + '.json','w') as f:
                json.dump(j, f)
        except:
            print("skip:no valid plant")

def prepareWordLists(text):
    sections = text.split("________________")
    wordLists = []
    for index in range(len(sections)):
        section = sections[index]
        tokens = word_tokenize(section)
        wordList = []

        for token in tokens:
            token = token.lower()
            lemma = wnl.lemmatize(token)
            if (token not in stopWords and lemma not in stopWords and token not in punctuations):
                if token == 'us':
                    continue
                if token == 'everywheres':
                    lemma = 'everywhere'
                if lemma == 'sens':
                    lemma = 'sense'
                if lemma not in wordList:
                    wordList.append(lemma)

        print("Section:", index+1)
        print("Valid words:", len(wordList))
        wordLists.append(wordList)
    return wordLists

def checkFile(seed, domain, plant):
    file = seed + "_" + domain + "_" + plant
    if not os.path.isfile("sketch/localStorage/" + file + ".json"):
        print (seed + "_" + domain + "_" + plant + "")
        # fetch(seed, domain, plant)

def checkLocalStorage(words):
    for word1 in words:
        for word2 in words:
            if (word1 == word2):
                continue
            for plant in plants:
                checkFile(word1, word2, plant)
        # print("Finish check:", word1)

if __name__ == '__main__':
    mp.set_start_method('spawn', force=True)
    wordLists = prepareWordLists(all)
    # print(wordLists[idx])
    #
    # print("Worker", 2,3,4, "local")
    # # save to localStorage
    fetch("theory","sponge", "plant");
    # checkLocalStorage(wordLists[5])

    # idx = 4
    # print(wordLists[idx])
    # fix("everywhere", wordLists[idx]);
