/************** Parameters  *****************/
let settings = {
  //page
  pageFormat: 'singlePage',
  width: 1800,
  height: 2460,
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
  greyoutStopWordsInSoil: false,
}

// Canvas parameters
let SCALE = 1;
let X_OFFSET = 50,
  PARA_MARGIN = X_OFFSET + settings.margin.left,
  PARA_WIDTH = 820, // max width of the paragraph
  SPACE_WIDTH = 10; // the width of a space;

let isScale = true;
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
    .attr("id", "main")
    .attr("transform", "translate(" + settings.margin.left + "," + settings.margin.top + ")")
    .attr("class", "wrapper");

  const soilSVG = svg.append("g")
    .attr("id", "soil");

  // for koru
  // svg.append('g').html('<path id="Spiral" stroke-width="2" fill="none" stroke="maroon" d="M200 200 S 201 200.1 201.9 200.5 202.8 201.1 203.5 201.9 204 202.9 204.4 204.1 204.5 205.4 204.3 206.8 203.8 208.1 203.1 209.5 202.1 210.8 200.8 212 199.2 213 197.4 213.8 195.4 214.3 193.2 214.5 190.9 214.4 188.5 213.9 186.1 213 183.8 211.8 181.6 210.1 179.5 208.1 177.7 205.7 176.2 203 175 200 174.2 196.7 173.8 193.3 174 189.7 174.6 186 175.7 182.4 177.4 178.8 179.6 175.3 182.3 172.1 185.5 169.2 189.2 166.7 193.3 164.6 197.7 163.1 202.4 162.1 207.3 161.7 212.4 162 217.5 162.9 222.5 164.5 227.4 166.9 232.1 169.9 236.4 173.5 240.3 177.8 243.7 182.7 246.5 188.1 248.6 193.9 250 200 250.6 206.4 250.4 212.9 249.3 219.5 247.3 226 244.5 232.3 240.8 238.3 236.3 243.9 231.1 249 225.1 253.4 218.5 257.1 211.4 259.9 203.9 261.9 196 262.9 188 262.9 179.9 261.8 171.9 259.7 164.1 256.6 156.7 252.4 149.7 247.2 143.4 241.1 137.8 234.2 133.1 226.5 129.3 218.2 126.6 209.3 125 200 124.6 190.5 125.4 180.9 127.5 171.3 130.8 161.9 135.3 153 141 144.6 147.7 136.8 155.5 129.9 164.2 124 173.7 119.2 183.9 115.5 194.5 113.2 205.5 112.2 216.7 112.6 227.8 114.4 238.7 117.7 249.3 122.3 259.3 128.3 268.5 135.7 276.9 144.2 284.1 153.8 290.2 164.3 294.9 175.6 298.2 187.6 300 200 300.2 212.7 298.8 225.4 295.8 237.9 291.1 250.1 284.9 261.7 277.3 272.6 268.2 282.4 257.9 291.2 246.4 298.6 234 304.6 220.8 309 207 311.8 192.9 312.8 178.6 312 164.5 309.4 150.6 305 137.3 298.8 124.8 290.9 113.3 281.5 102.9 270.5 94 258.3 86.6 244.9 80.9 230.6 77 215.5 75 200 75 184.2 77 168.4 81 152.9 87 137.9 94.8 123.6 104.5 110.3 115.9 98.3 128.7 87.7 142.9 78.8 158.3 71.6 174.5 66.4 191.4 63.3 208.7 62.3 226 63.5 243.3 66.9 260 72.4 276.1 80.1 291.2 89.8 305 101.4 317.3 114.8 327.9 129.7 336.7 145.9 343.4 163.2 347.8 181.3 350 200 349.8 218.9 347.2 237.8 342.3 256.3 335 274.2 325.4 291.1 313.7 306.8 300.1 321 284.7 333.4 267.7 343.9 249.4 352.2 230.2 358.1 210.2 361.7 189.8 362.7 169.3 361.1 149 356.9 129.3 350.2 110.5 341 92.9 329.4 76.8 315.7 62.5 299.9 50.2 282.4 40.1 263.3 32.4 243 27.4 221.8 25 200 25.4 177.9 28.6 156 34.5 134.5 43.1 113.8 54.4 94.2 68.1 76.1 84 59.8 101.9 45.5 121.7 33.5 142.8 24.1 165.1 17.3 188.3 13.4 211.8 12.4 235.4 14.3 258.7 19.3 281.3 27.2 302.9 37.9 323 51.3 341.4 67.2 357.8 85.4 371.8 105.6 383.2 127.5 391.8 150.8 397.4 175.1 400 200 399.4 225.2 395.7 250.2 388.7 274.7 378.8 298.3 365.8 320.5 350.2 341 331.9 359.5 311.5 375.6 289 389.1 264.9 399.7 239.5 407.3 213.3 411.6 186.6 412.6 159.9 410.2 133.6 404.5 108 395.4 83.7 383.2 61 368 40.4 349.9 22 329.3 6.3 306.5 -6.4 281.7 -16 255.5 -22.2 228.1 -25 200 -24.2 171.7 -19.9 143.5 -12 116.1 -0.7 89.7 13.9 64.8 31.6 41.9 52.1 21.2 75.2 3.3 100.4 -11.7 127.4 -23.5 155.8 -31.8 185.1 -36.5 214.9 -37.5 244.8 -34.8 274.2 -28.3 302.6 -18.1 329.7 -4.3 354.9 12.8 377.9 33 398.2 56 415.6 81.5 429.7 109.1 440.2 138.3 447 168.8 450 200 449 231.5 444.1 262.7 435.2 293.1 422.6 322.4 406.3 349.9 386.6 375.2 363.8 398 338.2 417.8 310.3 434.4 280.3 447.3 248.9 456.4 216.5 461.5 183.5 462.5 150.5 459.3 118.1 452 86.7 440.7 56.9 425.4 29.2 406.5 3.9 384.1 -18.4 358.7 -37.5 330.6 -52.9 300.1 -64.4 267.9 -71.8 234.3 -75 200 -73.8 165.4 -68.3 131.1 -58.5 97.7 -44.5 65.6 -26.5 35.4 -4.8 7.6 20.2 -17.3 48.4 -38.9 79.1 -57 111.9 -71.1 146.4 -80.9 182 -86.4 218.1 -87.4 254.2 -83.9 289.6 -75.8 323.9 -63.3 356.5 -46.5 386.8 -25.8 414.3 -1.3 438.7 26.6 459.4 57.4 476.1 90.7 488.6 125.9 496.6 162.5 500 200 498.6 237.7 492.5 275.1 481.7 311.5 466.4 346.5 446.8 379.3 423.1 409.5 395.7 436.5 365 460.1 331.6 479.6 295.8 494.8 258.3 505.5 219.6 511.4 180.3 512.4 141.2 508.4 102.7 499.6 65.5 485.9 30.1 467.7 -2.7 445 -32.5 418.4 -58.9 388.1 -81.3 354.6 -99.4 318.5 -112.9 280.3 -121.4 240.6 -125 200 -123.4 159.1 -116.7 118.7 -105 79.3 -88.3 41.5 -67 6 -41.3 -26.6 -11.6 -55.8 21.6 -81.2 57.8 -102.2 96.5 -118.6 137 -130 178.8 -136.3 221.2 -137.3 263.5 -133 305.1 -123.4 345.2 -108.5 383.3 -88.8 418.6 -64.3 450.8 -35.5 479.1 -2.8 503.2 33.3 522.6 72.3 537.1 113.5 546.2 156.3 550 200 548.2 244 540.9 287.5 528.2 329.9 510.2 370.5 487.2 408.7 459.5 443.7 427.6 475.1 391.8 502.3 352.9 524.8 311.2 542.4 267.6 554.6 222.7 561.3 177.2 562.3 131.8 557.6 87.2 547.1 44.2 531.2 3.4 509.9 -34.6 483.5 -69 452.6 -99.3 417.5 -125.1 378.7 -145.9 336.9 -161.3 292.8 -171.1 246.9 -175 200 -173 152.9 -165.2 106.2 -151.5 60.8 -132.1 17.4 -107.4 -23.4 -77.7 -60.8 -43.5 -94.3 -5.2 -123.4 36.5 -147.5 81 -166.2 127.7 -179.2 175.7 -186.2 224.4 -187.2 272.9 -182.1 320.5 -170.9 366.5 -153.8 410 -131 450.5 -102.8 487.2 -69.7 519.6 -32.2 547 9.2 569.1 53.9 585.5 101 595.9 150 600 200 597.8 250.3 589.4 300 574.7 348.4 554 394.6 527.7 438.1 496 477.9 459.4 513.6 418.6 544.5 374.1 570.1 326.7 589.9 277 603.7 225.9 611.2 174.1 612.2 122.4 606.7 71.8 594.7 22.9 576.4 -23.4 552.1 -66.4 522.1 -105.4 486.8 -139.8 446.9 -168.9 402.8 -192.4 355.3 -209.7 305.2 -220.7 253.1 -225 200 -222.6 146.6 -213.6 93.8 -197.9 42.4 -175.9 -6.7 -147.9 -52.7 -114.2 -95 -75.4 -132.9 -32 -165.6 15.2 -192.7 65.6 -213.7 118.3 -228.3 172.6 -236.1 227.5 -237.1 282.3 -231.2 336 -218.5 387.8 -199 436.8 -173.2 482.4 -141.3 523.7 -103.9 560 -61.6 590.8 -14.9 615.6 35.4 633.9 88.6 645.5 143.7 650 200 647.4 256.5 637.8 312.4 621.2 366.8 597.8 418.7 568.1 467.4 532.4 512.2 491.3 552.1 445.4 586.7 395.4 615.3 342.1 637.5 286.4 652.8 229 661.1 170.9 662.1 113.1 655.8 56.3 642.2 1.6 621.6 -50.2 594.3 -98.3 560.6 -141.9 521.1 -180.2 476.3 -212.7 426.9 -238.9 373.8 -258.1 317.6 -270.3 259.4 -275 200 -272.2 140.3 -262 81.4 -244.4 24 -219.8 -30.8 -188.3 -82.1 -150.6 -129.3 -107.2 -171.4 -58.8 -207.8 -6.1 -237.9 50.1 -261.3 108.9 -277.4 169.4 -286 230.6 -287 291.6 -280.3 351.4 -266 409.1 -244.3 463.6 -215.4 514.3 -179.9 560.1 -138.2 600.5 -91 634.6 -38.9 662.1 17 682.4 76.2 695.1 137.5 695.1 137.5"></path>');

  scale();

  // update test and verticaltest font size
  $("#Test, #verticalTest").css("font-size", settings.plantFontSize + "px");
}

const updateBodyHeight = function() {
  const newBodyHeight = $(".menu").height() + $(".content").height() + 100;
  //console.log("newbodyheight", newBodyHeight,$(".menu").height(), $(".content").height());
  $("body").height(newBodyHeight);
}

const scale = function() {
  const w = settings.width,
    h = settings.height;
  if (isScale) {
    const scaleRatio = window.innerWidth / w > window.innerHeight / h ? (window.innerHeight - 80) / h : window.innerWidth / w;
    SCALE = scaleRatio;
    $(".content").css("transform", "scale(" + SCALE + ")");
  } else {
    $(".content").css("transform", "scale(1)");
  }
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

const plant = function(word, domain, p, x, y, max, delay = 0) {

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

  if (max) data.max = max;
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

const updatePlantSizeById = function(id) {
  const size = $('#plantFontSize_context').val();
  plants[id].updateFontSize(size);
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

  SPACE_WIDTH = settings.soilFontSize / 12 * 10;
  // if soil is empty string, return;
  if (soil == "") return;
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
      t.draw();
      xPos += (t.boundingBox.width + SPACE_WIDTH);

      if (xPos > settings.width && xPos > rightMostXPos) rightMostXPos = xPos;
      if (xPos > settings.width - settings.margin.right &&
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
