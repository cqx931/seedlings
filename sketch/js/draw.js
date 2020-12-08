
// ************** Generate the diagram  *****************

var margin = {top: 20, right: 50, bottom: 20, left: 50},
    width = window.innerWidth + LEFT_MARGIN*2,
    height = 1100;

var timeOutTracker = null;
// var diagonal = d3.svg.diagonal()
//  .projection(function(d) { return [d.y, d.x]; });

const svg = d3.select(".content").append("svg")
.attr("width", window.innerWidth)
.attr("height", height)
.append("g")
.attr("transform", "translate(" + margin.left + "," + 0 + ")")
.attr("class","wrapper");

const soilSVG = svg.append("g")
                   .attr("id","soil")
let plants = {};//global data

var plantsData = {
  "0":{
  "id": "0",
  "type":"pine",
  "seed":"spine",
  "domain":"jerusalem",
  "x": 300,
  "y": 400,
  // "return":"serene",
  "results":["sie", "sine", "snake", "serene", "spectre", "solstice", "sepulchre", "senescence","subordinate","subservience"], //9
 }
};

var edges = {

};

var data = {
  'plants':plantsData,
  'edges': edges
};

let soil = [];

const testPlants = ["koru"];
// done: ivy
// Issues:
// plant, words split issue?
// bamboo, ginkgo, pine, dandelion, pine : scattering

// shuffle(testPlants);
initializeSoil();
adjustView(700);
plant("soap",'sea', testPlants[0], getRandomArbitrary(100, 200), 720)
// plant("humanity",'technology',  testPlants[1], getRandomArbitrary(350, 400), 600, 15000)
// // plant("distance",'anatomy', "pine", 600, 530, 20000)
// plant("body",'literature', testPlants[2], getRandomArbitrary(900, 1000), 710, 30000)
/**********************************/

function checkIntersections(r){
  const rootId = r.id,
        x = r.currentPos.x, y = r.currentPos.y,
        x1 = r.nextPos.x, y1 = r.nextPos.y;
  // id - "_root" = plant id
  const plantId = rootId.split("_")[0];
  for (var i = 0; i < soil.length; i++) {
    let b = soil[i].boundingBox;
    const collid = lineRect(x,y,x1,y1,b.x,b.y,b.width,b.height);
    if (collid) {
      const newW = soil[i].text;
      const pos = RiTa.pos(newW)[0];
      if (newW.indexOf("’") > 0) return;
      if (r.plant.lookFor && pos.indexOf(r.plant.lookFor) < 0) {
        console.log("The word is not what the plant looks for.", newW, pos);
        return;
      }
      const plant = plants["" + plantId];
      plant.updateDomain(RiTa.stem(newW), RiTa.LANCASTER);
      clearInterval(r.timer);
      r.plant.next = r.plant.endWord;
      if (r.plant.branchTimer == null) {
        r.plant.reGenerate();
      }
    }
  }
  return false;
}

function lineRect(x1, y1, x2, y2, rx, ry, rw, rh) {
  // Modified from: http://www.jeffreythompson.org/collision-detection/line-rect.php

  function lineLine(x1, y1, x2, y2, x3, y3, x4, y4) {

    // calculate the direction of the lines
    const uA = ((x4-x3)*(y1-y3) - (y4-y3)*(x1-x3)) / ((y4-y3)*(x2-x1) - (x4-x3)*(y2-y1));
    const uB = ((x2-x1)*(y1-y3) - (y2-y1)*(x1-x3)) / ((y4-y3)*(x2-x1) - (x4-x3)*(y2-y1));

    // if uA and uB are between 0-1, lines are colliding
    if (uA >= 0 && uA <= 1 && uB >= 0 && uB <= 1) {
      // const intersectionX = x1 + (uA * (x2-x1));
      // const intersectionY = y1 + (uA * (y2-y1));
      return true;
    }
    return false;
  }
  // check if the line has hit any of the rectangle's sides
  // uses the Line/Line function below
  const left =   lineLine(x1,y1,x2,y2, rx,ry,rx, ry+rh);
  const right =  lineLine(x1,y1,x2,y2, rx+rw,ry, rx+rw,ry+rh);
  const top =    lineLine(x1,y1,x2,y2, rx,ry, rx+rw,ry);
  const bottom = lineLine(x1,y1,x2,y2, rx,ry+rh, rx+rw,ry+rh);

  // if ANY of the above are true, the line
  // has hit the rectangle
  if (left || right || top || bottom) {
    return true;
  }
  return false;
}

