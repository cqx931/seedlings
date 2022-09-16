// Switches
let FONT_SIZE = settings.plantFontSize;

const isCompost = false;
let browserName = "";
const FONT = "Source Code Pro Light, monospace";
const SCALE_FACTOR = 20,
  COMPOST_TIME = 4000,
  GROUND_WIDTH = 200,
  START_DELAY = 500, // chunk - branch
  LEFT_MARGIN = 200;

let PAGE_MODE = true;

const dragEvent = d3.drag().on("drag", function(d) {
  //console.log("soil dragged:", isScale, d.x, d.y)

  const s = soil[this.id];

  if (browserName == "firefox") {
    const offsetX = 77,
      offsetY = 54; // WHY?
    const newX = isScale ? (d.x + offsetX) / SCALE : d.x,
      newY = isScale ? (d.y + offsetY) / SCALE + 5 : d.y;
    // update the soilWord object
    if (s) s.updatePos(newX, newY);
  } else if (browserName == "chrome") {
    if (s) s.updatePos(d.x, d.y);
  }

});

const stopWords = ['i', 'me', 'my', 'myself', 'we', 'we’ve', 'our', 'ours', 'ourselves', 'you', 'your', 'yours', 'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', 'her', 'hers', 'herself', 'it', 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves', 'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those', 'am', 'is', 'isn\’t', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'having', 'do', 'don\’t', 'does', 'did', 'doing', 'a', 'an', 'the', 'and', 'but', 'if', 'or', 'because', 'as', 'until', 'while', 'of', 'at', 'by', 'for', 'with', 'about', 'against', 'between', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down', 'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'there\’s', 'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'can', 'will', 'won\’t', 'just', 'don', 'should', 'now', 'us', 'go'];

const punctuations = [",", ".", ":", "'", "?", "!", "“", "”", "’", ";"];

class SoilWord {

  constructor(text, x, y, active, id) {
    this.id = id == undefined ? guid() : id;
    this.text = text;
    this.x = x;
    this.y = y;
    this.boundingBox;
    this.active = settings.greyoutStopWordsInSoil ? this.isValid(text) : active;
    soil[this.id] = this;
    soilOder.push(this.id);
  }

  draw() {
    d3.select("#soil").append("text")
      .attr("id", this.id)
      .text(this.text)
      .attr("font-family", FONT)
      .attr("font-size", settings.soilFontSize)
      .attr("text-anchor", "left")
      .attr("x", this.x)
      .attr("y", this.y)
      .call(dragEvent)
      .attr("class", "soil" + (this.active ? " active" : ""))
      .style("fill-opacity", this.active ? 0.87 : 0.4)
      .on("mouseover", this.active ? this.mouseover : "")
      .on("mouseout", this.active ? this.mouseout : "")
      .on("dblclick", this.active ? this.dblclick : "")
      .on("contextmenu", this.active ? this.rightclick : "");

    this.boundingBox = this.getBBox();

  }

  isValid(w) {
    w = w.toLowerCase();
    return !(stopWords.includes(w) || punctuations.includes(w));
  }

  getBBox() {
    return document.getElementById(this.id).getBBox();
  }

  updatePos(x, y) {
    d3.select('#' + this.id).attr("x", x).attr("y", y);
    this.x = x;
    this.y = y;
    this.boundingBox = this.getBBox();
  }

  dblclick(event, d) {
    let self = this.active == undefined ? soil[this.id] : this;
    if (!self.active) return; // don't plant for inactive soil
    const domain = getClosestSoilText(self);
    const seed = singularize(self.text);
    plant(seed, domain, randomPlant(seed),
      Math.floor(self.x) - 200, Math.floor(self.y));
  }

  rightclick(e, d) {
    console.log("soil right clicked")
    let self = this.active == undefined ? soil[this.id] : this;
    e.preventDefault();
    //$('#options').hide();
    $('#plantTypes').show();
    $('#plantTypes').css('left', e.clientX + 'px');
    $('#plantTypes').css('top', e.clientY + 'px');
    $('body').addClass("rightClicked");

    const handler = function() {
      const type = $(this).text();
      const domain = getClosestSoilText(self);
      console.log("plant from rightClick select")
      plant(self.text, domain, type,
        Math.floor(self.x) - 200, Math.floor(self.y));

      $('#plantTypes').hide();
      $("svg").unbind("contextmenu");
      $('body').removeClass("rightClicked");
      $('#plantTypes ul li').unbind("click", handler);
    }

    $('#plantTypes ul li').bind("click", handler);


  }

  mouseover(event, d) {
    if (event.defaultPrevented) return; // dragged
    d3.select(this)
      .transition()
      .attr("stroke", "black");
  }

  mouseout(event, d) {
    d3.select(this)
      .transition()
      .attr("stroke", "");
  }

}

class Root {
  constructor(id, plant, x, y, l, a) {
    this.maxLife = 200;
    this.life = this.maxLife;

    this.id = id;
    this.plant = plant;
    this.x = x;
    this.y = y;
    this.level = l;
    this.initialAngle = a;
    // path info
    this.currentPos = {
      x: x,
      y: y
    };
    this.currentAngle = 0;
    this.nextPos = {
      x: x,
      y: y
    };
    this.wrapper = d3.select("#" + plant.id + " .roots").append("g")
      .attr("class", "root")
      .attr("id", this.id);
    // text
    this.history = [];
  }

