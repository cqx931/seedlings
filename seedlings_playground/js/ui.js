$(document).ready(function() {
  fnBrowserDetect();
  populateSettingsUI();
  // Initialize the canvas
  renderCanvas();
  updateBodyHeight();
});

$("#export").click(function() {
  exportJSON();
});
$("#import").click(function() {
  importJSON();
});
$('#importFilePicker').on('change', handleImportData);
$("#clearCanvas").click(function() {
  clearCanvas();
});
$("#exportSVG").click(function() {
  exportSVG();
});
$("#updateCanvas").click(function() {
  updateCanvas();
});
$("#toggleSettings").click(function() {
  $(".settingsWrapper").toggle();
});
$("#pageFormat input").click(function() {
  if (this.value == "singlePage") {
    $("#widthInput").val(1800);
    $("#heightInput").val( 2460);
  } else if (this.value == "splitPage") {
    $("#widthInput").val(3600);
    $("#heightInput").val(2460);
  }
});


$("#run").click(function() {
  const p = document.getElementById("plantType").value;
  const w = document.getElementById("seed").value;
  const c = document.getElementById("context").value;
  const a = document.getElementById("angle").value;

  const x = 100;
  const y = 1000;

  if(w!="" && c != "") {
  if(a!= "" && p == "ivy") {
    const data = {
    "id": guid(),
    "type": p,
    "word": w,
    "domain": c,
    "x": x,
    "y": y,
    "angle": a
};

const newP = new PLANTS[p](data);

setTimeout(function() {
 newP.draw();
 newP.grow();
 newP.animate();
}, 100)
  } else {
    plant(w, c, p, x, y);
    //console.log(p,w,c,a);
  }

} else console.log("empty string");

});

$("#updateSoil").click(function() {
  updateSoil();
  updateCanvas();
});

$("#toggleScale").click(function() {
  if (isScale == true) isScale = false;
  else isScale = true;
  scale();
});


// override serialize https://stackoverflow.com/questions/10147149/how-can-i-override-jquerys-serialize-to-include-unchecked-checkboxes
const originalSerializeArray = $.fn.serializeArray;
$.fn.extend({
    serializeArray: function () {
        var brokenSerialization = originalSerializeArray.apply(this);
        var checkboxValues = $(this).find('input[type=checkbox]').map(function () {
            return { 'name': this.name, 'value': this.checked };
        }).get();
        var checkboxKeys = $.map(checkboxValues, function (element) { return element.name; });
        var withoutCheckboxes = $.grep(brokenSerialization, function (element) {
            return $.inArray(element.name, checkboxKeys) == -1;
        });

        return $.merge(withoutCheckboxes, checkboxValues);
    }
});

const updateSoil =function() {
  initializeSoil($("#soilText").val(), 'main');
}

const renderCanvas = function(plants) {
  initSvgCanvas(settings.width, settings.height);
  updateSoil();

  if (plants == null) {
    // plant("language", "dream", "plant", 400, 1000);
  } else {
    // TODO: show the same plants with new settings
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

const populateSettingsUI = function() {
  for (var attr in settings) {
    const checked = settings[attr] ? 'checked ':'';
    if (typeof settings[attr] == "boolean")
      $(".checkboxes").append('<label for="' + attr + '">' + getNameFromAttr(attr) + '</label><input ' +  checked  +  'class="' + attr + '" type="checkbox" name="' + attr + '">');
  }
  $("#toggleSettings").click();
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
    plants: plant_data,
    soil: soil,
    settings: settings
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
  var svgBlob = new Blob([preface, svgData], {
    type: "image/svg+xml;charset=utf-8"
  });
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

  parseSerialDataToSettings($('#settings').serialize());
  // remove current Canvas
  $("svg").remove();
  renderCanvas();
}

const parseSerialDataToSettings = function(serial) {
  //console.log(serial);
  const pairs = serial.split("&");
  for (var i = 0; i < pairs.length; i++) {
    const items = pairs[i].split("=");
    const key = items[0];
    let value = items[1];
    // value, int, boolean, string
    if (value == "true") {
      value = true;
    } else if (value == "false") {
      value = false;
    } else if (key != "pageFormat"){
      value = parseInt(value);
    }
    updateSetting(key, value);
  }
return
}

const updateSetting = function(name, newValue) {
  // If anything is not the same as settings, update and save to settings
  if (newValue != settings[name]) {
    console.log("update", name, newValue)
    settings[name] = newValue;
  }

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

  reader.onload = function(e) {
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
    const p = new PLANTS[d.type](d);
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

  let dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

  let exportFileDefaultName = 'data.json';

  let linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
}
