
$(document).ready(function() {
     populateSettings();
     // Initialize the canvas
     console.log("init")
    const textarea = "demo text";
    const id = 'main';
    initSvgCanvas(settings.width, settings.height);
    initializeSoil(textarea, id);
    //word, domain, p, x, y
    plant( "language", "dream", "ivy", 400,200);
});

$( "#export" ).click(function() {exportJSON();});
$( "#import" ).click(function() {importJSON();});
$('#importFilePicker').on('change', handleImportData);
$( "#clearCanvas" ).click(function() {clearCanvas();});
$( "#exportSVG" ).click(function() {exportSVG();});
$( "#updateCanvas" ).click(function() {updateCanvas();});

$("#run").click(function() {
  const p = document.getElementById("plantType").value;
  const w = document.getElementById("seed").value;
  const c = document.getElementById("context").value;
  //const a = document.getElementById("angle").value;
  const x = 100;
  const y = 400;
  if ( w!="" && c != "") {
      plant(w, c, p, x, y);
  } else console.log("empty string");
});

document.body.onkeyup = function(e) {
  if (e.keyCode == 32) {
    //exportPNG();
    exportSVG();
  }
}

const plantByList = function(list) {
  for (const key in list) {
    plantByIdx(key, list[key]);
  }
}

const plantByIdx = function(idx, type) {
  const target = soil[soilOder[idx]];
  //console.log("Init:", target.text)
  if (target != undefined) {
    const domain = getClosestSoilText(target);
    plant(target.text, domain, type, Math.floor(target.x) - 200, Math.floor(target.y));
  } else {
    console.log("target undefined", idx);
  }

}

const clickSoilWordByIdx = function(idx) {
  const target = soil[soilOder[idx]];
  //console.log("Init:", target.text)
  target.dblclick();
}

const populateSettings = function() {
  for (var attr in settings) {
     if (typeof settings[attr] == "boolean" )
       $( ".checkboxes" ).append('<label for="' + attr + '">' + getNameFromAttr(attr) + '</label><input class="' + attr + '" type="checkbox" name="' + attr + '">');
  }
}

const getNameFromAttr = function(s) {
  s = s.replace(/([A-Z])/g, ' $1').trim();
  return s.toLowerCase();
}

const exportPNG = function() {
  console.log("Prepare PNG Export")
  // TODO: only export svg to png, not the entire page
  html2canvas(document.body, { // turn it into a canvas object
    width: $('svg').width(),
    height: $('svg').height()
  }).then(function(canvas) {
    // create a link to a png version of our canvas object, then automatically start downloading it
    let a = document.createElement('a');
    a.href = canvas.toDataURL("image/png");
    a.download = "seedlings_FromHumus.png";
    a.click();
  });
}

const exportJSON = function() {
  // get plant data from plants
  let plant_data = {};
  for (const [id, plant] of Object.entries(plants)) {
    plant_data[id] = plant.getJSON();
  }

  let data = {
    plants:plant_data,
    soil:soil,
    settings:settings
  }

  exportToJsonFile(data);
}

const importJSON = function(jsonData) {
  // select file
  startJSONFilePicker();
}

const exportSVG = function() {
  saveSvg(document.getElementsByTagName("svg")[0], "seedlings.svg")
};

const saveSvg = function(svgEl, name) {
    // https://stackoverflow.com/questions/23218174/how-do-i-save-export-an-svg-file-after-creating-an-svg-with-d3-js-ie-safari-an
    svgEl.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    var svgData = svgEl.outerHTML;
    var preface = '<?xml version="1.0" standalone="no"?>\r\n';
    var svgBlob = new Blob([preface, svgData], {type:"image/svg+xml;charset=utf-8"});
    var svgUrl = URL.createObjectURL(svgBlob);
    var downloadLink = document.createElement("a");
    downloadLink.href = svgUrl;
    downloadLink.download = name;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
}

const updateCanvas = function() {
  // Take parameters and update canvas
  // If anything is not the same as settings, update and save to settings
  var currentSettings = parseSerialDataToSettings($('#settings').serialize());
  console.log(currentSettings);
}

const parseSerialDataToSettings = function(serial) {
  const pairs = serial.split("&");
  for (var i = 0; i < pairs.length; i++) {
    pairs[i]
  }
  return
}

const startJSONFilePicker = function() {
  const input = document.getElementById('importFilePicker');
  // Reset to empty string, this will ensure an change event is properly
  // triggered if the user pick a file, even if it is the same as the last
  // one picked.
  input.value = '';
  input.click();
}

function handleImportData(evt) {

  const files = evt.target.files;

  const reader = new FileReader();

  reader.onload = function (e) {
    try {
      const data = JSON.parse(e.target.result);
      dataOnLoadHandler(data);

    } catch (e) {

      return;
    }

  }

  reader.readAsText(files[0]);
}


const dataOnLoadHandler = function(data) {
  settings = data.settings;
  clearCanvas();
  // loop through plants and soil, draw()
  for (const key in data.soil) {
    const d = data.soil[key];
    const sW = new SoilWord(d.text, d.x, d.y, d.active, d.id);
  }



  for (const key in data.plants) {
    const d = data.plants[key];
    const p =  new PLANTS[d.type](d);
    console.log(p)
    p.draw();
    p.growFromJSON(d);
    p.animate();
  }

}

const exportToJsonFile = function(jsonData) {
    let seen = [];
    let dataStr = JSON.stringify(jsonData);
    // no longer in use
    //, function(key, val) {
    //    if (val != null && typeof val == "object") {
    //         if (seen.indexOf(val) >= 0) {
    //             console.log(key, val);
    //             return;
    //         }
    //
    //         seen.push(val);
    //     }
    //     return val;
    // }

    let dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

    let exportFileDefaultName = 'data.json';

    let linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
}
