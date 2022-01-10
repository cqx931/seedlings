// Switches
let FONT_SIZE = 14, DASH_STYLE = FONT_SIZE / 2 + ", " + FONT_SIZE / 2;

const isCompost = false;
const FONT = "Source Code Pro Light, monospace";
const SCALE_FACTOR = 20, COMPOST_TIME = 4000,
      GROUND_WIDTH = 200,
      START_DELAY = 500, // chunk - branch
      LEFT_MARGIN = 200;

let PAGE_MODE = true;

const dragEvent = d3.drag().on("drag", function(d) {
  console.log(d.x, d.y)
  // update d3 text element with the drag position
  const newX = d.x/SCALE,
    newY = d.y/SCALE + 5;
  // update the soilWord object
  const s = soil[this.id];
  s.updatePos(newX, newY);
});

const stopWords = ['i', 'me', 'my', 'myself', 'we', 'we’ve', 'our', 'ours', 'ourselves', 'you', 'your', 'yours', 'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', 'her', 'hers', 'herself', 'it', 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves', 'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those', 'am', 'is', 'isn\’t', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'having', 'do', 'don\’t', 'does', 'did', 'doing', 'a', 'an', 'the', 'and', 'but', 'if', 'or', 'because', 'as', 'until', 'while', 'of', 'at', 'by', 'for', 'with', 'about', 'against', 'between', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down', 'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'there\’s', 'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'can', 'will', 'won\’t', 'just', 'don', 'should', 'now', 'us', 'go'];

const punctuations = [",", ".", ":", "'", "?", "!", "“", "”", "’", ";"];

class SoilWord {

  constructor(text, x, y, active, id) {
    this.id = id == undefined ? guid() : id;
    this.text = text;
    this.x = x;
    this.y = y;
    this.active = active == undefined ? this.isValid(text) : active;
    this.draw();
    this.boundingBox = this.getBBox();
    if (this.active) {
      soil[this.id] = this;
      soilOder.push(this.id);
    }
  }

  draw() {
    const tmp = d3.select("#soil").append("text")
      .attr("id", this.id)
      .text(this.text)
      .attr("font-family", FONT)
      .attr("x", this.x)
      .attr("y", this.y)
      .call(dragEvent)
      .attr("class", "soil" + (this.active ? " active" : ""))
      .style("fill-opacity", this.active ? 0.87 : 0.4)
      .on("mouseover", this.active ? this.mouseover : "")
      .on("mouseout", this.active ? this.mouseout : "")
      .on("dblclick", this.active ? this.dblclick : "")
      .on("contextmenu", this.active ? this.rightclick : "");
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
        .attr("stroke-opacity", fillO)
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

    // Visuals
    // Positions info
    this.x = data.x;
    this.y = data.y;
    this.translate = data.translate ? data.translate : {x:0,y:0};
    this.currentP = {
      x: this.x,
      y: this.y
    };
    this.endPos;
    this.maxNumOfRoots = PAGE_MODE ? 3 : 9;

    // d3 elements
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
    //TODO: on drag

    this.roots = data.roots ? data.roots : [];
    this.collision = false;
    this.FontSize = FONT_SIZE;
    // totalAnimation not in use for dynamic grow
    // this.totalAnimation = data.results ? this.calculateTime() : 0;

    // Visual Parameters
    this.growingSpeed = 1000;
    this.rootGrowingSpeed = 250;
    this.lifeSpan = 200;
    this.datamuseResultMax = 5;
    this.HEIGHT = 100;
    this.COMPOST_DISTANCE = 50;

    // Save it plants
    plants[this.id + ""] = this;
  }

  dragstart(event) {
     this.cursorStart = {
       x:event.x,
       y:event.y
     }
  }

   dragged(d) {
     const newX = d.x/SCALE,
     newY = d.y/SCALE;
     const p = plants[this.id];
     p.updatePos(newX-this.cursorStart.x, newY-this.cursorStart.y);
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

  clear() {
    this.currentP = {
      x: this.x,
      y: this.y
    };
    this.g.selectAll('.branch').remove();
    if (this.type != "ivy") this.g.select('.main_branch').remove();
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
        .attr("y", this.y - this.calculateHeight() + FONT_SIZE)
      this.HEIGHT = this.calculateHeight();
    }
    if (this.type != "ivy") {
      drawMainBranch(this.x, this.y, this.x, this.y - this.HEIGHT, this.g.select('.chunk'));
    }
  }

  updatePos(deltaX, deltaY) {
     d3.select('#' + this.id).attr("style", "transform:translate(" + deltaX + "px, " + deltaY + "px);");
    this.translate.x = deltaX;
    this.translate.y = deltaY;
  }

