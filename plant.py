# Seedlings_ command interface
# Transplant a word into a new context

import sys
from random import shuffle, choice
from datamuse import datamuse
import nltk
import re

api = datamuse.Datamuse()

# Parameters
MAX = 10
SPEED = 50
enablePrint = False

############# DataMuse API ##############
# In use
#rel_bga: Related word_Frequent followers(w′ such that P(w′|w) ≥ 0.001, per Google Books Ngrams)
#rel_jja: Popular nouns modified by the given adjective, per Google Books Ngrams
#rel_jjb: Popular adjectives used to modify the given noun, per Google Books Ngrams
#rel_ant: Related word_Antonyms
# rel_trg: words that are triggered by (strongly associated with) the word
#ml means like
#sp spell like

#rel_bgb Frequent predecessors
#lc Left Context
#rc right context
# rel_bgb is better than lc

######################################
# Tools

def getPosTag(word):
    entry = nltk.pos_tag([word.lower()])
    if len(entry) > 0:
        tag = entry[0][1]
    else:
        tag = ""
    return tag

def getSimilarWord(word, avoid=[]):
    list = api.words(ml=word, max=SPEED)
    list = list[:5]
    shuffle(list)
    word_pos = getPosTag(word)
    for item in list:
        w = item["word"]
        if getPosTag(w) == word_pos and w is not word and " " not in word and w not in avoid:
            return w
    # if not satisfying the requirements above, still return the last result
    return w

def isBad(item, history, domain):
    w = item["word"]
    frequency = float(item["tags"][-1][2:])
    tag = w in history or domain in w or " " in w or frequency < 1 or re.match("^[a-zA-Z]*$", w) is None
    return tag

def isGood(item, history, domain):
    w = item["word"]
    #
    frequency = float(item["tags"][-1][2:])
    tag = not isBad(item, history, domain) and frequency < 400
    # if tag: print( w in history, domain in w, " " in w, frequency < 1, tag)
    return tag

def reversePrint(toPrint):
    toPrint.reverse()
    for item in toPrint:
        if (enablePrint):
            print(item)

######################################
# Plants

def plant(start, domain,pos=""):
    # can only start with jj or nn

    word = start
    history = [word]
    toPrint = []
    context = []

    print("--------------------------------------")
    print("Plant " + start + " in " + domain + ":")

    for i in range(MAX):
        pos = getPosTag(word)
        if pos == "NN" or pos =="NNS":
            # print("CASE", "NN")
            context = api.words(rel_jjb=word, topics=domain, max=SPEED, md="pf")
        elif pos == "JJ" or "RB" in pos:
            # print("CASE", "JJ")
            context = api.words(rel_jja=word, topics=domain, max=SPEED, md="pf")
        else:
            # edge case: when getPosTag can't return any, treat as nn
            context = api.words(rel_jjb=word, topics=domain, max=SPEED, md="pf")

        if len(context) == 0:
            word = getSimilarWord(word, history)
            context = api.words(rel_jja=word, topics=domain, max=SPEED, md="pf")
            continue

        # random shuffle
        context = context[0:5] # the top 5 most related ones
        shuffle(context) #shuffle for better result

        for item in context:

            if isBad(item, history, domain):
                continue

            pos = item["tags"][0:len(item["tags"])-1]

            if  "adj" in pos :
                next = item["word"]
                history.append(next)
                toPrint.append(next + "|" + word)
                a_next = getSimilarWord(next, history)
                toPrint.append(" "*(len(next)-len(a_next)) + a_next + "\\")
                if (enablePrint):
                     print(" "*(len(next)-len(a_next)) + a_next + "\\")
                word = a_next
                break
            elif "n" in pos:
                next = item["word"]
                history.append(next)
                toPrint.append(word + "|" + next)
                if (enablePrint):
                     print(word + "|" + next)
                next = getSimilarWord(next, history)
                toPrint.append("/" + next)
                if (enablePrint):
                     print("/" + next)
                word = next
                break

    if (enablePrint):
         print("-->", word)
    # reversePrint(toPrint)
    return toPrint, word