  update() {
    const divergeFactor = 1 - this.life / this.maxLife;
    const noiseX = this.currentPos.x / SCALE_FACTOR + Math.random() * 0.1 * this.level * divergeFactor;
    const noiseY = this.currentPos.y / SCALE_FACTOR + Math.random() * 0.1 * this.level * divergeFactor;

    let angle;
    if (this.initialAngle) {
      angle = this.initialAngle + getRandomArbitrary(0.3, 0.5) * Math.PI;
    } else {
      angle = noise.simplex2(noiseX, noiseY) * Math.PI + Math.PI / 2;
    }
    const dis = Math.random() * SCALE_FACTOR / 4 * (divergeFactor > 0.3 ? 1 : 1.2);

    const deltaX = dis * Math.cos(angle);
    const deltaY = dis * Math.sin(angle);

    this.nextPos.x = roundTo(this.currentPos.x + deltaX, 3);
    this.nextPos.y = roundTo(this.currentPos.y + deltaY, 3);
    this.currentAngle = angle;
    this.initialAngle = undefined;
  }

  grow() { //root
    if (this.life > 0) {
      // do {
      this.update();
      // } while(!this.history.includes(this.currentPos))
      // const duplicate = this.history.includes(this.currentPos);
      const fillO = (this.life / this.maxLife).map(0, 1, 0.3, 0.8);

      this.wrapper.append("line")
        .attr("x1", this.currentPos.x)
        .attr("y1", this.currentPos.y)
        .attr("x2", this.nextPos.x)
        .attr("y2", this.nextPos.y)
        .attr("stroke", "grey")
      //.attr("stroke-opacity", fill0)

      this.history.push([this.currentPos.x, this.currentPos.y]);
      this.life--;
      if (settings.animation) checkIntersections(this);
      // update current with next after append
      this.currentPos.x = this.nextPos.x;
      this.currentPos.y = this.nextPos.y;
    }
    return {
      pos: this.currentPos,
      angle: this.currentAngle
    };
  }

}

class Plant {
  constructor(data) {
    // Basic Plant info
    this.id = data.id;
    this.type = data.type;

    // Text Info
    this.word = data.word;
    this.domain = data.domain;
    this.domainHistory = [this.domain];
    this.endWord;
    this.result = data.results ? data.results : [];
    this.resultToBeDisplayed = Array.from(this.result);
    if (data.max) this.max = data.max;

    // Visuals
    // Positions info
    this.x = data.x;
    this.y = data.y;
    this.translate = data.translate ? data.translate : {
      x: 0,
      y: 0
    };
    this.currentP = {
      x: this.x,
      y: this.y
    };
    this.endPos;
    this.maxNumOfRoots = PAGE_MODE ? 3 : 9;

    this.roots = data.roots ? data.roots : [];
    this.collision = false;
    this.FontSize = settings.plantFontSize;

    // totalAnimation not in use for dynamic grow
    // this.totalAnimation = data.results ? this.calculateTime() : 0;
    // Visual Parameters

    this.growingSpeed = 1000;
    this.rootGrowingSpeed = 250;
    this.lifeSpan = 200;
    this.datamuseResultMax = 5;
    this.HEIGHT = 100;
    this.COMPOST_DISTANCE = 50;
    this.g;
    // Save it plants
    plants[this.id + ""] = this;
  }

  dragstart(event) {
    this.cursorLast = {
      x: (isScale && browserName == "Firefox") ? event.x / SCALE : event.x,
      y: (isScale && browserName == "Firefox") ? event.y / SCALE : event.y
    }
  }

  dragged(d) {

    const newX = (isScale && browserName == "Firefox") ? d.x / SCALE : d.x,
      newY = (isScale && browserName == "Firefox") ? d.y / SCALE : d.y;
    // console.log("plant dragged");
    // console.log("cursor", newX, newY);
    const p = plants[this.id];
    p.updatePos(newX - this.cursorLast.x, newY - this.cursorLast.y);

    this.cursorLast = {
      x: newX,
      y: newY
    }

  }

  /*********** Updates ***********/
  reGenerate(newSeed) {
    if (this.next == null) return;
    this.updateSeed(this.next);
    this.next = null;
    // if(newSeed) this.word = newSeed;
    this.collision = false;
    if (isCompost) {
      this.compost();
      const self = this;
      setTimeout(function() {
        self.grow();
      }, COMPOST_TIME);
    } else {
      this.clear();
      this.grow();
    }
  }

  clear(removeChunk) {
    this.currentP = {
      x: this.x,
      y: this.y
    };
    this.g.selectAll('.branch').remove();
    if (this.type != "ivy") this.g.select('.main_branch').remove();
    if (removeChunk) {
      //for update font size
      this.g.select('.chunk').remove();
      this.g.selectAll('.branch').attr("style", "");
    }
  }

  updateResult(result) {
    this.result = result;
    this.resultToBeDisplayed = Array.from(result);
  }

  updateDomain(word) {
    if (this.domain != word) {
      this.domain = word;
      this.domainHistory.push(word);
      $('#' + this.id + " .chunk .domain text").text(word);
    }
  }

  updateSeed(word) {
    if (this.word != word) {
      this.word = word;
      const seed = $('#' + this.id + " .chunk .seed text");
      seed.text(word)
        .attr("y", this.y - this.calculateHeight() + this.FontSize);
      this.HEIGHT = this.calculateHeight();
    }
    if (this.type != "ivy") {
      this.drawMainBranch(this.x, this.y, this.x, this.y - this.HEIGHT, this.g.select('.chunk'));
    }
  }

