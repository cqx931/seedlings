$(document).ready(function() {

  class Plant {
    constructor(data) {
      this.id = data.id;
      // text
      this.type = data.type;
      this.word = data.seed;
      this.domain = data.domain;
      this.endWord;
      this.result = data.results ? data.results : [];
      // visualization
      this.x = data.x;
      this.y = data.y;
      this.endPos;
      this.g;
      this.totalAnimation = ANIME ? (data.results ? this.calculateTime() : 0) : 0;
    }

    getResult(callback) {
      var params = {
        'word': this.word,
        'domain': this.domain,
        'type': this.type
      }

      var t = this;
      $('.message').html("...");

      datamuse(params, function(data) {
        if (data == "error") {
          console.log("display error message");
          $('.message').html("Oops, please try another seed.")
        } else {
          $('.message').html("");
          var json = JSON.parse(data);
          // console.log(t, json);
          t.result = json.results;
          t.endWord = json.endWord;
          t.totalAnimation = t.calculateTime();
          callback(data);
        }

      });

    }

    calculateTime() {
      return START_DELAY + this.result.length * 500 + 1000;
    }

    basic_draw() {
      var drag = d3.drag()
        .on("drag", function(d, i) {
          if (!DRAGABLE) return;
          d.x += d3.event.dx
          d.y += d3.event.dy
          lastPlantId = this.id;
          d3.select(this).attr("transform", function(d, i) {
            return "translate(" + [d.x, d.y] + ")"
          })
        });

      var x = this.x,
        y = this.y;
      this.g = svg.append("g")
        .attr("class", this.type + " seedling")
        .attr("id", this.id)
        .data([{
          "x": x,
          "y": y
        }])
        .attr("transform", "translate(" + x + "," + y + ")")
        .call(drag)
        .on("contextmenu", function(d, i) {
          rightClickOnPlant = this.id;
          $("svg").bind("contextmenu", function(e) {
            if (rightClickOnPlant == null) {
              $("svg").unbind("contextmenu");
            }
            e.preventDefault();
            $('#options').show();
            $('#options').css('left', e.clientX + 'px');
            $('#options').css('top', e.clientY + 'px');

            $('#remove').click(function() {
              console.log(rightClickOnPlant + "");
              removePlantById(rightClickOnPlant);

              $('#options').hide();
              $("svg").unbind("contextmenu");
              rightClickOnPlant = null;
            });
          })
        });
    }

    draw() {
      this.basic_draw();

      var x = 0,
        y = 0;

      var HEIGHT = 150;

      var c = this.g.append("g")
        .attr("class", "chunk");

      drawGround(x, y, c);
      drawDomain(this.domain, x, y, c);
      // SEED
      var seed = drawSeed(this.word, x, y, c);
      // MAIN BRANCH
      c.append("line") // attach a line
        .style("stroke", "black") // colour the line
        .style("stroke-dasharray", DASH_STYLE) // stroke-linecap type
        .attr("x1", x) // x position of the first end of the line
        .attr("y1", y) // y position of the first end of the line
        .attr("x2", x) // x position of the second end of the line
        .attr("y2", y - HEIGHT) // y position of the second end of the line
        .attr("class", "main_branch");

      for (var i = 0; i < this.result.length; i++) {
        var b = this.g.append("g")
          .attr("class", "branch");
        var w = this.result[i],
          flag = "middle";

        if (w.charAt(0) == "|" || w.charAt(0) == "/") {
          w = w.replace(/./g, ' ') + w;
          b.style("transition-delay", START_DELAY + i * 500 + "ms");
        } else if (w.charAt(w.length - 1) == "\\") {
          w = w + w.replace(/./g, ' ');
          b.style("transition-delay", START_DELAY + i * 500 + "ms");
        } else if (w.indexOf("|") > 0) {
          b.style("transition-delay", START_DELAY + (i - 0.5) * 500 + "ms");
          var ws = w.split("|");

          if (i > 1) {
            var last = this.result[i - 1];

            if (last.indexOf(ws[1]) >= 0 && last.indexOf("\\") > 0) flag = "end"
            else if (last.indexOf(ws[0]) >= 0 && last.indexOf("/") > 0) flag = "start"
            // console.log(w, flag, last, ws[1],last.indexOf(ws[1]), last.indexOf("\\"));
          }
          var mode = ws[1].length > ws[0].length;
          var longer = mode ? ws[1] : ws[0];
          var shorter = mode ? ws[0] : ws[1];
          var space = longer.slice(0, longer.length - shorter.length + 1).replace(/./g, ' ');
          // console.log(ws, mode, space.length);
          if (flag != "middle") {
            w = w + " ";
          } else {
            w = mode ? space + ws[0] + "|" + ws[1] : ws[0] + "|" + ws[1] + space;
          }
        }

        // w = w.replace(/[\|\/\\]/g, ' ');

        b.append("text")
          .attr("x", x - FONT_SIZE * 1 / 4)
          .attr("y", y - FONT_SIZE * 1.5 * i - HEIGHT - FONT_SIZE)
          .attr("dy", ".35em")
          .attr("text-anchor", flag)
          .text(w)
          .attr("class", "branch_text")

        if (flag == "end") x = x - w.length * 4
        else if (flag == "start") x = x + w.length * 4

        if (i == this.result.length - 1) this.endPos = {
          "x": x,
          "y": y - FONT_SIZE * 1.5 * i - HEIGHT - FONT_SIZE
        }
      } // End of Branch Loop

    }

    animate() {
      if (ANIME) {
        var g = this.g;
        setTimeout(function() {
          g.classed("show", true);
        }, 100);
      } else {
        console.log("show")
        this.g.classed("show", true);
      }

    }
    //
    // reGenerate(){
    //   this.getResult(function(){
    //     this.draw();
    //     this.anime();
    //   });
    //
    // }
  }

  class Ginkgo extends Plant {
    constructor(data) {
      super(data);
    }

    calculateTime() {
      return START_DELAY + this.result.length * 500 + 1000;
    }

    draw() {
      this.basic_draw();

      var x = 0,
        y = 0;
      var WIDTH = 400,
        START_ANGLE = -160 + Math.floor(Math.random() * 60),
        HEIGHT = WIDTH / 2 - Math.floor(Math.random() * 60),
        LENGTH = WIDTH / 2;

      var c = this.g.append("g")
        .attr("class", "chunk");

      drawGround(x, y, c)
      // SEED
      var seed = drawSeed(this.word, x, y, c)
      // console.log(seed)
      // MAIN BRANCH
      c.append("line") // attach a line
        .style("stroke", "black") // colour the line
        .style("stroke-dasharray", DASH_STYLE) // stroke-linecap type
        .attr("x1", x) // x position of the first end of the line
        .attr("y1", y) // y position of the first end of the line
        .attr("x2", x) // x position of the second end of the line
        .attr("y2", y - HEIGHT) // y position of the second end of the line
        .attr("class", "main_branch");

      drawDomain(this.domain, x, y, c)

      // BRANCHES
      y = y - HEIGHT; //move to center

      for (var i = 0; i < this.result.length; i++) {

        var b = this.g.append("g")
          .style("transition-delay", START_DELAY + i * 500 + "ms")
          .attr("class", "branch");
        var w = this.result[i];
        var angle = 15 * i + START_ANGLE;
        // console.log(angle)

        // find the end point
        var endy = LENGTH * Math.sin(Math.radians(angle)) + y
        var endx = LENGTH * Math.cos(Math.radians(angle)) + x

        b.append("line") // attach a line
          .style("stroke", "black")
          .style("position", "absolute") // colour the line
          .style("stroke-dasharray", DASH_STYLE) // stroke-linecap type
          .attr("x1", x) // x position of the first end of the line
          .attr("y1", y) // y position of the first end of the line
          .attr("x2", endx) // x position of the second end of the line
          .attr("y2", endy) // y position of the second end of the line
          .attr("class", "branch_line");

        b.append("text")
          .attr("x", x)
          .attr("y", y)
          .style("transform", "translate(5px) rotate(" + (angle) + "deg) ")
          .style("transform-origin", x + "px " + y + "px 0px")
          .attr("dy", ".35em")
          .text("            " + w)
          .attr("class", "branch_text");

        if (i == this.result.length - 1) this.endPos = {
          "x": x,
          "y": -400
        }
      }

    }
  }

  class Pine extends Plant {
    constructor(data) {
      super(data);
    }

    calculateTime() {
      return this.totalAnimation = START_DELAY + this.result.length * 1500 + 1000;
    }

    draw() {
      this.basic_draw();

      var x = 0,
        y = 0;

      var WIDTH = 400,
        HEIGHT = 100;

      var c = this.g.append("g")
        .attr("class", "chunk");

      drawGround(x, y, c);

      // SEED
      var seed = c.append("text")
        .attr("x", x + FONT_SIZE / 2)
        .attr("y", y - HEIGHT + FONT_SIZE)
        .style("writing-mode", "tb")
        .attr("dy", ".35em")
        .text(this.word)
        .attr("class", "seed");

      // MAIN BRANCH
      c.append("line") // attach a line
        .style("stroke", "black") // colour the line
        .style("stroke-dasharray", DASH_STYLE) // stroke-linecap type
        .attr("x1", x) // x position of the first end of the line
        .attr("y1", y) // y position of the first end of the line
        .attr("x2", x) // x position of the second end of the line
        .attr("y2", y - HEIGHT) // y position of the second end of the line
        .attr("class", "main_branch");

      // DOMAIN
      c.append("text")
        .attr("x", x + FONT_SIZE / 2)
        .attr("y", y + FONT_SIZE / 2)
        .attr("dy", ".35em")
        .text(this.domain)
        .attr("class", "domain");

      this.result.reverse();
      for (var i = 0; i < this.result.length; i++) {
        var b = this.g.append("g")
          .style("transition-delay", START_DELAY + i * 1500 + "ms")
          .attr("class", "branch");
        var w = this.result[i];

        b.append("text")
          .attr("x", x)
          .attr("y", y - FONT_SIZE * 1.5 * i - HEIGHT)
          .attr("dy", ".35em")
          .attr("text-anchor", "middle")
          .text(w)
          .attr("class", "branch_text");

        if (i == this.result.length - 1) this.endPos = {
          "x": x,
          "y": y
        }
      }

    }
  }

  class Ivy extends Plant {
    constructor(data) {
      super(data);
    }

    calculateTime() {
      return START_DELAY + this.result.length * 1000 + 1000;
    }

    draw() {
      this.basic_draw();

      var x = 0,
        y = 0;

      var c = this.g.append("g")
        .attr("class", "chunk");

      c.append("line")
        .style("stroke", "black") // colour the line
        .style("stroke-dasharray", DASH_STYLE) // stroke-linecap type
        .attr("x1", x) // x position of the first end of the line
        .attr("y1", y) // y position of the first end of the line
        .attr("x2", x + GROUND_WIDTH) // x position of the second end of the line
        .attr("y2", y) // y position of the second end of the line
        .attr("class", "ground");

      drawDomain(this.domain, x + 100, y, c);

      function drawIvyStart(x1, y1, x2, y2, ) {
        c.append("line") // attach a line
          .style("stroke", "black") // colour the line
          .style("stroke-dasharray", DASH_STYLE) // stroke-linecap type
          .attr("x1", x1) // x position of the first end of the line
          .attr("y1", y1) // y position of the first end of the line
          .attr("x2", x2) // x position of the second end of the line
          .attr("y2", y2) // y position of the second end of the line
          .attr("class", "main_branch");

      } // MAIN BRANCH

      var xpointer = x;

      for (var i = 0; i < this.result.length; i++) {
        var b = this.g.append("g")
          .style("transition-delay", START_DELAY + i * 1000 + "ms")
          .attr("class", "branch");
        var w = this.result[i];
        var v = i % 2 == 0 ? -1 : 1;
        var xpointer = xpointer + FONT_SIZE * w.length * 2 / 3;
        var ypos = y + (FONT_SIZE * v + Math.random() * 15) - FONT_SIZE * 3;

        if (i == 0) {
          drawIvyStart(x + 50, y + 20, xpointer, ypos);
        }

        b.append("text")
          .attr("x", xpointer)
          .attr("y", ypos)
          .attr("dy", ".35em")
          .attr("text-anchor", "middle")
          .text(w)
          .attr("class", "branch_text");

        if (i == this.result.length - 1) this.endPos = {
          "x": xpointer,
          "y": ypos
        }
      }

    }
  }

  class Dandelion extends Plant {
    constructor(data) {
      super(data);
    }
    calculateTime() {
      return START_DELAY + this.result.length * 200 + 1000;
    }
    draw() {
      this.basic_draw();

      var x = 0,
        y = 0;
      var WIDTH = 400,
        LENGTH = WIDTH / 3;

      var c = this.g.append("g")
        .attr("class", "chunk");
      drawGround(x, y, c);

      var seed = drawSeed(this.word, x, y, c);


      // MAIN BRANCH
      c.append("line") // attach a line
        .style("stroke", "black") // colour the line
        .style("stroke-dasharray", DASH_STYLE) // stroke-linecap type
        .attr("x1", x) // x position of the first end of the line
        .attr("y1", y) // y position of the first end of the line
        .attr("x2", x) // x position of the second end of the line
        .attr("y2", y - LENGTH) // y position of the second end of the line
        .attr("class", "main_branch");
      drawDomain(this.domain, x, y, c);

      y = y - 200;
      for (var i = 0; i < 20; i++) {
        var b = this.g.append("g")
          .style("transition-delay", START_DELAY + i * 200 + "ms")
          .attr("class", "branch");

        var w = this.result[i];
        var angle = 18 * i + Math.random() + 100;

        // if (angle > 240) {
        //   angle = -angle;
        // }
        // console.log(w, angle, angle/2);
        // console.log(angle)
        var l = i % 2 == 0 ? LENGTH - 20 : LENGTH;

        // find the end point
        var endy = l * Math.sin(Math.radians(angle)) + y
        var endx = l * Math.cos(Math.radians(angle)) + x

        b.append("line") // attach a line
          .style("stroke", "black")
          .style("position", "absolute") // colour the line
          .style("stroke-dasharray", DASH_STYLE) // stroke-linecap type
          .attr("x1", x) // x position of the first end of the line
          .attr("y1", y) // y position of the first end of the line
          .attr("x2", endx) // x position of the second end of the line
          .attr("y2", endy) // y position of the second end of the line
          .attr("class", "branch_line");


        var textAngle = angle / 2;
        // var textAngle = angle/2 > 90 ? angle/2 + 90: angle/2;
        // console.log(textAngle)

        b.append("text")
          .attr("x", endx - 20)
          .attr("y", endy - 20)
          .style("transform", "translate(5px) rotate(" + textAngle + "deg) ")
          .style("transform-origin", x + "px " + y + "px 0px")
          .attr("dy", ".35em")
          .text(w)
          // .attr("")
          .attr("class", "branch_text");

        if (i == this.result.length - 1) this.endPos = {
          "x": endx,
          "y": endy
        }
      }

      //drawText

    }
  }

  var PLANTS = {
    "ginkgo": Ginkgo,
    "plant": Plant,
    // "koru":koru,
    "ivy": Ivy,
    // "bamboo":bamboo,
    "pine": Pine,
    "dandelion": Dandelion
  }

  // *****************************//
  Math.radians = function(degrees) {
    return degrees * Math.PI / 180;
  };

  // Variables

  var FONT_SIZE = 14,
    DASH_STYLE = FONT_SIZE / 2 + ", " + FONT_SIZE / 2,
    SECTION_GAP = 150, // between two plants
    GROUND_WIDTH = 400,
    START_DELAY = 500, // chunk - branch
    ANIME = true;
  DRAGABLE = true;
  DBUG = true;

  // ************** Generate the diagram  *****************

  var margin = {
      top: 20,
      right: 50,
      bottom: 20,
      left: 50
    },
    width = window.innerWidth,
    height = 3000;
  var rightClickOnPlant = null;
  var timeoutTracker = null;
  var plantsOnCanvas = {},
    lastPlantId = null;

  // var diagonal = d3.svg.diagonal()
  //  .projection(function(d) { return [d.y, d.x]; });

  var svg = d3.select(".content").append("svg")
    .attr("width", window.innerWidth)
    .attr("height", height)
    .append("g")
    .attr("class", "wrapper");

  /**********************************/

  function generateSequenceFromData(data) {
    var id = 0;

    function f(id) {
      var p = PLANTS[data.plants[id].type];
      var plant = new p(data.plants[id]);
      ANIME && adjustView(plant.y, id == 0);
      plant.draw();
      plant.animate();

      lastAnimationTime = plant.totalAnimation;
      if (id <= Object.keys(data.plants).length - 2) {
        id += 1;
        timeoutTracker = setTimeout(function() {
          f(id);
        }, lastAnimationTime);
      }
    }

    if (id == 0) f(id);

  }

  function generateSequence(word, domain, x, y) {
    var id = 0;
    var LIMIT = 5;
    var plants = []
    var lastEndPos, lastWord;

    function f(id) {
      var p = randomPlant();
      // var p = "plant";
      var data = {
        "id": id,
        "type": p,
        "seed": lastWord ? lastWord : word,
        "domain": domain,
        "x": lastEndPos ? lastEndPos.x + Math.random() * 400 - 200 : width / 2,
        "y": lastEndPos ? lastEndPos.y - 200 : height - 20,
      }
      var plant = new PLANTS[p](data);
      plants.push(plant);

      plant.getResult(function() {
        console.log(plant);
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

  function removePlantById(id) {
    $('#' + rightClickOnPlant).remove();
    delete plantsOnCanvas[id];
    console.log("Total Plants:", Object.keys(plantsOnCanvas).length);
  }

  function generatePlant(word, domain, type, x, y) {
    if (type == "random") type = randomPlant();
    var id = Date.now();
    var data = {
      "id": id,
      "type": type,
      "seed": word,
      "domain": domain,
      "x": x,
      "y": y
    };

    var plant = new PLANTS[type](data);

    plant.getResult(function() {
      console.log(plant);

      plantsOnCanvas[id] = plant;
      lastPlantId = id;
      console.log("Total plant number:", Object.keys(plantsOnCanvas).length);

      adjustView(plant.y);
      plant.draw();
      plant.animate();
    })
  }

  function anime(g) {
    if (ANIME) {
      setTimeout(function() {
        g.classed("show", true);
      }, 100);
    } else {
      g.classed("show", true);
    }
  }

  function drawSeed(seed, x, y, g) {
    var h = seed.length * 15;
    return g.append("text")
      .attr("x", x + FONT_SIZE / 2)
      .attr("y", y - h + FONT_SIZE)
      .style("writing-mode", "tb")
      .attr("dy", ".35em")
      .text(seed)
      .attr("class", "seed");
  }

  function drawDomain(domain, x, y, g) {
    g.append("text")
      .attr("x", x + FONT_SIZE / 2)
      .attr("y", y + FONT_SIZE / 2)
      .attr("dy", ".35em")
      .text(domain)
      .attr("class", "domain");
  }

  function drawGround(x, y, g) {
    g.append("line") // attach a line
      .style("stroke", "black") // colour the line
      .style("stroke-dasharray", DASH_STYLE) // stroke-linecap type
      .attr("x1", x - GROUND_WIDTH / 2) // x position of the first end of the line
      .attr("y1", y) // y position of the first end of the line
      .attr("x2", x + GROUND_WIDTH / 2) // x position of the second end of the line
      .attr("y2", y) // y position of the second end of the line
      .attr("class", "ground");
  }

  function randomPlant() {
    var keys = Object.keys(PLANTS);
    return keys[keys.length * Math.random() << 0];
  }

  function clearCanvas() {
    timeoutTracker && clearTimeout(timeoutTracker);
    console.log("clear canvas")
    d3.selectAll("svg g.seedling").remove();

    timeoutTracker = null;
    lastEndPos = null;
    lastPlantId = null;
    plantsOnCanvas = {};

    lastWord = "";
  }

  function adjustView(y, now) {
    y = y - window.innerHeight + 200;
    console.log("VIEW:", y, now);
    $('html,body').animate({
      scrollTop: y + "px"
    }, now ? 500 : 3000);
  }

  function getUrlVars() {
    var vars = [],
      hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for (var i = 0; i < hashes.length; i++) {
      hash = hashes[i].split('=');
      vars.push(hash[0]);
      vars[hash[0]] = hash[1];
    }
    return vars;
  }

  function getBestPosition() {
    // check x, y in last object in plantsOnCanvas(current pos), random +-100, within range
    var x = width / 2,
      y = height - 20;
    var lastPlant = plantsOnCanvas[lastPlantId];
    if (lastPlant) {
      do {
        x = lastPlant.x + Math.floor(Math.random() * 50) * (lastPlant.x <= width / 2 ? 1 : -1);
        y = lastPlant.y + lastPlant.endPos.y + Math.floor(Math.random() * 100) * (lastPlant.y <= 100 ? 1 : -1);
      } while (x < 0 || x > width - 50 || y < 50 || y > height)
    }
    console.log(x, y);
    return {
      x: x,
      y: y
    };
  }

  function generateFormOptions(types) {
    for (var key in types) {
      var text = key.charAt(0).toUpperCase() + key.substr(1);
      $('form.command select').append('<option value="' + key + '">' + text + '</option>');
    }
    $("form.command").clone().appendTo("#form");
    $("#form form").attr("autocomplete", "off");
    $("#form form #run").attr("id", "generate");
    // duplicate the form
  }
  // *****************
  // EVENTS

  $('#clearCanvas').click(function() {
    console.log("clear");
    clearCanvas();
  });


  // $('#run').click(function(){
  //   console.log("click")
  //     //Some code
  // });

  // $( "svg" ).dblclick(function(event) {
  //     $('#form').show();
  //     $('#form').css('top', event.clientY + 'px');
  //     $('#form').css('left', event.clientX + 'px');
  // });

  $('body').click(function() {
    $('#options').hide();
    $('#form').hide();
    $("svg").unbind("contextmenu");
  });
  // exception
  $('#form').on('click', function(e) {
    e.stopPropagation();
  });

  $('#form #generate').on('click', function(e) {
    $('#form').hide();
  });

  $("form").on("submit", function(event) {
    event.preventDefault();
    var word = $(this).serializeArray()[0].value;
    var domain = $(this).serializeArray()[1].value;
    // var type = $(this).serializeArray()[2].value;
    var type = $(this).find('select option:selected').attr('value');

    if (word.length > 0 && domain.length > 1) {

      pos = getBestPosition();
      generatePlant(word, domain, type, pos.x, pos.y);
      console.log("Plant:" + word + " in " + domain);
    } else {
      console.log("Invalid Input");
      $('.message').html("Invalid seed")
    }
  });

  // Initiate the page
  generateFormOptions(PLANTS);

});
