/************** Parameters  *****************/
let settings = {
  //page
  pageFormat: 'singlePage',
  width: 1800,
  height: 2400,
  margin: {
    top: 20,
    right: 50,
    bottom: 20,
    left: 50
  },
  //plants
  plantFontSize: 28,
  animation: false,
  disableWhiteTextBg: true,
  roots: true,
  noRegrow: true,
  //soil
  soilFontSize: 28,
  SoilOffsetX: 100,
  SoilOffsetY: 700,
  greyoutStopWordsInSoil: true,
}

// Canvas parameters
let SCALE = 1;
let X_OFFSET = 50,
  PARA_MARGIN = X_OFFSET + settings.margin.left,
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

const initSvgCanvas = function(w, h) {

  const svg = d3.select(".content").append("svg")
    .attr("width", w)
    .attr("height", h)
    .attr("transform", "translate(" + settings.margin.left + "," + settings.margin.top + ")")
    .attr("class", "wrapper");

  const soilSVG = svg.append("g")
    .attr("id", "soil");

  const scale = window.innerWidth / w > window.innerHeight / h ? (window.innerHeight - 80) / h : window.innerWidth / w;
  SCALE = scale;
  $(".content").css("transform", "scale(" + scale + ")");

  // update test and verticaltest font size
  $("#Test, #verticalTest").css("font-size", settings.plantFontSize + "px");
}

const updateBodyHeight = function() {
  const newBodyHeight = $(".menu").height() + $(".content").height() + 100;
  console.log("newbodyheight", newBodyHeight,$(".menu").height(), $(".content").height());
  $("body").height(newBodyHeight);
}

const checkIntersections = function(r) {
  const rootId = r.id,
    x = r.currentPos.x,
    y = r.currentPos.y,
    x1 = r.nextPos.x,
    y1 = r.nextPos.y;
  // RootID - "_root" = plantID
  const plantId = rootId.split("_")[0];
  for (let i = 0; i < soilOder.length; i++) {
    const s = soil[soilOder[i]];
    let b = s.boundingBox;
    const collid = lineRect(x, y, x1, y1, b.x, b.y, b.width, b.height);
    // only true if the plant if it is a new domain
    if (!r.plant.collision && collid) {
      r.plant.collision = true;
      //console.log("collid", r.plant.collision)
      const newW = singularize(s.text).toLowerCase();
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
      if (plant.domainHistory.indexOf(newW) > -1 || newW == plant.word) {
        //console.log("Duplicate domain or domain is same as seed, skip");
        r.plant.collision = false;
        return;
      }
      plant && plant.updateDomain(newW, RiTa.LANCASTER);
      // clear root
      clearInterval(r.timer);
      // keep the same seed if it is on localServer
      r.plant.next = destination == "localStorage" ? r.plant.word : r.plant.endWord;
      //console.log("regenerate");
      setTimeout(r.plant.reGenerate(), 2000);
    }
  }
  return false;
}

const lineRect = function(x1, y1, x2, y2, rx, ry, rw, rh) {
  // Modified from: http://www.jeffreythompson.org/collision-detection/line-rect.php

  function lineLine(x1, y1, x2, y2, x3, y3, x4, y4) {
    // calculate the direction of the lines
    const uA = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1));
    const uB = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1));

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
  const left = lineLine(x1, y1, x2, y2, rx, ry, rx, ry + rh),
    right = lineLine(x1, y1, x2, y2, rx + rw, ry, rx + rw, ry + rh),
    top = lineLine(x1, y1, x2, y2, rx, ry, rx + rw, ry),
    bottom = lineLine(x1, y1, x2, y2, rx, ry + rh, rx + rw, ry + rh);

  // if ANY of the above are true, the line
  // has hit the rectangle
  if (left || right || top || bottom) {
    return true;
  }
  return false;
}

const updateD3CanvasHeight = function(newH) {
  if (newH < HEIGHT || pngMode) return;
  d3.select("svg").attr("height", newH);
}

