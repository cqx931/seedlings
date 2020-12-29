const params = new URLSearchParams(location.search);
const seed = parseInt(params.get("seed"));
let page = parseInt(params.get("page"));
let pngMode = false;
const w = page != 1 ? 2412 : 3074;
const h = page != 1 ? 3074 : 2412;

$( document ).ready(function() {
if (page) {
  pngMode = true;
  $("#aboutButton").hide();
  ANIME = false;
  initSvgCanvas(w, h, 28);
  if (page == 1){
    margin.left = 50;
    page = 5 // switch horizontal page to first page
  } else if (page == 5) {
    page = 1;
  }
  initializeSoil(page, function(){
    console.log(page)
    // plant specific plants without animation
    switch (page) {
      case 1:
        plantByList({
          0: "pine",
          19: "plant",
          37: "bamboo",
          46: "ginkgo",
        })
      break;
      case 2:
        plantByList({
          1: "ivy",
          6: "ivy",
          12: "ivy",
          20: "ivy",
          23: "ivy",
          27: "ivy",
          35: "ivy",
          41: "ivy",
          46: "ivy"
        })
        break;
        case 3:
          plantByList({
            0: "ginkgo",
            3: "dandelion",
            20: "plant",
            58: "ivy"
          })
          break;
        case 4:
        let flags = {
          1: true,
          2: true,
          3: true
        };
        for (var i = 0; i < 20; i++) {
          const idx = getRandomInt(soilOder.length);
          const id = soilOder[idx];
          const s = soil[id];
          const newX = s.x + getRandomIntInclusive(-50,50),
                newY = s.y + getRandomIntInclusive(500,1500);
          s.updatePos(newX, newY)
          if (newX > 200 && newX < 700 && flags[1])  {
            plantByIdx(idx, "plant");
            flags[1] = false;
          } else if (newX > 700 && newX < 1400 && flags[2]) {
            plantByIdx(idx, "plant");
            flags[2] = false;
          } else if (newX > 1400 && flags[3]){
            plantByIdx(idx, "plant");
            flags[3] = false;
          }
        }
        break;
        case 5:
        plantByList({
          16: "pine",
          17: "pine",
          30: "pine",
          32: "pine",
          34: "bamboo",
          35: "bamboo",
          36: "bamboo",
          43: "pine",
          46: "pine",
          49: "pine",
          50: "bamboo",
          54: "bamboo",
          56: "bamboo",
          58: "bamboo",
        })

      default:
    }
    //TODO: after plants are rendered, exportPNG
    // setTimeout(exportPNG, 9000);
  });

} else {
  initSvgCanvas(WIDTH, HEIGHT);
  initializeSoil(undefined, function(){
    const targetIdx = getRandomInt(10);
    clickSoilWordByIdx(targetIdx);
  });
  adjustView(Y_OFFSET, 1000);
}
});

function plantByList(list){
  for (const key in list) {
    plantByIdx(key, list[key]);
  }
}

function plantByIdx(idx, type){
  const target = soil[soilOder[idx]];
  console.log("Init:", target.text)
  const domain = getClosestSoilText(target);
  plant(target.text, domain, type, Math.floor(target.x)-200, Math.floor(target.y));
}

function clickSoilWordByIdx(idx){
  const target = soil[soilOder[idx]];
  console.log("Init:", target.text)
  target.dblclick();
}

function exportPNG(){
  const container = document.body; // take our full page
  html2canvas(container, { // turn it into a canvas object
    width: w,
    height: h
  }).then(function(canvas) {
    // create a link to a png version of our canvas object, then automatically start downloading it
    let a = document.createElement('a');
    a.href = canvas.toDataURL("image/png");
    a.download = seed + '_' + page + '.png';
    a.click();
  });
}

document.body.onkeyup = function(e){
    if (e.keyCode == 32){ // space bar
        exportPNG();
    }
}