  updatePos(deltaX, deltaY) { // plant
    // console.log("translate plant:", deltaX, deltaY);
    // console.log("current",this.translate.x, this.translate.y);
    // update old translate based on new changes
    this.translate.x += deltaX;
    this.translate.y += deltaY;
    d3.select('#' + this.id).attr("style", "transform:translate(" + this.translate.x + "px, " + this.translate.y + "px);");
  }

  updateFontSize(size) {
    console.log("UPDATE FONT SIZE:", this);
    //TODO: fix selection
    this.FontSize = parseInt(size);
    if (this.type == "willow" || "bamboo") {
      $("#verticalTest").css("font-size", size + "px");
    }
    this.clear(true);
    this.draw(true);
    clearInterval(this.rootTimer);
    clearInterval(this.branchTimer);
    this.rootTimer = this.branchTimer = false;
    this.updateResult(this.result);
    this.displayResult();
    $("#Test, #verticalTest").css("font-size", settings.plantFontSize + "px");
  }

  /*********** End of Updates ***********/

  getResult(callback) {
    console.log("getResult", this);
    var params = {
      'word': this.word,
      'domain': this.domain,
      'type': this.type
    }
    if (this.max) params.max = this.max;
    var t = this;
    $('.message').html("...");

    plantServer(params, function(data) {
      if (data == "error") {
        console.log("no plant for", params);
        // keep growing
      } else {
        if (typeof data == "object") callback(data)
        else {
          var json = JSON.parse(data);
          callback(json);
        }

      }
    });

  }

  getNewWord(callback) {
    let p = {
      'domain': this.domain,
      'max': this.datamuseResultMax
    }

    p = this.processSpecificParameters(p, this.word, this.result);
    if (p == false || p == undefined) {
      console.warn("[Invalid Parameters]");
      return false;
    }

    datamuse(p, this, function(data) {
      //console.log(data)
      let w = data.result[0].word;
      if (w == ".") {
        w = data.result[1].word;
      }
      data.plant.result.push(w);
      callback(w);
    })
  }

  grow() { // plant
    const self = this;

    function afterResult(data) {
      //console.log(data);
      // stop growing root after retrieve result
      clearInterval(self.rootTimer);
      self.rootTimer = false;
      self.updateResult(data.results);
      self.endWord = data.endWord
      self.displayResult();
      // console.log("Branch:", self.branchTimer)
    }

    this.getResult(afterResult);
  }

  displayResult() {
    let branchIdx = 0;
    const gs = settings.animation ? this.growingSpeed : 1;
    const rgs = settings.animation ? this.rootGrowingSpeed : 0;
    // only set a timer if there is no current timer running
    if (this.branchTimer) {
      console.log("branch timer conflict!", self)
      return;
    }
    this.branchTimer = setInterval(() => {
      if (this.result.length > 0) {
        if (this.resultToBeDisplayed.length > 0) {
          const w = this.resultToBeDisplayed.pop();
          this.growBranch(w, branchIdx);
        } else {
          // finished display all the branches
          clearInterval(this.branchTimer);
          this.branchTimer = false;
          // start growing roots
          if (this.rootTimer) {
            return;
          }
          if (settings.roots == true) {
            this.rootTimer = setInterval(() => {
              if (this.lifeSpan <= 0) {
                clearInterval(this.rootTimer);
                console.log("clear root timer");
                clearInterval(this.branchTimer);
                return;
              }
              // console.log("growing roots", self.lifeSpan)
              this.growRoots(this.rootTimer);
              this.lifeSpan--;
            }, rgs);
          }
        }
      }
      branchIdx++;
    }, gs);
  }

  growBranch(w, i) { // plant
    var b = d3.select("#" + this.id + " .branches").append("g")
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

    const textX = this.currentP.x - this.FontSize * 1 / 4,
      textY = this.currentP.y - this.FontSize * 1.5 * i - this.HEIGHT - this.FontSize;

    if (!PAGE_MODE) {
      b.append("text")
        .text(w)
        .attr("font-family", FONT)
        .attr("font-size", this.FontSize)
        .attr("x", textX)
        .attr("y", textY)
        .attr("text-anchor", flag)
        .attr("class", "branch_text bg");
    }

    b.append("text")
      .text(w)
      .attr("font-family", FONT)
      .attr("font-size", this.FontSize)
      .attr("x", textX)
      .attr("y", textY)
      .attr("text-anchor", flag)
      .attr("class", "branch_text");

    if (flag == "end") this.currentP.x -= w.length * 4
    else if (flag == "start") this.currentP.y += w.length * 4

  }

  growRoots(timer) {
    for (let j = 0; j < this.roots.length; j++) {
      const current = this.roots[j].grow();
      //const f = this.roots[j].life/this.roots[j].maxLife;
      if (this.roots.length < this.maxNumOfRoots && this.roots[j].level < 4 && Math.random() < 0.1) {
        //console.log("new root,",this.roots.length, this.roots[j].level)
        const newr = new Root(this.id + "_root_" + guid(), this.roots[0].plant, current.pos.x, current.pos.y, this.roots[j].level++, current.angle);
        newr.timer = timer;
        this.roots.push(newr);
      }
    }
  }

  initialize() { // plant
    // init seedling
    var self = this;
    const drag = d3
      .drag()
      .on("start", this.dragstart)
      .on("drag", this.dragged);

    this.g = d3.select('.wrapper').append("g")
      .attr("class", "seedling " + this.type)
      .attr("id", this.id)
      .on('contextmenu', function(d) {
        self.onrightClicked(d, self);
      })
      .call(drag);

    //initialize branches
    this.g.append("g")
      .attr("class", "branches");

    //Initialize roots
    const rWrapper = this.g.append("g")
      .attr("class", "roots");

    const r = new Root(this.id + "_root", this, this.x, this.y, 0);
    this.roots.push(r);
  }

