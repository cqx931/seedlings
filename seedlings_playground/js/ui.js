
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

  //<input type="checkbox" id="scales" name="scales" checked><label for="scales">Scales</label>
}

const exportPNG = function() {
  console.log("Prepare PNG Export")
  // Pages: export page w/h; Sketch : svg w/h
  html2canvas(document.body, { // turn it into a canvas object
    width: isNaN(page) ? $('svg').width() : w,
    height: isNaN(page) ? $('svg').height() : h
  }).then(function(canvas) {
    // create a link to a png version of our canvas object, then automatically start downloading it
    let a = document.createElement('a');
    a.href = canvas.toDataURL("image/png");
    a.download = isNaN(page) ? "seedlings_FromHumus.png" : seed + '_' + page + '.png';
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

  console.log("Handle Import Data!")

  reader.onload = function (e) {
    let adData;
    try {
      const data = JSON.parse(e.target.result);
      dataOnLoadHandler(data);

    } catch (e) {

      return;
    }

  }

  reader.readAsText(files[0]);
}

// function handleImportFilePicker() {
//
//   const file = this.files[0];
//   if (file === undefined || file.name === '') {
//     return;
//   }
//   // if ( file.type.indexOf('text') !== 0 ) {
//   //     return;
//   // }
//   const filename = file.name;
//
//   const fileReaderOnLoadHandler = function () {
//     let data;
//     try {
//       data = JSON.parse(this.result);
//       if (typeof userData !== 'object') {
//         throw 'Invalid';
//       }
//       if (typeof userData.userSettings !== 'object') {
//         //adnauseam admap
//         dataOnLoadHandler(data);
//         return;
//       }
//
//     }
//     catch (e) {
//       data= undefined;
//     }
//     if (data === undefined) {
//       window.alert("Can't parse data.");
//       return;
//     }
//   };
//
//   const fr = new FileReader();
//   fr.onload = fileReaderOnLoadHandler;
//   fr.readAsText(file);
// };

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
    const p = new Plant();
  }

  // for (const [key, plant] of Object.entries(data.plants)) {
  //   console.log(plant);
  //   plant.draw();
  // }

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

document.body.onkeyup = function(e) {
  if (e.keyCode == 32) {
    exportPNG();
  }
}