  /*********** End of Updates ***********/

  getResult(callback) {
    var params = {
      'word': this.word,
      'domain': this.domain,
      'type': this.type
    }

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
    let branchIdx = 0;
    const gs = settings.animation ? this.growingSpeed : 1;
    const rgs = settings.animation ? this.rootGrowingSpeed : 0;
    const self = this;

    function afterResult(data) {
      // stop growing root after retrieve result
      clearInterval(self.rootTimer);
      self.rootTimer = false;

      self.updateResult(data.results);
      self.endWord = data.endWord
      // only set a timer if there is no current timer running
      if (self.branchTimer) {
        console.log("branch timer conflict!", self)
        return;
      }
      self.branchTimer = setInterval(() => {
        if (self.result.length > 0) {
          if (self.resultToBeDisplayed.length > 0) {
            const w = self.resultToBeDisplayed.pop();
            self.growBranch(w, branchIdx);
          } else {
            // finished display all the branches
            clearInterval(self.branchTimer);
            self.branchTimer = false;
            // start growing roots
            if (self.rootTimer) {
              console.log("root timer conflict!", self)
              return;
            }
           if (settings.roots == true)  {
           self.rootTimer = setInterval(() => {
              if (self.lifeSpan <= 0) {
                clearInterval(self.rootTimer);
                clearInterval(self.branchTimer);
                return;
              }
              // console.log("growing roots", self.lifeSpan)
              self.growRoots(self.rootTimer);
              self.lifeSpan--;
            }, rgs);
             }
          }
        }
        branchIdx++;
      }, gs);
      // console.log("Branch:", self.branchTimer)

    }

    this.getResult(afterResult);
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
        .attr("x", textX)
        .attr("y", textY)
        .attr("text-anchor", flag)
        .attr("class", "branch_text bg");
    }

    b.append("text")
      .text(w)
      .attr("font-family", FONT)
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
    //initialize branches
    this.g.append("g")
      .attr("class", "branches");

    //Initialize roots
    const rWrapper = this.g.append("g")
      .attr("class", "roots");