  draw(noInit) { // plant
    var x = this.x,
      y = this.y;

    if (!noInit) this.initialize();

    var c = this.g.append("g")
      .attr("class", "chunk");

    this.drawGround(c);
    this.drawDomain(x, y, c);

    // SEED
    this.drawSeed(x, y - 10, c);
    // change height based on seed width
    this.HEIGHT = this.calculateHeight();
    // MAIN BRANCH
    this.drawMainBranch(x, y, x, y - this.HEIGHT, c, this.FontSize);
  }

  drawSeed(x, y, g) {
    const h = this.word.length * (this.FontSize - 1) + 10;

    const s = g.append("g")
      .attr("class", "seed");

    const xPos = x + this.FontSize / 2,
      yPos = y - h + this.FontSize;

    if (!PAGE_MODE) {
      s.append("text")
        .attr("x", xPos)
        .attr("y", yPos)
        .style("writing-mode", "tb")
        .attr("dy", ".35em")
        .attr("class", "bg")
        .text(this.word)
        .attr("font-family", FONT)
        .attr("font-size", this.FontSize)
    }

    s.append("text")
      .attr("x", xPos)
      .attr("y", yPos)
      .style("writing-mode", "tb")
      .attr("dy", ".35em")
      .text(this.word)
      .attr("font-family", FONT)
      .attr("font-size", this.FontSize)
  }

  drawDomain(x, y, g) {
    const d = g.append("g")
      .attr("class", "domain");
    const xPos = x + this.FontSize / 2,
      yPos = y + this.FontSize / 2;

    if (!PAGE_MODE) {
      d.append("text")
        .attr("x", xPos)
        .attr("y", yPos)
        .attr("dy", ".35em")
        .attr("class", "bg")
        .attr("font-family", FONT)
        .attr("font-size", this.FontSize)
        .text(this.domain);
    }

    d.append("text")
      .attr("x", xPos)
      .attr("y", yPos)
      .attr("dy", ".35em")
      .attr("font-family", FONT)
      .attr("font-size", this.FontSize)
      .text(this.domain);
  }

  drawGround(g) {
    g.append("line")
      .style("stroke-dasharray", this.FontSize / 2 + ", " + this.FontSize / 2)
      .attr("x1", this.x - GROUND_WIDTH / 2)
      .attr("y1", this.y)
      .attr("x2", this.x + GROUND_WIDTH / 2)
      .attr("y2", this.y)
      .attr("stroke", "grey")
      .attr("class", "ground");
  }

  drawMainBranch(x1, y1, x2, y2, g) {
    g.append("line")
      .style("stroke-dasharray", this.FontSize / 2 + ", " + this.FontSize / 2)
      .attr("x1", x1)
      .attr("y1", y1)
      .attr("x2", x2)
      .attr("y2", y2)
      .attr("stroke", "grey")
      .attr("class", "main_branch");
  }

  animate() {
    const g = this.g;
    setTimeout(function() {
      g.classed("show", true);
    }, settings.animation ? 100 : 0);
  }

  compost() {
    const FALLING_TIME = 2000;
    const t = d3.transition()
      .duration(FALLING_TIME)
      .ease(d3.easeLinear);

    this.lifeSpan += 200;
    this.currentP = {
      x: this.x,
      y: this.y
    };
    // (TODO: branches animation?)
    // all branch_text -> soil
    const self = this;
    let counter = 0;
    this.g.selectAll('.branch_text').each(function(d) {
      d3.select(this).style("transform", "");

      const w = d3.select(this).text().replace(/(\|\w+|\/|\\| |=)+/g, "");
      let x = d3.select(this).attr('x'),
        y = parseFloat(d3.select(this).attr('y')) + self.COMPOST_DISTANCE;

      if (self.type == "bamboo" || "pine") {
        x = self.x;
        y = self.y + self.COMPOST_DISTANCE;
      }

      if (self.type == "ginkgo") x = x + counter * 50;
      d3.select(this).transition(t).attr("x", x);
      d3.select(this).transition(t).attr("y", y);

      counter++;

      setTimeout(function() {
        // create new soil words
        const s = new SoilWord(w, x, y, true);
        s.draw();
        self.g.selectAll('.branch').remove();
      }, FALLING_TIME)
    })

    // remove outer branch layer

    // TODO: words falling animation
  }

  calculateHeight() {
    return this.word.length * (this.FontSize - 1) + 10;
  }

  calculateTime() {
    return START_DELAY + this.result.length * 500 + 1000;
  }

  onrightClicked(d, self) {
    let rightClickOnPlant = self.id;
    $("#" + self.id).bind("contextmenu", function(e) {
      if (rightClickOnPlant == null) {
        $("svg").unbind("contextmenu");
        $('svg').removeClass("contextMenu");
      }
      e.preventDefault();
      //console.log("plant options show")
      $('#options').show();
      $('#options').css('left', e.clientX + 'px');
      $('#options').css('top', e.clientY + 'px');
      $('body').addClass("rightClicked");
      $('#plantFontSize_context').val(plants[rightClickOnPlant].FontSize);

      $('#remove').off('click').on('click', function() {
        removePlantById(rightClickOnPlant);
        $('#options').hide();
        rightClickOnPlant = null;
        $("svg").unbind("contextmenu");
        $('body').removeClass("rightClicked");
      })

      $('#changeFontSize').off('click').on('click', function() {
        updatePlantSizeById(rightClickOnPlant);
        $('#options').hide();
        $("svg").unbind("contextmenu");
        $('body').removeClass("rightClicked");
        $("#" + rightClickOnPlant).removeClass('bound');
      });
    })
  }

