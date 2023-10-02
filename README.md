# Seedlings_

###  Transplant a word into a new context

*Seedlings_* is a project created by [Qianxun Chen](http://chenqianxun.com/). It is an experimental web interface to explore the artistic value of algorithmic correlations of words in data driven text analysis. Words are planted as seeds and grow into different ‘plants’ with the help of Datamuse API. It is at once an ambient piece in which words and concepts are dislocated and recontextualized constantly, and a playground for the user to create linguistic immigrants and textual nomads.

You can find a demo [here](http://chenqianxun.com/seedlings/demo/).(Best Viewed in Chrome)

<br/>

**Technical Breakdown of the project**
- API: Datamuse
- Back end: Python Flask Framework
- Front end: d3.js

---

**The following sections will be covered in the workshop.**
1. Intro to datamuse, how to use the datamuse API
2. More about *Seedlings_*
3. Basic introduction to d3.js, a JavaScript library for producing dynamic, interactive data visualizations in web browsers.

4. Build *Seedlings_* as a web app (?)

## Outline

1. **Datamuse**
  - 1.1 What is datamuse
  - 1.2 How to use datamuse?
  - 1.3 APIs used in *Seedlings_*

2. **Seedlings_**
  - 2.1 Defining Plants
  - 2.2 Visualization
  - 2.3 Interface

 3. **D3.js**
  - 3.1 What is d3.js
  - 3.2 A basic visualization example

4. **How Seedlings_ works**
  - 4.1 Setups for seedlings
  - 4.2 Plant from the Command Line!
  - 4.3 Plant server using flask
  - 4.4 PythonAnywhere
***

<br>

## 1. Datamuse

### 1.1 What is datamuse
![datamuse](https://www.datamuse.com/api/datamuse-logo-rgb.png)

“[The Datamuse API](https://www.datamuse.com/api/) is a **word-finding** query engine for developers. You can use it in your apps to find words that match a given set of **constraints** and that are likely in a given **context**. ”


**Major Data sources**
* Corpus-based data:[The Google Books Ngrams data set](http://storage.googleapis.com/books/ngrams/books/datasetsv2.html),to build the language model that scores candidate words by context
* Semantic knowledge: [word2vec](https://code.google.com/archive/p/word2vec/s), [Paraphrase Database](http://www.cis.upenn.edu/~ccb/ppdb/), [WordNet 3.0](http://wordnet.princeton.edu/)
* Phonetic data: [The CMU pronouncing dictionary](http://www.speech.cs.cmu.edu/cgi-bin/cmudict)


### 1.2 How to use datamuse?

You can access most of the features of the API at the URL [api.datamuse.com/words](api.datamuse.com/words), with the query parameters described below.

### 1.3 APIs Used in *Seedlings_*

  | Query parameters | Example | Result |
  | ------------- | ------------- | ------------- |
  | rel_jjb  | Adjectives that are often used to describe *ocean* | [/words?rel_jjb=ocean](https://api.datamuse.com/words?rel_jjb=ocean)  |
  | topics  | Adjectives describing *ocean* sorted by how related they are to *temperature*  | [/words?rel_jjb=ocean&topics=temperature](https://api.datamuse.com/words?rel_jjb=ocean&topics=temperature)  |
  | rel_jja  | Nouns that are often described by the adjective *yellow*  | [/words?rel_jja=yellow](https://api.datamuse.com/words?rel_jja=yellow)  |
  | rel_bga | Frequent followers of *hope* | [/words?rel_bga=hope](https://api.datamuse.com/words?rel_bga=hope)  |
  | ml | Words with a meaning similar to *perished* | [/words?ml=perished](https://api.datamuse.com/words?ml=perished)  |
  | rel_trg  | "Triggers" (words that are statistically associated with *pain* in the same piece of text.)| [/words?rel_trg=pain](https://api.datamuse.com/words?rel_trg=pain)  |
  | rel_ant  | Antonyms of *loud*)| [/words?rel_ant=loud](https://api.datamuse.com/words?rel_ant=loud)  |
  | sp  | Words that start with *t*, end in *k*, and have *two* letters in between  | [/words?sp=t??k](https://api.datamuse.com/words?sp=t??k)  |


***

## 2.Seedlings_
### 2.1 Defining Plants

| Type | Rules  |
| ------------- | ------------- |
| Plant  | Nouns(ml) <-> Adjectives(ml) |
| Dandelion  | Triggers of *word* in *context*|
| Ginkgo  | Adjectives that are often used to describe *context* + *word*|
| Ivy | A sequence of Frequent followers(rel_bga)|
| Pine | A list of words that start and end with the same letters as *word* in *context*|
| Bamboo | A sequence of words that ends with the first letter of the previous *word* in *context*|
| Willow | A list of words that rythm with the given *word*|

### 2.2 Visualization
#### Plant
![Plant](https://github.com/cqx931/seedlings/raw/master/images/plant.gif)

#### Dandelion
![Dandelion](https://github.com/cqx931/seedlings/raw/master/images/dandelion.gif)

#### Ginkgo
![Ginkgo](https://github.com/cqx931/seedlings/raw/master/images/ginkgo.gif)

#### Ivy
![Ivy](https://github.com/cqx931/seedlings/raw/master/images/ivy.gif)

#### Pine
![Pine](https://github.com/cqx931/seedlings/raw/master/images/pine.gif)

### 2.3 Interface

Check [here](http://chenqianxun.com/seedlings/interface/) to play with Seedlings_.(Best Viewed in Chrome)
***
## 3. D3.js

### 3.1 What is d3.js

"D3.js is a JavaScript library for manipulating documents based on data. D3 helps you bring data to life using HTML, **SVG**, and CSS." It is a great tool to create beautiful, interactive, browser-based data visualizations.

![d3](https://d3js.org/preview.png)

**SVG**
* SVG stands for Scalable Vector Graphics
* It is used to define graphics for the Web. It is not a direct image, but a way to create images following instructions. As its name suggests, it scales itself according to the size of the browser, so resizing your browser will not distort the image. All browsers support SVG except IE 8 and below. D3.js provides convenient tools to manipulate SVG.
* **Difference between Canvas and SVG**: Canvas is pixel-oriented. Once the pixels hit the screen, you cannot change shapes except by overwriting them with other pixels. However, SVG is like a "draw" program, its graphical elements become part of the DOM. Any part of any shape can be changed through script and CSS.

### 3.2 A basic visualization example

In [d3Example](https://github.com/cqx931/dialogic/tree/master/d3Example) you can find an interactive visualization of adjective/noun relationships in English. It was made using the "rel_jjb" and "rel_jja" queries in datamuse API, and the D3 force layout.

Modify the code to create your own linguistic plant!

***
## 4.How to build Seedlings_

### 4.1 Setups for seedlings

### 4.1.1 Python environment setup

Beautiful [intro to python documentation](https://github.com/antiboredom/detourning-the-web/blob/master/week_01/python_basics.md) by Sam Lavigne

#### a. Check your python version
Open terminal on MacOS, and type in the following and hit enter.
```
python -V
```
We are using python3 in this case  

#### b. Install pip
pip is a tool to install python library.
If you are on MacOS, open terminal, using command line:
```
sudo easy_install pip
```
You will be asked for your mac password, type it and hit enter.
You can also follow the [install guide here](https://pip.pypa.io/en/stable/installing/).

#### c. Install virtualenv
virtualenv creates isolated python environments tied to specific projects.
f
```
sudo pip install virtualenv
```
<!--
#### d. Run python local server
- Mac user

	```
	# If Python version returned above is 3.X
	python -m http.server
	# If Python version returned above is 2.X
	python -m SimpleHTTPServer
	```

- Windows user

	1. Go to python.org
	2. Under the Download section, click the link for Python "3.xxx".
	3. At the bottom of the page, choose the Windows x86 executable installer and download it.
	4. When it has downloaded, run it.
	5. On the first installer page, make sure you check the "Add Python 3.xxx to PATH" checkbox.
	6. Click Install, then click Close when the installation has finished.

<br /> -->

### 4.1.2 Setup Seedlings_

#### a. Setup directory(folder) and virtual environment

Create a new project folder "your_project_name", and [cd(change directory)](https://askubuntu.com/questions/520778/how-can-i-change-directories-in-the-terminal) to this folder on terminal.  
In terminal, type in the following to create a virtual environment for this project and activate it
```
virtualenv env
source env/bin/activate
```
You should see (env) at the front of the current line in terminal.

#### b. Install dependencies

- datamuse, nltk, flask

```
pip3 install -r requirements.txt
```
<br />

***

### 4.2 Plant Seedlings_ from the command line!
To see demo from all plant types:
```
python plant.py demo
```
An example of a generative chain:
```
python plant.py test
```
Plant specific seedlings with the following syntax:
"plant --word(noun or adjective) in --domain as --plantType"
```
python plant.py soft in postmodernism as plant
```
### 4.3 Build local plant server using flask
```
FLASK_APP=plant_server.py flask run
```
### 4.4 Deploying Flask Apps Using Python Anywhere
[Video tutorial](https://www.youtube.com/watch?v=M-QRwEEZ9-8)
