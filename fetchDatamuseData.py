import sys
import requests
from nltk.tokenize import word_tokenize
import multiprocessing as mp
from nltk.stem import WordNetLemmatizer
f = open("sketch/text.txt", "r")
all = f.read()

# api-endpoint
URL = "http://127.0.0.1:5000/datamuse"

# necessary data
f2 = open("sketch/stopWords.txt", "r")
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
                print(".")
        print("Finish:", word1)

def fetch(seed, domain, plant):
    PARAMS = {
    'word':seed,
    'domain':domain,
    'type':plant
    }
    r = requests.get(url = URL, params = PARAMS)

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
                wordList.append(wnl.lemmatize(token))

        print("Section:", index+1)
        print("Valid words:", len(wordList))
        wordLists.append(wordList)
    return wordLists


if __name__ == '__main__':
    mp.set_start_method('spawn', force=True)
    wordLists = prepareWordLists(all)
    # wordList 1 run till animal in pursuit
    batchFetch(wordLists[0])
    # pool = mp.Pool(mp.cpu_count())
    # # number of workers equal to number of sections
    # pool.map(batchFetch, [wordList for wordList in wordLists])
    # pool.close()
