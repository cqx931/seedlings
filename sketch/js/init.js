const params = new URLSearchParams(location.search);
const seed = parseInt(params.get("seed"));
const page = parseInt(params.get("page"));
let pngMode = false;
const w = page != 5 ? 2412 : 3074;
const h = page != 5 ? 3074 : 2412;

$( document ).ready(function() {
if (page) {
  pngMode = true;
  $("#aboutButton").hide();
  ANIME = false;
  initSvgCanvas(w, h, 28);
  if (page == 5) margin.left = 50;
  initializeSoil(page, function(){
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
        // loop through all soil words, relocate 15 words, y down 500-1500, xoffset random
        // random plant four plants out of these 15
        break;
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