  getJSON() {
    // console.log(d3.select("#" + this.id + " .branches"), d3.select("#" + this.id + " .branches").html());
    let data = {
      id: this.id,
      type: this.type,
      word: this.word,
      domain: this.domain,
      endWord: this.endWord,
      result: this.result,

      // Positions info
      x: this.x,
      y: this.y,
      translate: this.translate,
      currentP: this.currentP,
      endPos: this.endPos,
      FontSize: this.FontSize,

      // d3
      branches: "" + d3.select("#" + this.id + " .branches").html(),
      roots: []
    };

    // roots data
    for (let i = 0; i < this.roots.length; i++) {
      data.roots.push({
        id: this.roots[i].id,
        history: this.roots[i].history
      })
    }

    return data;
  }

  growFromJSON(data) {
    const line = d3.line().context(null);
    d3.select("#" + this.id + " .branches").html(data.branches);
    for (let i = 0; i < data.roots.length; i++) {
      const g = d3.select("#" + this.id + " .roots")
        .append("g")
        .attr("id", data.roots[i].id)

      for (var j = 0; j < data.roots[i].history.length - 1; j++) {
        const currentPos = data.roots[i].history[j];
        const nextPos = data.roots[i].history[j + 1];

        g.append("line")
          .attr("x1", currentPos[0])
          .attr("y1", currentPos[1])
          .attr("x2", nextPos[0])
          .attr("y2", nextPos[1])
          .attr("stroke", "grey")
          .attr("stroke-opacity", 0.5)

      }

    }

  }
}

class Ginkgo extends Plant {
  constructor(data) {
    super(data);
    this.WIDTH = 330;
    this.LENGTH = this.WIDTH / 2;
    this.HEIGHT = this.calculateHeight();
    this.START_ANGLE = -160 + Math.floor(Math.random() * 60);
    this.growingSpeed = 1000;
    this.lookFor = "nn";
    this.COMPOST_DISTANCE = 150;
  }

  updateBranch() {
    this.g.selectAll('.main_branch').attr("y2", this.y - this.HEIGHT);
    this.currentP.y -= this.HEIGHT;
  }

  calculateTime() {
    return START_DELAY + this.result.length * 500 + 1000;
  }

  clear(noInit) {
    super.clear(noInit);
    this.START_ANGLE = -160 + Math.floor(Math.random() * 60);
  }

  reGenerate(newSeed) {
    super.reGenerate();
    this.updateBranch();
  }

  growBranch(w, i) { // ginkgo
    const x = this.x,
      y = this.currentP.y;
    var b = d3.select("#" + this.id + " .branches").append("g")
      .style("transition-delay", START_DELAY + i * 500 + "ms")
      .attr("class", "branch");
    var angle = 15 * i + this.START_ANGLE;

    // find the end point
    var endy = this.LENGTH * Math.sin(Math.radians(angle)) + y;
    var endx = this.LENGTH * Math.cos(Math.radians(angle)) + x;

    b.append("line")
      .style("position", "absolute")
      .style("stroke-dasharray", this.FontSize / 2 + ", " + this.FontSize / 2)
      .attr("x1", x)
      .attr("y1", y)
      .attr("x2", endx)
      .attr("y2", endy)
      .attr("stroke", "grey")
      .attr("class", "branch_line");

    const transform = "translate(5px) rotate(" + (angle) + "deg) ",
      origin = x + "px " + y + "px 0px";

    const textWrapper = b.append("g")
      .style("transform", transform)
      .style("-webkit-transform", transform)
      .style("transform-origin", origin)
      .style("-webkit-transform-origin", origin)
      .attr("class", "branch_text_wrapper");


    if (!PAGE_MODE) {
      textWrapper.append("text")
        .attr("x", x + 180)
        .attr("y", y)
        .text(w)
        .attr("font-family", FONT)
        .attr("font-size", this.FontSize)
        .attr("class", "branch_text bg");
    }

    textWrapper.append("text")
      .attr("x", x + 180)
      .attr("y", y)
      .text(w)
      .attr("font-family", FONT)
      .attr("font-size", this.FontSize)
      .attr("class", "branch_text");

  }

  draw(noInit) { //Ginkgo
    if (!noInit) this.initialize();

    var x = this.x,
      y = this.y;
    var c = this.g.append("g")
      .attr("class", "chunk");

    this.drawGround(c);
    this.drawSeed(x, y - 20, c)
    this.drawMainBranch(x, y, x, y - this.HEIGHT, c);
    this.drawDomain(x, y, c);


    // BRANCHES
    this.currentP.y -= this.HEIGHT; //move to center
  }
}

class Pine extends Plant {
  constructor(data) {
    super(data);
    this.growingSpeed = 2000;
    this.lifeSpan = 300;
    this.WIDTH = 400;
    this.HEIGHT = this.calculateHeight();;
  }

  // processSpecificParameters(p, seed, result) {
  //   const s = seed.charAt(0), e = seed.charAt(seed.length-1);
  //   let attribute = "";
  //   const lastOne = result.length > 0 ? result[result.length-1] : seed;
  //   if (lastOne.length > 2) {
  //     attribute = s + "?".repeat(lastOne.length-3) + e;
  //   }
  //   else {
  //     return false;
  //   }
  //   p["sp"] = attribute;
  //   return p;
  // }

