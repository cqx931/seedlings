import sys
import requests
from nltk.tokenize import word_tokenize
import multiprocessing as mp
from nltk.stem import WordNetLemmatizer
import json
from ast import literal_eval
f = open("sketch/text.txt", "r")
all = f.read()
SAVE_JSONS = True;

# api-endpoint
URL = "http://127.0.0.1:5000/datamuse"
# URL = "https://cqx931.pythonanywhere.com/datamuse"

# necessary data
f2 = open("sketch/stopWords.txt", "r")
stopWords = f2.read().split("\n")
punctuations = [",", ".",":","'","?","!","“","”","’","(",")",";"]
plants = ["ginkgo", "plant","ivy","bamboo","pine", "dandelion"]
# no domain for koru
wnl = WordNetLemmatizer()

def fix(word, words):
    for word1 in words:
        for word2 in words:
            if (word1 == word or word2 == word):
                if (word1 ==word):
                    word1 = "sense"
                elif (word2 == word):
                    word2 = "sense"
                for plant in plants:
                    fetch(word1, word2, plant)
        print("Fixed:", word1)

def batchFetch(words):
    for word1 in words:
        for word2 in words:
            if (word1 == word2):
                continue
            for plant in plants:
                fetch(word1, word2, plant)
                print(word1, word2, plant)
        print("Finish:", word1)

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
            with open("localStorage1/" + filename + '.json','w') as f:
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
            if (token not in stopWords and token not in punctuations):
                lemma = wnl.lemmatize(token)
                if token == 'us':
                    lemma = 'us'
                if lemma not in wordList:
                    wordList.append(lemma)

        print("Section:", index+1)
        print("Valid words:", len(wordList))
        wordLists.append(wordList)
    return wordLists


if __name__ == '__main__':
    mp.set_start_method('spawn', force=True)
    wordLists = prepareWordLists(all)
    # wordList 0 finished
    # wordList 1 run till animal in pursuit
    #finish wordList 1 but problematic run
    idx = 1
    print("Worker", 1, "local")
    print(wordLists[idx])
    # fix("sens", wordLists[idx])
    batchFetch(wordLists[idx])

    # pool = mp.Pool(mp.cpu_count())
    # # number of workers equal to number of sections
    # pool.map(batchFetch, [wordList for wordList in wordLists])
    # pool.close()