const updateD3CanvasWidth = function(newW) {
  d3.select("svg").attr("width", newW);
}

const updatePlantFontSize = function(fontSize) {
  settings.plantFontSize = fontSize;
  FONT_SIZE = fontSize;
  DASH_STYLE = fontSize / 2 + ", " + fontSize / 2;
  // update fontsize for test & vertical test
  $("#Test, #verticalTest").css("font-size", fontSize + "px");
}

const guid = function() {
  // Reference: https://slavik.meltser.info/the-efficient-way-to-create-guid-uuid-in-javascript-with-explanation/
  function _random_letter() {
    return String.fromCharCode(97 + Math.floor(Math.random() * 26));
  }

  function _p8(s) {
    const p = (Math.random().toString(16) + "000000000").substr(2, 8);
    return s ? "-" + p.substr(0, 4) + "-" + p.substr(4, 4) : _random_letter() + p.substr(0, 7);
  }
  return _p8() + _p8(true) + _p8(true) + _p8();
}

const plant = function(word, domain, p, x, y, delay = 0) {

  // singularize & lowercase
  word = singularize(word).toLowerCase();
  domain = singularize(domain).toLowerCase();

  const data = {
    "id": guid(),
    "type": p,
    "word": word,
    "domain": domain,
    "x": x + LEFT_MARGIN,
    "y": y,
  };

  setTimeout(function() {
    const plant = new PLANTS[p](data);
    plant.draw();
    plant.grow();
    plant.animate();
  }, delay)

  console.log("Plant", word, "in", domain, "as", p, Object.keys(plants).length);
}

const generateSequence = function(word, domain, x, y) {
  const id = 0;
  const LIMIT = 5;
  let lastEndPos, lastWord;

  function f(id) {
    const p = randomPlant();
    // var p = "plant";
    const data = {
      "id": id,
      "type": p,
      "word": lastWord ? lastWord : word,
      "domain": domain,
      "x": lastEndPos ? lastEndPos.x + Math.random() * 400 - 200 : WIDTH / 2,
      "y": lastEndPos ? lastEndPos.y - 200 : HEIGHT - 20,
    }
    const plant = new PLANTS[p](data);
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
        setTimeout(function() {
          f(id);
        }, lastAnimationTime);
      }
    })
  }

  if (id == 0) f(id);
}

const anime = function(g) {
  if (ANIME) {
    setTimeout(function() {
      g.classed("show", true);
    }, 100);
  }
}

/******* Randomness *******/
const getRandomInt = function(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

const getRandomIntInclusive = function(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min); //The maximum is inclusive and the minimum is inclusive
}

const getRandomArbitrary = function(min, max) {
  return Math.random() * (max - min) + min;
}

const getRandomItem = function(obj) {
  const keys = Object.keys(obj);
  return obj[keys[keys.length * Math.random() << 0]];
};

const randomPlant = function(w) {
  let keys = Object.keys(PLANTS);
  if (w && w.length <= 3) {
    removeItemOnce(keys, "pine");
  }

  return keys[keys.length * Math.random() << 0];
};

/******* Randomness *******/
const removeItemOnce = function(arr, value) {
  const index = arr.indexOf(value);
  if (index > -1) {
    arr.splice(index, 1);
  }
  return arr;
}

const getTextWidth = function(text, isVertical) {
  let test = isVertical ? document.getElementById("verticalTest") : document.getElementById("Test");
  test.innerHTML = text;
  return isVertical ? test.clientHeight : test.clientWidth;
}

const adjustView = function(y, time) {
  y = y - window.innerHeight + 200;
  $('html,body').animate({
    scrollTop: y + "px"
  }, time != undefined ? time : 3000);
}

const removePlantById = function(id) {
  $('#' + id).remove();
  delete plants[id];
  console.log("Total Plants:", Object.keys(plants).length);
}

