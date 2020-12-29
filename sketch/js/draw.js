/************** Parameters  *****************/

// The margin of the svg canvas
let margin = {top: 20, right: 50, bottom: 20, left: 50},
    timeOutTracker = null;
// Canvas parameters
const WIDTH = window.innerWidth, HEIGHT = 1000;

let X_OFFSET = 50, Y_OFFSET = 700, // offset values for the soil
    PARA_MARGIN = X_OFFSET + margin.left,
    LINE_HEIGHT = FONT_SIZE * 2,  // line height for soil layout
    PARA_WIDTH = 820, // max width of the paragraph
    SPACE_WIDTH = 10, // the width of a space
    RIGHT_EDGE = window.innerWidth - PARA_MARGIN > PARA_MARGIN + PARA_WIDTH ?
                 PARA_MARGIN + PARA_WIDTH : window.innerWidth - PARA_MARGIN;

/************** End of Parameters  *****************/
// global data
let plants = {}; // All the plants
let soil = {}; // The soil object
let soilOder = []; // A list of soil id
/**********************************/

function initSvgCanvas(w,h,fontSize) {
  if (fontSize) {
    FONT_SIZE = fontSize;
    DASH_STYLE = FONT_SIZE/2 + ", " + FONT_SIZE/2;
    LINE_HEIGHT = FONT_SIZE * 2;
    PARA_WIDTH = 1510; // max width of the paragraph
    SPACE_WIDTH = FONT_SIZE * 0.57;
    PARA_MARGIN = X_OFFSET + margin.left,
    RIGHT_EDGE = PARA_MARGIN + PARA_WIDTH;
    // update fontsize for test & vertical test
    $("#Test, #verticalTest").css("font-size", fontSize+"px");
  }

  const svg = d3.select(".content").append("svg")
  .attr("width", w)
  .attr("height", h)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + 0 + ")")
  .attr("class","wrapper")
  .attr("font-size", fontSize+"px");

  const soilSVG = svg.append("g")
                     .attr("id","soil");


}
function checkIntersections(r){
  const rootId = r.id,
        x = r.currentPos.x, y = r.currentPos.y,
        x1 = r.nextPos.x, y1 = r.nextPos.y;
  // RootID - "_root" = plantID
  const plantId = rootId.split("_")[0];
  for (var i = 0; i < soilOder.length; i++) {
    const s = soil[soilOder[i]];
    let b = s.boundingBox;
    const collid = lineRect(x,y,x1,y1, b.x,b.y,b.width,b.height);
    // only true if the plant if it is a new domain
    if (!r.plant.collision && collid) {
      r.plant.collision = true;
      console.log("collid", r.plant.collision)
      const newW = RiTa.stem(s.text);
      const pos = RiTa.pos(newW)[0];
      if (newW.indexOf("’") > 0) return;
      if (r.plant.lookFor && pos.indexOf(r.plant.lookFor) < 0) {
        console.log("The word is not what the plant looks for.", newW, pos);
        return;
      }
      const plant = plants["" + plantId];

      if (plant == undefined) {
        // TODO: fix
        // console.log("plant undefined")
        return;
      }
      if (plant.domainHistory.indexOf(newW) > -1) {
        //console.log("Duplicate domain, skip");
        r.plant.collision = false;
        return;
      }
      plant && plant.updateDomain(newW, RiTa.LANCASTER);
      // clear root
      clearInterval(r.timer);
      r.plant.next = r.plant.endWord;
      //console.log("regenerate");
      setTimeout(r.plant.reGenerate(), 2000);
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
  const left =   lineLine(x1,y1,x2,y2, rx,ry,rx, ry+rh),
        right =  lineLine(x1,y1,x2,y2, rx+rw,ry, rx+rw,ry+rh),
        top =    lineLine(x1,y1,x2,y2, rx,ry, rx+rw,ry),
        bottom = lineLine(x1,y1,x2,y2, rx,ry+rh, rx+rw,ry+rh);

  // if ANY of the above are true, the line
  // has hit the rectangle
  if (left || right || top || bottom) {
    return true;
  }
  return false;
}

function initializeSoil(page, callback) {
  const initialY = Y_OFFSET, initialX = margin.left + X_OFFSET;
  let xPos = initialX, yPos = initialY;
  let rightMostXPos = xPos;

  jQuery.get('text.txt', function(data) {
    const allContexts = data.split("________________");
    const textIdx = page!= undefined ? (page-1) : getRandomInt(allContexts.length);
    console.log("Text Index:", textIdx);
    let soil = allContexts[textIdx];
    const lines = soil.split("\n").length;
    soil = soil.replaceAll("\n", " _lineBreak_ ");
    soil = soil.replaceAll(/\s{2,}/g, function(match){
      match = match.replaceAll(" ", "+")
      return " "+match+" ";
    });
    const words = RiTa.tokenize(soil);
    for (let i = 0; i < words.length; i++) {
      const w = words[i],
            nextW = (i!=words.length-1) ? words[i+1] : "";

      function lineBreak() {
        yPos += LINE_HEIGHT;
        xPos = initialX;
      }
      if ( w == "_lineBreak_")  {
        lineBreak();
      } else if( w.indexOf('+') > -1) {
        xPos += w.length * SPACE_WIDTH;
      } else {
        if (punctuations.includes(w)) xPos -= SPACE_WIDTH;
        const t = new SoilWord(w, xPos, yPos, true);
        // console.log(t.text, t.boundingBox.width);
        xPos += (t.boundingBox.width + SPACE_WIDTH);
        if (xPos > WIDTH && xPos > rightMostXPos) rightMostXPos = xPos;

        if (textIdx != 4 && xPos > RIGHT_EDGE
          && !punctuations.includes(nextW) && nextW != "+") lineBreak();
      }
    }
    // update HEIGHT
    if(!page) {
      updateD3CanvasHeight(yPos+ PARA_MARGIN);
      if (rightMostXPos > WIDTH) {
        updateD3CanvasWidth(rightMostXPos + PARA_MARGIN + margin.right);
      }
    }
    callback();
  })


}

function updateD3CanvasHeight(newH) {
  if (newH < HEIGHT || pngMode) return;
  d3.select("svg").attr("height", newH);
}

function updateD3CanvasWidth(newW) {
  d3.select("svg").attr("width", newW);
}


function guid() {
  // Reference: https://slavik.meltser.info/the-efficient-way-to-create-guid-uuid-in-javascript-with-explanation/
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
  console.log("Plant", word, "in", domain, "as", p);
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
      "x": lastEndPos ? lastEndPos.x + Math.random()*400 - 200 : WIDTH/2,
      "y": lastEndPos ? lastEndPos.y - 200 :HEIGHT-20,
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

/******* Randomness *******/
function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min); //The maximum is inclusive and the minimum is inclusive
}

function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}