  calculateTime() {
    return this.totalAnimation = START_DELAY + this.result.length * 1500 + 1000;
  }

  draw(noInit) { // Pine
    if (!noInit) this.initialize();

    var x = this.x,
      y = this.y;
    var c = this.g.append("g")
      .attr("class", "chunk");

    this.drawGround(c);
    this.drawSeed(x, y, c);
    this.drawMainBranch(x, y, x, y - this.HEIGHT, c);
    this.drawDomain(x, y, c);
  }

  growBranch(word, idx) { //pine
    var b = d3.select("#" + this.id + " .branches").append("g")
      .style("transition-delay", 1500 + "ms")
      .attr("class", "branch");
    const posY = this.y - this.FontSize * 1.5 * idx - this.HEIGHT;
    const xOffset = getRandomIntInclusive(-5, 5);

    if (!PAGE_MODE) {
      b.append("text")
        .attr("x", this.x + xOffset)
        .attr("y", posY)
        .attr("text-anchor", "middle")
        .text(word)
        .attr("font-family", FONT)
        .attr("font-size", this.FontSize)
        .attr("class", "branch_text bg");
    }

    b.append("text")
      .attr("x", this.x + xOffset)
      .attr("y", posY)
      .attr("text-anchor", "middle")
      .text(word)
      .attr("font-family", FONT)
      .attr("font-size", this.FontSize)
      .attr("class", "branch_text");

  }

}

class Ivy extends Plant {
  constructor(data) {
    super(data);
    this.pointer = this.x;
    this.datamuseResultMax = 50;
    this.COMPOST_DISTANCE = 100;
    this.growingSpeed = 2000;
    this.lifeSpan = 150;
    this.angle = data.angle ? degreeToRad(data.angle) : 0;
  }

  calculateTime() {
    return START_DELAY + this.result.length * 1000 + 1000;
  }

  updateResult(result) {
    this.result = result;
    this.resultToBeDisplayed = Array.from(result).reverse();;
  }

  getNewWord(callback) {
    let p = {
      'domain': this.domain,
      'max': this.datamuseResultMax
    }

    p = this.processSpecificParameters(p, this.word, this.result);
    if (p == false || p == undefined) {
      console.warn("[Invalid Parameters]");
      return false;
    }

    datamuse(p, this, function(data) {
      let w;
      do {
        w = data.result[Math.floor(Math.random() * data.result.length)].word;
      } while (data.plant.result.includes(w))
      data.plant.result.push(w);
      if (w == ".") return false;
      callback(w);
    })
  }

  growBranch(w, idx) { //ivy

    var b = d3.select("#" + this.id + " .branches").append("g")
      .style("transition-delay", START_DELAY + idx * 1000 + "ms")
      .attr("class", "branch");
    var v = idx % 2 == 0 ? -1 : 1;
    this.lastP = {
      x: this.currentP.x,
      y: this.currentP.y
    };
    var ypos = 0;
    if (this.angle) {
      if (this.angle < Math.PI) {
        this.currentP.y += this.FontSize + Math.random() * 10;
        ypos = this.currentP.y;
      } else if (this.angle >= Math.PI) {
        this.currentP.y -= this.FontSize + Math.random() * 10;
        ypos = this.currentP.y;
      }
      if (this.angle != Math.PI / 2 && this.angle != Math.PI / 2 * 3)
        this.currentP.x += (this.currentP.y - this.lastP.y) / Math.tan(this.angle) + Math.random() * 30;
    } else {
      this.currentP.x += this.FontSize * w.length * 2 / 3;
      ypos = this.y + (this.FontSize * v + Math.random() * 15) - this.FontSize * 3;
    }

    if (!PAGE_MODE) {
      b.append("text")
        .attr("x", this.currentP.x)
        .attr("y", ypos)
        .attr("text-anchor", "middle")
        .text(w)
        .attr("font-family", FONT)
        .attr("font-size", this.FontSize)
        .attr("class", "branch_text bg");
    }

    b.append("text")
      .attr("x", this.currentP.x)
      .attr("y", ypos)
      .attr("text-anchor", "middle")
      .text(w)
      .attr("font-family", FONT)
      .attr("font-size", this.FontSize)
      .attr("class", "branch_text");

  }

  draw(noInit) { // ivy
    if (!noInit) this.initialize();

    console.log("ivy draw");
    var x = this.x,
      y = this.y;
    var c = this.g.append("g")
      .attr("class", "chunk");

    // special draw ground
    c.append("line")
      .style("stroke-dasharray", this.FontSize / 2 + ", " + this.FontSize / 2)
      .attr("x1", x - 60)
      .attr("y1", y)
      .attr("x2", x + GROUND_WIDTH)
      .attr("y2", y)
      .attr("class", "ground");

    this.drawDomain(x + 100, y, c);

    var p1 = {
      x: this.x,
      y: this.y + (this.FontSize + Math.random() * 15) - this.FontSize * 3
    };
    var p2 = {
      x: this.x + 50,
      y: this.y + 20
    };
    if (this.angle) {
      p1.x = this.x;
      p2 = {
        x: p1.x + GROUND_WIDTH * Math.cos(this.angle),
        y: p1.y + GROUND_WIDTH * Math.sin(this.angle)
      };
    }

    this.drawMainBranch(p2.x, p2.y, p1.x, p1.y, c);
  }

  processSpecificParameters(p, seed, result) {
    p["md"] = "pf";
    p["rel_bga"] = seed;
    return p;
  }

}