    const r = new Root(this.id + "_root", this, this.x, this.y, 0);
    this.roots.push(r);
  }

  draw() { // plant
    console.log("plant draw")
    var x = this.x,
      y = this.y;
    var c = this.g.append("g")
      .attr("class", "chunk");

    drawGround(x, y, c);
    drawDomain(this.domain, x, y, c);

    this.initialize();

    // SEED
    var seed = drawSeed(this.word, x, y - 10, c, this.fontSize);
    // change height based on seed width
    this.HEIGHT = this.calculateHeight();
    console.log(this.HEIGHT);
    // MAIN BRANCH
    drawMainBranch(x, y, x, y - this.HEIGHT, c);
  }

  animate() {
    var g = this.g;
    setTimeout(function() {
      g.classed("show", true);
    }, settings.animation ? 100 : 0);
  }

  updateFontSize(size) {
    this.FontSize = size;
    //TODO: re draw the plant with same text
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
    console.log(self.id, plants[self.id])
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

      $('#remove').click(function() {
        //move?
        removePlantById(rightClickOnPlant);
        $('#options').hide();
        rightClickOnPlant = null;
        $("svg").unbind("contextmenu");
        $('body').removeClass("rightClicked");
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
      endWord:this.endWord,
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
      roots:[]
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

  growFromJSON(data){
    d3.select("#" + this.id + " .branches").html(data.branches);
    // constrct roots from points
    for (let i = 0; i < data.roots.length; i++) {
      console.log(d3.line(data.roots[i].history))

      d3.select("#" + this.id + " .roots")
        .append("path")
        .attr("id",data.roots[i].id)
        .attr("d", d3.line(data.roots[i].history))
        .attr("stroke", "black")
        .attr("stroke-opacity", 0.5);


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

  clear() {
    super.clear();
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
      .style("stroke-dasharray", DASH_STYLE)
      .attr("x1", x)
      .attr("y1", y)
      .attr("x2", endx)
      .attr("y2", endy)
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
        .attr("x", x)
        .attr("y", y)
        .text("            " + w)
        .attr("font-family", FONT)
        .attr("class", "branch_text bg");
    }

    textWrapper.append("text")
      .attr("x", x)
      .attr("y", y)
      .text("            " + w)
      .attr("font-family", FONT)
      .attr("class", "branch_text");

  }

  draw() {
    var x = this.x,
      y = this.y;
    var c = this.g.append("g")
      .attr("class", "chunk");

    drawGround(x, y, c)
    // SEED
    var seed = drawSeed(this.word, x, y - 20, c, this.fontSize)
    drawMainBranch(x, y, x, y - this.HEIGHT, c);
    drawDomain(this.domain, x, y, c);
    this.initialize();

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

  draw() { // Pine
    var x = this.x,
      y = this.y;
    var c = this.g.append("g")
      .attr("class", "chunk");

    this.initialize();
    drawGround(x, y, c);
    drawSeed(this.word, x, y, c, this.fontSize);
    drawMainBranch(x, y, x, y - this.HEIGHT, c);
    drawDomain(this.domain, x, y, c);
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
      .attr("class", "branch_text bg");
    }

    b.append("text")
      .attr("x", this.x + xOffset)
      .attr("y", posY)
      .attr("text-anchor", "middle")
      .text(word)
      .attr("font-family", FONT)
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
    var ypos =  0;
    if (this.angle) {
      if (this.angle < Math.PI) {
        this.currentP.y += this.FontSize + Math.random() * 10;
        ypos = this.currentP.y;
      } else if(this.angle >= Math.PI) {
        this.currentP.y -= this.FontSize + Math.random() * 10;
        ypos = this.currentP.y;
      }
      if (this.angle != Math.PI/2 && this.angle != Math.PI/2  * 3)
        this.currentP.x += (this.currentP.y- this.lastP.y) / Math.tan(this.angle) + Math.random() * 30;
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
      .attr("class", "branch_text bg");
    }

    b.append("text")
      .attr("x", this.currentP.x)
      .attr("y", ypos)
      .attr("text-anchor", "middle")
      .text(w)
      .attr("font-family", FONT)
      .attr("class", "branch_text");

  }

  draw() { // ivy
    console.log("ivy draw");
    var x = this.x,
      y = this.y;
    var c = this.g.append("g")
      .attr("class", "chunk");

    // special draw ground
    c.append("line")
      .style("stroke-dasharray", DASH_STYLE)
      .attr("x1", x - 60)
      .attr("y1", y)
      .attr("x2", x + GROUND_WIDTH)
      .attr("y2", y)
      .attr("class", "ground");

    drawDomain(this.domain, x + 100, y, c);
    this.initialize();
    var p1 = {
      x: this.x,
      y: this.y + (this.FontSize + Math.random() * 15) - this.FontSize * 3
    };
    var p2 = {
      x: this.x + 50,
      y: this.y + 20
    };
    if (this.angle){
       p1.x = this.x;
       p2 = {
        x: p1.x + GROUND_WIDTH * Math.cos(this.angle),
        y: p1.y + GROUND_WIDTH * Math.sin(this.angle)
       };
     }
    drawMainBranch(p2.x, p2.y, p1.x, p1.y, c);
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
    var local_Y = this.y - this.HEIGHT;
    var l = this.LENGTH + (i % 2 == 0 ? -20 : 0);
    // find the end point
    var endy = l * Math.sin(Math.radians(angle)) + local_Y
    var endx = l * Math.cos(Math.radians(angle)) + this.x

    b.append("line")
      .style("position", "absolute")
      .style("stroke-dasharray", DASH_STYLE)
      .attr("x1", this.x)
      .attr("y1", local_Y)
      .attr("x2", endx)
      .attr("y2", endy)
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
      .attr("x", endx - 20)
      .attr("y", endy - 20)
      .attr("class", "branch_text bg");
    }

    textWrapper.append("text")
      .text(w)
      .attr("font-family", FONT)
      .attr("x", endx - 20)
      .attr("y", endy - 20)
      .attr("class", "branch_text");

    if (i == this.result.length - 1) this.endPos = {
      "x": endx,
      "y": endy
    }

    //drawText
  }

  draw() {
    var x = this.x,
      y = this.y;
    var WIDTH = this.WIDTH,
      LENGTH = this.LENGTH;
    var c = this.g.append("g")
      .attr("class", "chunk");

    drawGround(x, y, c);

    this.initialize();
    var seed = drawSeed(this.word, x, y, c, this.fontSize);
    drawMainBranch(x, y, x, y - LENGTH, c);
    drawDomain(this.domain, x, y, c);

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
    const b = this.spiralWrapper.append("tspan")
      .style("font-size", FONT_SIZE + i)
      .style("transition-delay", START_DELAY + i * 200 + "ms")
      .text(w + " ")
      .attr("font-family", FONT)
  }

  draw() { // koru
    var x = this.x,
      y = this.y;
    var c = this.g.append("g")
      .attr("class", "chunk");

    var w = getTextWidth(this.word);

    drawSeed(this.word, x, y, c, this.fontSize)
    drawMainBranch(x, y, x, y - 60, c);

    var t = this.g.append("text")
      .attr("class", "koruResult")
      .attr("transform", "translate(" + (x - 100) + "," + (y - 250) + ") scale(0.5)")

    this.spiralWrapper = t.append("textPath")
      .attr("xlink:href", '#Spiral');
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
    const x = this.currentP.x,
      y = this.currentP.y;
    var b = d3.select("#" + this.id + " .branches").append("g")
      .style("transition-delay", START_DELAY + i * 1000 + "ms")
      .attr("class", "branch");
    var content = w + (i == 0 ? "" : "=");
    var h = getTextWidth(content, true);
    if (y - h < 0) {
      // don't show the word if it's not fully visible
      console.warn("Beyond the edge of the canvas");
      return;
    }

    if (!PAGE_MODE) {
    b.append("text")
      .attr("x", x)
      .attr("y", y)
      .attr("text-anchor", "end")
      .text(content)
      .attr("font-family", FONT)
      .attr("class", "branch_text bg");
    }

    b.append("text")
      .attr("x", x)
      .attr("y", y)
      .attr("text-anchor", "end")
      .text(content)
      .attr("font-family", FONT)
      .attr("class", "branch_text");

    this.currentP.y -= h;

  }

  draw() { // bamboo
    var x = this.x,
      y = this.y;
    var WIDTH = 500;

    var c = this.g.append("g")
      .attr("class", "chunk");

    drawGround(x, y, c);
    drawDomain(this.domain, x, y, c)
    this.initialize();

    var HEIGHT = getTextWidth(this.word, true);

    drawMainBranch(x, y, x, y - HEIGHT, c);

    this.currentP.x += 30;
    this.currentP.y -= 10;
  }
}

let PLANTS = {
  "bamboo": Bamboo,
  "dandelion": Dandelion,
  "ginkgo": Ginkgo,
  //"koru":Koru,
  "ivy": Ivy,
  "pine": Pine,
  "plant": Plant
}
// remove bamboo for safari
const ua = navigator.userAgent.toLowerCase()
const is_safari = ua.indexOf('safari/') > -1 && ua.indexOf('chrome') < 0;
if(is_safari) delete PLANTS["bamboo"];

// Functions
function drawSeed(seed, x, y, g, fontSize) {
  const h = seed.length * (fontSize - 1) + 10;

  const s = g.append("g")
    .attr("class", "seed");
  console.log("drawSeed", seed, x, y, g, fontSize)
  const xPos = x + fontSize / 2,
    yPos = y - h + fontSize;

  if (!PAGE_MODE) {
  s.append("text")
    .attr("x", xPos)
    .attr("y", yPos)
    .style("writing-mode", "tb")
    .attr("dy", ".35em")
    .attr("class", "bg")
    .text(seed)
    .attr("font-family", FONT)
  }

  s.append("text")
    .attr("x", xPos)
    .attr("y", yPos)
    .style("writing-mode", "tb")
    .attr("dy", ".35em")
    .text(seed)
    .attr("font-family", FONT)

  return s;
}

function drawDomain(domain, x, y, g) {
  const d = g.append("g")
    .attr("class", "domain");
  const xPos = x + FONT_SIZE / 2,
    yPos = y + FONT_SIZE / 2;

  if (!PAGE_MODE) {
  d.append("text")
    .attr("x", xPos)
    .attr("y", yPos)
    .attr("dy", ".35em")
    .attr("class", "bg")
    .attr("font-family", FONT)
    .text(domain);
  }


  d.append("text")
    .attr("x", xPos)
    .attr("y", yPos)
    .attr("dy", ".35em")
    .attr("font-family", FONT)
    .text(domain);

}

function drawGround(x, y, g) {
  g.append("line")
    .style("stroke-dasharray", DASH_STYLE)
    .attr("x1", x - GROUND_WIDTH / 2)
    .attr("y1", y)
    .attr("x2", x + GROUND_WIDTH / 2)
    .attr("y2", y)
    .attr("class", "ground");
}

function drawMainBranch(x1, y1, x2, y2, g) {
  console.log("draw main b",x1, y1, x2, y2, g.empty())
  g.append("line")
    .style("stroke-dasharray", DASH_STYLE)
    .attr("x1", x1)
    .attr("y1", y1)
    .attr("x2", x2)
    .attr("y2", y2)
    .attr("class", "main_branch");
}

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
    return  parseFloat(num.toFixed(decimal));
}

function getDistance(x1, y1, x2, y2) {
  const a = x1 - x2;
  const b = y1 - y2;
  return Math.sqrt(a * a + b * b);
}

Math.radians = function(degrees) {
  return degrees * Math.PI / 180;
}
Number.prototype.map = function(in_min, in_max, out_min, out_max) {
  return (this - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}