def ivy(start, domain):
    print("--------------------------------------")
    print("Plant " + start + " in " + domain + " as ivy :")
    word = start
    history = [word]
    count = 0;
    if (enablePrint):
         print(word, end="", flush=True)
    while( count < 50):

        next = api.words(rel_bga=word, topics=domain, max=SPEED, md="pf")
        if(len(next) == 0):
            # if the word can't get any result, return
            break
        count = count + 1;
        shuffle(next)
        for item in reversed(next):
            if not isGood(item, history, domain):
                # print("not good", item["word"], float(item["tags"][-1][2:]))
                continue
            if isBad(item, history, domain):
                # print("isBad", item["word"], float(item["tags"][-1][2:]))
                continue
            if len(history) < 4 and item["word"] is ".":
                continue
            next = item["word"]
            history.append(next)
            if (enablePrint):
                 print(" " + next, end="", flush=True)
            word = next
            break
        if word is '.' or ("NN" in getPosTag(word) and len(history) > 5) or len(history) > 13:
            break

    idk = -1;
    if (history[-1] in ".?!,'"):
         idk = idk - 1
    while(-idk <= len(history) and "NN" not in getPosTag(word)):
        idk = idk - 1
    lastword = history[idk]
    if (enablePrint):
         print("-->", lastword)
    return history, lastword

def dandelion(word, domain):
    # rel_trg=cow, words triggered by

    print("--------------------------------------")
    print("Plant " + word + " in " + domain + " as dandelion :")
    history = []
    next = api.words(rel_trg=word, topics=domain, max=SPEED, md="f")

    while (len(next) < 3):
        similar = api.words(ml=word, max=SPEED, md="f")
        similar = similar[:5]
        shuffle(similar)
        word = similar[0]["word"]
        next = api.words(rel_trg=word, topics=domain, max=SPEED, md="f")
    shuffle(next)

    for item in next:
        if isBad(item, history,domain):
            continue
        else:
            w = item["word"]
            history.append(w)
            if (enablePrint):
                 print(" " + w, end="", flush=True)
        if len(history) == MAX:
            break

    shuffle(history)
    if (enablePrint):
         print()
    if (enablePrint):
         print("->", history[-1])
    return history, history[-1]

def bamboo(start, domain):
    # &sp=b*d: starts with b, ends with d
    print("--------------------------------------")
    print("Plant " + start + " in " + domain + " as bamboo:")
    word = start
    history = [word]
    if (enablePrint):
         print(word)
    for i in range(5):
        next = api.words(sp= "*"+ word[0], topics=domain, max=SPEED, md="f")
        if len(next) == 0:
            if (enablePrint):
                 print("Nothing is grown")
            break
        next = next[0:5]
        shuffle(next)
        for item in next:
            w = item["word"]
            if w in history:
                continue
            history.append(w)
            word = w
            if (enablePrint):
                 print(w)
            break
    if (enablePrint):
         print("-->", history[-1])
    return history, history[-1]

def koru(seed, domain=""):
    #ant
    print("--------------------------------------")
    print("Plant " + seed + " as koru:")
    word = seed
    history = [word]
    if (enablePrint):
         print(word)
    for i in range(MAX):
        next = api.words(rel_ant=word, max=SPEED, md="f")

        if len(next) == 0:
            next = api.words(ml=word, max=SPEED, md="pf")
            shuffle(next)
            for item in next:
                w = item["word"]
                if getPosTag(word) == getPosTag(w):
                    if w in history:
                        continue
                    else:
                        next = api.words(rel_ant=w, max=SPEED, md="f")
                        if len(next) != 0:
                            history.append(w)
                            word = w
                            if (enablePrint):
                                 print("~", w)
                            break
            continue

        shuffle(next)

        for item in next:
            w = item["word"]
            if w in history or " " in w or "-" in w:
                continue
            history.append(w)
            word = w
            if (enablePrint):
                 print("-",w)
            break
    if (enablePrint):
         print("-->", history[-1])
    return history, history[-1]

