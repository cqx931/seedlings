# FLASK_APP=plant_server.py flask run

from flask import Flask
from flask import request
from flask_cors import CORS, cross_origin
import plant
import json

app = Flask(__name__)
app.config['SECRET_KEY'] = 'the quick brown fox jumps over the lazy   dog'
app.config['CORS_HEADERS'] = 'Content-Type'

cors = CORS(app, resources={r"/datamuse": {"origins": "http://0.0.0.0:8000"}})


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
    result = plant.datamuse(w, c, t)
    return json.dumps(result)

if __name__ == "__main__":
    app.run()