function initializeSoil() {
  let xPos = LEFT_MARGIN+50, yPos = 800;

  jQuery.get('text.txt', function(data) {
    const allContexts = data.split("--");
    const soil = allContexts[Math.floor(Math.random()*allContexts.length)];
    const words = RiTa.tokenize(soil);
    for (let w of words) {
      const t = new SoilWord(w, xPos, yPos, true);
      xPos += (t.boundingBox.width + Math.random() * 10+ 10);
      const rightEdge = window.innerWidth - 100 > LEFT_MARGIN + 1100 ? LEFT_MARGIN + 1100 : window.innerWidth-100;
      if (xPos > rightEdge) {
        yPos += 30;
        xPos = LEFT_MARGIN+50;
      }
    }
  })


}

function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}

function generateSequenceFromData(data) {
    var id = 0;

    function f(id){
      var p = PLANTS[data.plants[id].type];
      var plant = new p(data.plants[id]);
      adjustView(plant.y, id==0);
      plant.draw();
      plant.grow();
      plant.animate();

      lastAnimationTime = plant.totalAnimation;
      if (id <= Object.keys(data.plants).length -2) {
        id += 1;
        timeoutTracker = setTimeout(function(){
          f(id);
        }, lastAnimationTime);
      }
    }

    if(id==0) f(id);

}

function guid() {
  // https://slavik.meltser.info/the-efficient-way-to-create-guid-uuid-in-javascript-with-explanation/
    function _random_letter() {
        return String.fromCharCode(97+Math.floor(Math.random() * 26));
    }
    function _p8(s) {
        var p = (Math.random().toString(16)+"000000000").substr(2,8);
        return s ? "-" + p.substr(0,4) + "-" + p.substr(4,4) : _random_letter() + p.substr(0, 7);
    }
    return _p8() + _p8(true) + _p8(true) + _p8();
}

function plant(word, domain, p, x, y, delay=0) {
  var data = {
    "id": guid(),
    "type":p,
    "seed": word,
    "domain":domain,
    "x":x+ LEFT_MARGIN,
    "y":y,
  };

  setTimeout(function(){
    var plant = new PLANTS[p](data);
    plant.draw();
    plant.grow();
    plant.animate();
  }, delay)


}

function generateSequence(word, domain, x, y){
  var id = 0;
  var LIMIT = 5;
  var lastEndPos, lastWord;

  function f(id){
    var p = randomPlant();
    // var p = "plant";
    var data = {
      "id": id,
      "type":p,
      "seed": lastWord ? lastWord : word,
      "domain":domain,
      "x": lastEndPos ? lastEndPos.x + Math.random()*400 - 200 : width/2,
      "y": lastEndPos ? lastEndPos.y - 200 :height-20,
    }
    var plant = new PLANTS[p](data);
    plant.getResult(function() {
      adjustView(plant.y);
      plant.draw();
      plant.animate();
      lastAnimationTime = plant.totalAnimation;
      console.log(plant.endPos);
      lastEndPos = plant.endPos;
      lastWord = plant.endWord;
      console.log(plant.endWord);

      if (id < LIMIT) {
        id += 1;
        setTimeout(function(){
          f(id);
        }, lastAnimationTime);
      }
    })
  }

  if(id==0) f(id);
}

function anime(g) {
  if (ANIME) {
  setTimeout(function(){g.classed("show", true);}, 100);
  }
}

function randomPlant() {
    var keys = Object.keys(PLANTS);
    return keys[ keys.length * Math.random() << 0];
};

function getTextWidth(text, isVertical) {
  var test = isVertical ? document.getElementById("verticalTest") : document.getElementById("Test");
  test.innerHTML = text;
  return isVertical ? test.clientHeight : test.clientWidth;
}

function clearCanvas() {
   clearTimeout(timeoutTracker);
   console.log("clear canvas")
   d3.selectAll("svg g.seedling").remove();
   lastEndPos = null;
   lastWord = "";

}

function adjustView(y, now){
  y =  y - window.innerHeight + 200;
  $('html,body').animate({
         scrollTop: y +"px"
     }, now ? 500 : 3000);
}

function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

function getUrlVars()
{
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for(var i = 0; i < hashes.length; i++)
    {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
}

$(document).ready(function() {

$('#run').click(function(){
  console.log("click")
    //Some code
});

$( "form" ).on( "submit", function( event ) {
  event.preventDefault();
  var word = $( this ).serializeArray()[0].value;
  var domain= $( this ).serializeArray()[1].value;
  if (word.length > 0 && domain.length > 1){
    clearCanvas();
    generateSequence(word, domain);
  } else {
    $('.message').html("Invalid seed")
  }

  console.log("Plant:"+ word +" in "+ domain);

});

});