def pine(seed, domain):
    # sp=t?????k
    print("--------------------------------------")
    print("Plant " + seed + " in " + domain + " as pine:")
    word = seed
    history = []
    s = word[0]
    e = word[len(word)-1]

    for i in range(MAX):
        next = api.words(sp= s + "?"*(i+1) + e, topics=domain, max=SPEED, md="f")
        if len(next) == 0:
            continue
        next = next[0:10]
        shuffle(next)
        for item in next:
            w = item["word"]
            if isBad(item, history,domain):
                continue
            history.append(w)
            word = w
            if (enablePrint):
                 print(w)
            break
    lastword = choice(history)
    if (enablePrint):
         print("-->", lastword)
    return history, lastword
# def some root ....

def ginkgo(center,domain):
    # input has to be noun
    print("--------------------------------------")
    print("Plant " + center + " in " + domain + " as ginkgo:")
    word = center
    history = [word]
    for i in range(MAX):
        next = api.words(rel_jjb=domain, topics=domain, max=SPEED, md="pf")
        shuffle(next)
        for item in next:
            if isBad(item, history,domain):
                continue
            w = item["word"]
            history.append(w)
            if (enablePrint):
                 print(w + " " + word)
            break
    lastword = choice(history)
    if (enablePrint):
         print("-->", lastword)
    return history, lastword

PLANTS = {
"ginkgo":ginkgo,
"plant":plant,
"ivy":ivy,
"pine":pine,
"dandelion":dandelion,
"bamboo":bamboo,
"koru":koru
}

def randomPlant(start, domain):
    word = start
    last = ""
    for i in range(7):
        if (enablePrint):
             print("HERE:",word)
        tag = getPosTag(word)
        while(True):
            key, function = choice(list(PLANTS.items()))
            if key is not last:
                if (key is "ginkgo" and "NN" in tag) or (key in "plant koru" and tag in "NN NNS JJ") or key in "ivy bamboo pine dandelion":
                    break
        history, word = function(word, domain)
        last = key
    return

def datamuse(word, context, type):
    f = PLANTS[type]
    return f(word, context)

#plant: nn or jj
#ginkgo: nn
#koru: adj/nn
#random: bamboo, pine, ivy, dandelion
############

def test():
    print(getPosTag("more"), "RB" in getPosTag("more"));
    context = api.words(rel_jja="more", topics="environment", max=SPEED, md="pf")
    print(context)
    # detecting edge cases
    # for i in range(10):
    #     plant("ancient","environment")

def demo():
    plant("technology","consciousness")
    ginkgo("logic","sea")
    ivy("dream","proximity")
    dandelion("utopia","translation")
    pine("justice","alchemy")
    koru("binary")
    bamboo("bitterness","desert")

if __name__ == '__main__':

    if len(sys.argv) == 2:
        if sys.argv[1] == "test":
            test()
        elif sys.argv[1] == "demo":
            demo()

    elif (len(sys.argv) == 4 and sys.argv[2] == "in"):
        print("4", sys.argv)
        plant(sys.argv[1],sys.argv[3])
    elif (len(sys.argv) >= 4 and "as" in sys.argv and len(sys.argv) > sys.argv.index("as") + 1):
        idx = sys.argv.index("as")
        idx += 1
        if sys.argv[idx] == "ginkgo":
            ginkgo(sys.argv[1],sys.argv[3])
        elif sys.argv[idx] == "ivy":
            ivy(sys.argv[1],sys.argv[3])
        elif sys.argv[idx] == "koru":
            koru(sys.argv[1])
        elif sys.argv[idx] == "bamboo":
            bamboo(sys.argv[1],sys.argv[3])
        elif sys.argv[idx] == "pine":
            pine(sys.argv[1],sys.argv[3])
        elif sys.argv[idx] == "dandelion":
            dandelion(sys.argv[1],sys.argv[3])
        elif sys.argv[idx] == "random":
            randomPlant(sys.argv[1],sys.argv[3])
        else:
            plant(sys.argv[1],sys.argv[3])

    else:
        print("Wrong command, please follow the format: ")
        print("plant --word(noun or adjective) in --domain as --name")