const singularize = function(word) {
  // !!! text specific
  let w = RiTa.singularize(word.toLowerCase());
  // fixes
  if (w == "waf" && word == "waves") w = "wave"
  if (w == "knif" && word == "knives") w = "knife"
  if (word == "senses") w = "sense"
  // remove es
  const removeEs = ["dishes", "goes", "potatoes", "paradoxes", "ashes"];
  if (removeEs.includes(word.toLowerCase())) w = word.slice(0, -2)

  // stay the same
  const noChange = ["bottomless", "mindless", "glass", "undress", "miss", "hypothesis",
    "unconscious", "superstitious", "autonomous", "caress", "carcass", "ludicrous", "perhaps"
  ];
  if (noChange.includes(word.toLowerCase())) w = word;

  return w;
}

const shuffle = function(array) {
  let currentIndex = array.length,
    temporaryValue, randomIndex;
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

const clearCanvas = function() {
  $("#pages li").removeClass("current");
  $("#soil").empty();
  $("svg g.seedling").remove();
  plants = {}; // All the plants
  soil = {}; // The soil object
  soilOder = []; // A list of soil id
}

const initializeSoilWithRandomPlant = function(textIdx) {
  initializeSoil(textIdx, false, function() {
    const targetIdx = getRandomInt(10);
    clickSoilWordByIdx(targetIdx);
  });
}

const initializeSoil = function(text, svgId, cb) {
  const initialY = $('#' + svgId).height < settings.SoilOffsetY ? $('#' + svgId).height * 0.7 : settings.SoilOffsetY;
  const initialX = settings.margin.left + settings.SoilOffsetX;
  let xPos = initialX,
    yPos = initialY;
  let rightMostXPos = xPos;
  let soil = text;
  const lines = soil.split("\n").length;
  soil = soil.replace(/\n/g, " _lineBreak_ ");
  soil = soil.replace(/\s{2,}/g, function(match) {
    match = match.replace(/ /g, "+")
    return " " + match + " ";
  });

  const words = RiTa.tokenize(soil);
  for (let i = 0; i < words.length; i++) {
    const w = words[i],
          nextW = (i != words.length - 1) ? words[i + 1] : "";

    const lineBreak = function() {
      yPos += settings.soilFontSize * 2;
      xPos = initialX;
    }
    if (w == "_lineBreak_") {
      lineBreak();
    } else if (w.indexOf('+') > -1) {
      xPos += w.length * SPACE_WIDTH;
    } else {
      if (punctuations.includes(w)) xPos -= SPACE_WIDTH;
      const t = new SoilWord(w, xPos, yPos, true);
      // console.log(t.text, t.boundingBox.width);
      xPos += (t.boundingBox.width + SPACE_WIDTH);
      if (xPos > settings.width && xPos > rightMostXPos) rightMostXPos = xPos;

      if (xPos > RIGHT_EDGE &&
        !punctuations.includes(nextW) && nextW != "+") lineBreak();

    }
  }

  if (cb && typeof cb === "function") cb();
}

$(document).ready(function() {
  $(".content").click(function() {
    $('.contextMenu').hide();
    $('body').removeClass("rightClicked");
  })

  $("#closeButton").click(function() {
    $('#about').hide();
  })

  $("#aboutButton").click(function() {
    $('#about').toggle();
  })

  $("#pages ul li").click(function() {
    const textIdx = $(this).attr("idx");
    clearCanvas();
    initializeSoilWithRandomPlant(textIdx);
    adjustView(settings.soilOffsetY + 300, 2500);
  });

});

// $(window).on('resize', function(){
//   // if window.innerWidth changes, adjustcanvas
//  console.log("resize");
//  window.alert("current size:" + window.innerWidth + " " + window.innerHeight);
//   var win = $(this); //this = window
//   // if (win.width() >= 900 ) {
//   //   updateD3CanvasWidth(win.width());
//   // }
// });
