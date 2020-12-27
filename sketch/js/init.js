const params = new URLSearchParams(location.search);
const seed = parseInt(params.get("seed"));
const page = parseInt(params.get("page"));
let pngMode = false;

$( document ).ready(function() {
if (page) {
  pngMode = true;
  $("#aboutButton").hide();
  ANIME = false;
  initSvgCanvas(2412, 3074, 28);
  initializeSoil(page, function(){
    // plant specific plants without animation
    switch (page) {
      case 2:
        plant
        break;
      default:
    }

    let container = document.body; // take our full page
    html2canvas(container, { // turn it into a canvas object
      width:2412,
      height: 3074
    }).then(function(canvas) {
      // create a link to a png version of our canvas object, then automatically start downloading it
      let a = document.createElement('a');
      a.href = canvas.toDataURL("image/png");
      a.download = seed + '_' + page + '.png';
      a.click();
    });
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

function clickSoilWordByIdx(idx){
  const target = soil[soilOder[idx]];
  console.log("Init:", target.text)
  target.dblclick();
}
