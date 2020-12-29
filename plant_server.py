# FLASK_APP=plant_server.py flask run

from flask import Flask
from flask import request
from flask_cors import CORS, cross_origin
import plant
import json

# flags
SAVE_JSONS = False;

app = Flask(__name__)
# app.config['SECRET_KEY'] = 'the quick brown fox jumps over the lazy   dog'
# app.config['CORS_HEADERS'] = 'Content-Type'

cors = CORS(app, resources={r"/datamuse": {"origins": "*"}})

@app.route("/hello")
def hello():
    return "Hello World!"

@app.route('/datamuse', methods=['GET'])
@cross_origin(origin='localhost',headers=['Content- Type','Authorization'])

def askDatamuse():
    w = request.args.get('word')
    c = request.args.get('domain')
    t = request.args.get('type')
    print("plant" + w + " in " + c + " as " + t)
    result, lastWord = plant.datamuse(w, c, t)
    data = {
    "type":t,
    "seed":w,
    "domain":c,
    "endWord":lastWord,
    "results":result
    }

    if (SAVE_JSONS):
        filename = w + "_" + c + "_" + t
        with open("localStorage/" + filename + '.json','w') as f:
            json.dump(data, f)

    return json.dumps(data)

if __name__ == "__main__":
    app.run()
