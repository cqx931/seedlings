# General Evaluation of multilingual implementation of Seedlings_

## Current in use in Seedlings_
| Query parameters | Example | Result | Notes |
| ------------- | ------------- | ------------- | -------------
| topics  | Adjectives describing *ocean* sorted by how related they are to *temperature*  | [/words?rel_jjb=ocean&topics=temperature](https://api.datamuse.com/words?rel_jjb=ocean&topics=temperature)  | |
| rel_jjb  | Adjectives that are often used to describe *ocean* | [/words?rel_jjb=ocean](https://api.datamuse.com/words?rel_jjb=ocean)  |plant& ginkgo |
| rel_jja  | Nouns that are often described by the adjective *yellow*  | [/words?rel_jja=yellow](https://api.datamuse.com/words?rel_jja=yellow)  |plant: |
| rel_bga | Frequent followers of *hope* | [/words?rel_bga=hope](https://api.datamuse.com/words?rel_bga=hope)  | ivy:|
| ml | Words with a meaning similar to *perished* | [/words?ml=perished](https://api.datamuse.com/words?ml=perished)  | plant:portuguese wordnet|
| rel_trg  | "Triggers" (words that are statistically associated with *pain* in the same piece of text.)| [/words?rel_trg=pain](https://api.datamuse.com/words?rel_trg=pain)  | not sure i like this, maybe get related verbs instead|
| rel_ant  | Antonyms of *loud*)| [/words?rel_ant=loud](https://api.datamuse.com/words?rel_ant=loud)  | koru: no need at the moment|
| sp  | Words that start with *t*, end in *k*, and have *two* letters in between  | [/words?sp=t??k](https://api.datamuse.com/words?sp=t??k)  | pine:|
| rel_rhy  | words that rhymes  |   | willow:|

- `topics` is the hardest one to solve, but also how `topics` is implemented in datamuse is not very transparent
- Most `rel_` ones requires context, most of these in datamuse is based on google book ngrams and it's not available in Portuguese
  - maybe use chatgpt, or any other solutions?
  - `rel_jjb`, `rel_jja`, adj & noun pairs
  - `rel_bga` Frequent followers
  - `rel_trg` trigger word
- `rel_ant` start/ends with letter -> worst case I can write a function with a dictionary
- `rhymes` (pornounciation): https://github.com/Kyubyong/pron_dictionaries
- `ml` synonym: https://pypi.org/project/PyMultiDictionary/

# Resources
- Multilingual Dictionary (meaning)
 - https://pypi.org/project/PyMultiDictionary/
- Multilingual Wordnet
 - http://globalwordnet.org/resources/wordnets-in-the-world/
- Multilingual Pronounciation Library
 - https://github.com/Kyubyong/pron_dictionaries
- Pos Tagger
 - https://rdrpostagger.sourceforge.net/
- Portuguese NLP
  - https://github.com/ajdavidl/Portuguese-NLP
  - corpus: https://www.corpusdoportugues.org/hist-gen/
- n-grams
  - https://www.ngrams.info/portuguese.asp
# TODO
- implement plant
  - nltk tagger issue -> artagger
  - get chatgpt calls to provide a list of adjectives/nouns