class Dandelion extends Plant {
  constructor(data) {
    super(data);
    this.WIDTH = 22 * this.FontSize;
    this.LENGTH = this.WIDTH / 3;
    this.growingSpeed = 1500;
    this.lifeSpan = 100;
    this.HEIGHT = this.calculateHeight();
  }

  calculateTime() {
    return START_DELAY + this.result.length * 200 + 1000;
  }

  growBranch(w, i) { //dandelion
    var b = d3.select("#" + this.id + " .branches").append("g")
      .style("transition-delay", START_DELAY + i * 200 + "ms")
      .attr("class", "branch");

    var angle = 180 + 18 * i + Math.random();
    // avoid over crowded top section
    if (i >= 4) angle += 2;
    if (i >= 5) angle += 3;
    if (i >= 6) angle += 2;

    var local_Y = this.y - this.HEIGHT;
    var l = this.LENGTH + (i % 2 == 0 ? -20 : 0);
    // find the end point
    var endy = l * Math.sin(Math.radians(angle)) + local_Y
    var endx = l * Math.cos(Math.radians(angle)) + this.x

    b.append("line")
      .style("position", "absolute")
      .style("stroke-dasharray", this.FontSize / 2 + ", " + this.FontSize / 2)
      .attr("x1", this.x)
      .attr("y1", local_Y)
      .attr("x2", endx)
      .attr("y2", endy)
      .attr("stroke", "grey")
      .attr("class", "branch_line");

    const transform = "translate(5px) rotate(" + (angle / 5 - 60) + "deg) ";
    const origin = this.x + "px " + local_Y + "px 0px";
    const textWrapper = b.append("g")
      .attr("class", "branch_text_wrapper")
      .style("transform", transform)
      .style("-webkit-transform", transform)
      .style("transform-origin", origin)
      .style("-webkit-transform-origin", origin);

    if (!PAGE_MODE) {
      textWrapper.append("text")
        .text(w)
        .attr("font-family", FONT)
        .attr("font-size", this.FontSize)
        .attr("x", endx - 20)
        .attr("y", endy - 20)
        .attr("class", "branch_text bg");
    }

    textWrapper.append("text")
      .text(w)
      .attr("font-family", FONT)
      .attr("font-size", this.FontSize)
      .attr("x", endx - 20)
      .attr("y", endy - 20)
      .attr("class", "branch_text");

    if (i == this.result.length - 1) this.endPos = {
      "x": endx,
      "y": endy
    }

    //drawText
  }

  draw(noInit) { //Dandelion
    if (!noInit) this.initialize();

    var x = this.x,
      y = this.y;
    var WIDTH = this.WIDTH,
      LENGTH = this.LENGTH;
    var c = this.g.append("g")
      .attr("class", "chunk");

    this.drawGround(c);
    this.drawSeed(x, y, c);
    this.drawMainBranch(x, y, x, y - LENGTH, c);
    this.drawDomain(x, y, c);

    this.currentP.y = this.y - 200;
  }
}

class Koru extends Plant {
  constructor(data) {
    super(data);
    this.totalLength = 13 + Math.floor(Math.random() * 5);
    this.spiralWrapper;
    // TODO: spiralWrapper has a very different dom structure - branches
  }

  calculateTime() {
    return this.totalAnimation = START_DELAY + this.totalLength * 200 + 3000;
  }

  growBranch(w, i) { //koru

    const b = this.spiralWrapper.append("tspan").lower()
      .style("font-size", this.fontSize)
      .style("letter-spacing", ".2rem")
      .style("transition-delay", START_DELAY + i * 200 + "ms")
      .text(w + " ")
      .attr("font-family", FONT)
      .attr("font-size", this.FontSize)

    const d = this.spiralWrapper.node().getBBox();
    //console.log(this.word, getTextWidth(this.word));
    d3.select(this.spiralWrapper.node().parentNode)
      .attr("transform", "translate(" + (this.x - d.width) + "," + (this.y - d.height - 80 - getTextWidth(this.word) * 2) + ")")
  }

  draw(noInit) { // koru
    if (!noInit) this.initialize();

    var x = this.x,
      y = this.y;
    var c = this.g.append("g")
      .attr("class", "chunk");
    this.drawSeed(x, y, c)
    this.drawMainBranch(x, y, x, y - 60, c);

    var t = this.g.append("text")
      .attr("class", "koruResult");

    this.spiralWrapper = t.append("textPath")
      .attr("xlink:href", '#Spiral')
      .attr("startOffset", 30)
      .attr("transform", "rotate(" + getRandomIntInclusive(0, 180) + ")");
  }
}

class Willow extends Plant {
  constructor(data) {
    super(data);
    this.maxBranchLength = 100;
  }

  growBranch(w, i) { // Willow
    var content = w;
    var h = getTextWidth(content, true);

    const x = this.currentP.x + this.FontSize * (i + 1) / 2 * (i % 2 == 0 ? 1 : -1),
      y = this.currentP.y + getRandomIntInclusive(-10, 10);

    if (h > this.maxBranchLength + 100) {
      this.maxBranchLength = h;
      d3.select("#" + this.id + " .branches")
        .attr("style", "transform:translate(0px, " + (-this.maxBranchLength + 200) + "px);");
    }

    var b = d3.select("#" + this.id + " .branches").append("g")
      .style("transition-delay", START_DELAY + i * 1000 + "ms")
      .attr("class", "branch");

    b.append("line")
      .style("stroke-dasharray", this.FontSize / 2 + ", " + this.FontSize / 2)
      .attr("x1", x)
      .attr("y1", y)
      .attr("x2", x)
      .attr("y2", y + h)
      .attr("stroke", "grey");

    // draw one letter each time
    for (var i = content.length - 1; i >= 0; i--) {
      const t = content.charAt(i).toUpperCase();
      b.append("text")
        .attr("x", x)
        .attr("y", y + this.FontSize * i)
        .attr("text-anchor", "end")
        .text(t)
        .attr("font-family", FONT)
        .attr("font-size", this.FontSize)
        .attr("class", "branch_text");
    }

  }