function getRandomItem(obj) {
    const keys = Object.keys(obj);
    return obj[keys[ keys.length * Math.random() << 0]];
};

function randomPlant() {
    const keys = Object.keys(PLANTS);
    return keys[ keys.length * Math.random() << 0];
};

/******* Randomness *******/

function getTextWidth(text, isVertical) {
  let test = isVertical ? document.getElementById("verticalTest") : document.getElementById("Test");
  test.innerHTML = text;
  return isVertical ? test.clientHeight : test.clientWidth;
}

function clearCanvas() {
   clearTimeout(timeoutTracker);
   d3.selectAll("svg g.seedling").remove();
   lastEndPos = null;
   lastWord = "";

}

function adjustView(y, time){
  y =  y - window.innerHeight + 200;
  $('html,body').animate({
         scrollTop: y +"px"
     }, time != undefined ? time : 3000);
}

function removePlantById(id) {
  $('#' + id).remove();
  delete plants[id];
  console.log("Total Plants:", Object.keys(plants).length);
}

function shuffle(array) {
  let currentIndex = array.length, temporaryValue, randomIndex;
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

$( document ).ready(function() {
  $(".content").click(function(){
    $('.contextMenu').hide();
    $('body').removeClass("rightClicked");
  })

  $("#closeButton").click(function(){
    $('#about').hide();
  })
  $("#aboutButton").click(function(){
    $('#about').toggle();
  })
});