  draw(noInit) { // Willow
    if (!noInit) this.initialize();

    var x = this.x,
      y = this.y;
    var WIDTH = 500;

    var c = this.g.append("g")
      .attr("class", "chunk");

    this.drawSeed(x, y, c);
    this.drawGround(c);
    this.drawDomain(x, y, c);


    var HEIGHT = getTextWidth(this.word, true);

    this.drawMainBranch(x, y, x, y - HEIGHT, c);

    this.currentP.x = this.x + 30;
    this.currentP.y = this.y - HEIGHT - this.maxBranchLength;
    //console.log(this.y, this.currentP.y);
    ;
  }
}

class Bamboo extends Plant {
  constructor(data) {
    super(data);
    this.growingSpeed = 3000;

  }

  calculateTime() {
    return this.totalAnimation = START_DELAY + this.result.length * 1000 + 1000;
  }

  updateResult(result) {
    this.result = result;
    this.resultToBeDisplayed = Array.from(result).reverse();;
  }

  growBranch(w, i) { //bamboo
    var content = w + (i == 0 ? "" : "=");
    var h = getTextWidth(content, true);
    this.currentP.y -= h;

    const x = this.currentP.x,
      y = this.currentP.y;

    var b = d3.select("#" + this.id + " .branches").append("g")
      .style("transition-delay", START_DELAY + i * 1000 + "ms")
      .attr("class", "branch");

    if (y < 0) {
      // don't show the word if it's not fully visible
      console.warn("Beyond the edge of the canvas");
      return;
    }

    for (var i = content.length - 1; i >= 0; i--) {
      const t = content.charAt(i).toUpperCase();
      b.append("text")
        .attr("x", x)
        .attr("y", y + this.FontSize * i)
        .attr("text-anchor", "end")
        .text(t)
        .attr("font-family", FONT)
        .attr("font-size", this.FontSize)
        .attr("class", "branch_text");
    }

  }

  draw(noInit) { // bamboo
    if (!noInit) this.initialize();

    var x = this.x,
      y = this.y;
    var WIDTH = 500;

    var c = this.g.append("g")
      .attr("class", "chunk");

    this.drawGround(c);
    this.drawDomain(x, y, c);


    var HEIGHT = getTextWidth(this.word, true);
    this.drawMainBranch(x, y, x, y - HEIGHT, c);

    this.currentP.x += 30;
    this.currentP.y -= 10;
  }
}

let PLANTS = {
  "bamboo": Bamboo,
  "dandelion": Dandelion,
  "ginkgo": Ginkgo,
  "willow": Willow,
  //"koru":Koru, // koru cant be rendered in svg
  "ivy": Ivy,
  "pine": Pine,
  "plant": Plant
}
// remove bamboo for safari
const ua = navigator.userAgent.toLowerCase()
const is_safari = ua.indexOf('safari/') > -1 && ua.indexOf('chrome') < 0;
if (is_safari) delete PLANTS["bamboo"];

// Functions

function getClosestSoilText(thisSoil) {
  let dmin = 100000,
    closest;
  d3.selectAll(".soil.active").each(function() {
    if (thisSoil.text == d3.select(this).text()) {
      return true;
    }
    // TODO: still needed?
    const soilX = thisSoil.active != undefined ? thisSoil.x : d3.select(thisSoil).attr('x');
    const soilY = thisSoil.active != undefined ? thisSoil.y : d3.select(thisSoil).attr('y');
    const d = getDistance(soilX, soilY, d3.select(this).attr('x'), d3.select(this).attr('y'));
    if (d < dmin) {
      dmin = d;
      closest = d3.select(this)
    }
  })
  return closest.text();
}

function roundTo(num, decimal) {
  return parseFloat(num.toFixed(decimal));
}

function getDistance(x1, y1, x2, y2) {
  const a = x1 - x2;
  const b = y1 - y2;
  return Math.sqrt(a * a + b * b);
}

function fnBrowserDetect() {
  // Notes on Browser
  // ON Drag works best with chrome based browsers, no need to do extra calculation for scaling
  // Edge is also detected as chrome but dragging works finished
  // Firefox: needs recalculation based on ratio for scaled Canvas
  // Safari: cursor value is weird... not supported at the moment

  let userAgent = navigator.userAgent;

  if (userAgent.match(/chrome|chromium|crios/i)) {
    browserName = "chrome";
  } else if (userAgent.match(/firefox|fxios/i)) {
    browserName = "firefox";
  } else if (userAgent.match(/safari/i)) {
    browserName = "safari";
  } else if (userAgent.match(/opr\//i)) {
    browserName = "opera";
  } else if (userAgent.match(/edg/i)) {
    browserName = "edge";
  } else {
    browserName = "No browser detection";
  }

  console.log("You are using " + browserName + " browser");
}

function degreeToRad(deg) {
  var rad = deg * Math.PI / 180;
  return rad;
}
Math.radians = function(degrees) {
  return degrees * Math.PI / 180;
}
Number.prototype.map = function(in_min, in_max, out_min, out_max) {
  return (this - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}
