// Switches
const isCompost = false;
const ANIME = true;

// noise
noise.seed(Math.random());
const SCALE_FACTOR = 20;
const COMPOST_TIME = 4000;
const STROKE_COLOR = "grey";
const FONT_SIZE = 14,
      DASH_STYLE = FONT_SIZE/2 + ", " + FONT_SIZE/2,
      SECTION_GAP = 50, // between two plants
      GROUND_WIDTH = 200,
      START_DELAY = 500, // chunk - branch
      LEFT_MARGIN = 200;

const dragEvent = d3.drag().on("drag", function(d) {
    d3.select(this).attr("x", d.x-10).attr("y", d.y+5);
    // TODO: update soilWord object
  });

const stopWords = ['i','me','my','myself','we','our','ours','ourselves','you','your','yours','yourself','yourselves','he','him','his','himself','she','her','hers','herself','it','its','itself','they','them','their','theirs','themselves','what','which','who','whom','this','that','these','those','am','is','are','was','were','be','been','being','have','has','had','having','do','does','did','doing','a','an','the','and','but','if','or','because','as','until','while','of','at','by','for','with','about','against','between','into','through','during','before','after','above','below','to','from','up','down','in','out','on','off','over','under','again','further','then','once','here','there','when','where','why','how','all','any','both','each','few','more','most','other','some','such','no','nor','not','only','own','same','so','than','too','very','s','t','can','will','just','don','should','now'];

const punctuations = [",", ".",":","'","?","!","“","”",,"’"];

class SoilWord {

  constructor(text, x, y, active) {
    this.id = guid();
    this.text = text;

    this.x = x;
    this.y = y;
    this.active = this.active == undefined ? this.isValid(text) : false;
    const tmp = d3.select("#soil").append("text")
                  .attr("class","soil" + (this.active ? " active":""))
                  .style("fill-opacity", this.active ? 1: 0.5)
                  .attr("id", this.id)
                  .text(this.text)
                  .attr("x", this.x)
                  .attr("y", this.y)
                  .call(dragEvent)
                  .on("click", this.clicked)
                  .on("dblclick", this.dblclick);
    this.boundingBox = document.getElementById(this.id).getBBox();
    if (active) soil.push(this);
  }

  isValid(w){
    w = w.toLowerCase();
    return !(stopWords.includes(w) || punctuations.includes(w));
  }

  dblclick(event,d) {
    const domain = getClosestSoilText(this);
    plant(d3.select(this).text(), domain, randomPlant(),
      Math.floor(d3.select(this).attr('x'))-200, Math.floor(d3.select(this).attr('y')));
  }

  clicked(event, d) {
    if (event.defaultPrevented) return; // dragged

    d3.select(this).transition()
        .attr("stroke", "black")
      .transition()
      .attr("stroke", "")
  }

}

class Root {

  constructor(id, plant, x, y, a) {
    this.life = 70;

    this.id = id;
    this.plant = plant;
    this.x = x;
    this.y = y;
    this.initialAngle = a;

    // path info
    this.currentPos = {x:x,y:y};
    this.currentAngle = 0;
    this.nextPos = {x:x,y:y};
    this.wrapper = d3.select("#" + plant.id + " .roots").append("g")
                      .attr("class","root")
                      .attr("id", this.id);
    // text
    this.history = [];
  }

  update() {
    const noiseX = this.currentPos.x/SCALE_FACTOR + Math.random()*0.1;
    const noiseY = this.currentPos.y/SCALE_FACTOR + Math.random()*0.1;

    const angle = this.initialAngle ? (this.initialAngle + getRandomArbitrary(0.3, 0.5) * Math.PI) : noise.simplex2(noiseX, noiseY) * Math.PI + Math.PI/2;
    const dis = Math.random() * SCALE_FACTOR/5; // scale
    const deltaX = dis * Math.cos(angle);
    const deltaY = dis * Math.sin(angle);

    this.nextPos.x = this.currentPos.x + deltaX;
    this.nextPos.y = this.currentPos.y + deltaY;
    this.currentAngle = angle;
    this.initialAngle = undefined;
  }

  grow() {
    if (this.life > 0) {
      // do {
        this.update();
      // } while(!this.history.includes(this.currentPos))
      // const duplicate = this.history.includes(this.currentPos);

      this.wrapper.append("line")
        .style("stroke", STROKE_COLOR)
        .attr("x1", this.currentPos.x)
        .attr("y1", this.currentPos.y)
        .attr("x2", this.nextPos.x)
        .attr("y2", this.nextPos.y)
      this.history.push(this.currentPos);
      this.life --;
      checkIntersections(this);
      // update current with next after append
      this.currentPos.x = this.nextPos.x;
      this.currentPos.y = this.nextPos.y;
    }
  return {
    pos:this.currentPos,
    angle:this.currentAngle
  };
  }

}

class Plant{
  constructor(data){
    //Basic Plant info
    this.id = data.id;
    this.type = data.type;

    // Text Info
    this.word = data.seed;
    this.domain = data.domain;
    this.endWord;
    this.result = data.results ? data.results:[];
    this.resultToBeDisplayed = Array.from(this.result);

    // Visuals
    // Positions info
    this.x = data.x;
    this.y = data.y;
    this.currentP = {x:this.x,y:this.y};
    this.endPos;

    // d3 elements
    this.g;
    this.roots = [];
    this.totalAnimation = data.results ? this.calculateTime() : 0; // Is this still in use?

    // Visual Parameters
    this.growingSpeed = 1000;
    this.lifeSpan = 300;
    this.datamuseResultMax = 5;
    this.HEIGHT = 100;
    this.COMPOST_DISTANCE = 50;

    // Save it plants
    plants[this.id+""] = this;
  }

  updateResult(result) {
    this.result = result;
    this.resultToBeDisplayed = Array.from(result);
  }

  updateDomain(word) {
    if (this.domain != word) {
      this.domain = word;
      $('#'+this.id + " .chunk .domain").text(word);
    }
  }

  calculateHeight() {
    return this.word.length*13 + 10;
  }

  updateSeed(word) {
    if (this.word != word) {
      this.word = word;
      const seed = $('#'+this.id + " .chunk .seed");
      const h = word.length*13;
      seed.text(word)
       .attr("y", this.y - h + FONT_SIZE)
      this.HEIGHT = this.calculateHeight();
    }
  }

  clear() {
    this.lifeSpan += 200;
    this.currentP = {x:this.x,y:this.y};
    this.g.selectAll('.branch').remove();
  }

  getResult(callback){
     var params = {
      'word':this.word,
      'domain': this.domain,
      'type': this.type}

      var t = this;
      $('.message').html("...");

      plantServer(params, function(data){
        if(data == "error") {
          console.log("error");
          // $('.message').html("Oops, please try another seed.")
        } else {
          console.log(typeof data, data)
          if (typeof data == "object") callback(data)
          else {
            var json = JSON.parse(data);
            callback(json);
          }

       }
     });

  }

  getNewWord(callback) {
    let p = {'domain': this.domain,
            'max': this.datamuseResultMax}

    p = this.processSpecificParameters(p, this.word, this.result);
    if (p == false || p == undefined) {
      console.warn("[Invalid Parameters]");
      return false;
    }

    datamuse(p, this, function(data) {
      //console.log(data)
      let w = data.result[0].word;
      if(w == ".") {
        w = data.result[1].word;
      }
      data.plant.result.push(w);
      callback(w);
    })
  }

  calculateTime(){
    return START_DELAY + this.result.length * 500 + 1000;
  }

  growBranch(w, i) {

      var b = this.g.append("g")
             .attr("class","branch");
      var w = this.result[i],
          flag = "middle";

      if (w.charAt(0) == "|" || w.charAt(0) == "/") {
        w = w.replace(/./g, ' ') + w;
        b.style("transition-delay", START_DELAY +i*500 + "ms");
      } else if (w.charAt(w.length-1) == "\\") {
        w =  w + w.replace(/./g, ' ');
        b.style("transition-delay", START_DELAY +i*500 + "ms");
      } else if (w.indexOf("|") > 0) {
        b.style("transition-delay", START_DELAY +(i-0.5)*500 + "ms");
        var ws = w.split("|");

        if (i > 1) {
          var last = this.result[i-1];

          if (last.indexOf(ws[1]) >= 0 && last.indexOf("\\") > 0) flag = "end"
          else if (last.indexOf(ws[0]) >= 0 && last.indexOf("/") > 0) flag = "start"
          // console.log(w, flag, last, ws[1],last.indexOf(ws[1]), last.indexOf("\\"));
        }
        var mode = ws[1].length > ws[0].length;
        var longer = mode ? ws[1]:ws[0];
        var shorter =  mode ? ws[0]:ws[1];
        var space = longer.slice(0,longer.length-shorter.length+1).replace(/./g, ' ');
        // console.log(ws, mode, space.length);
        if (flag != "middle") {
          w =  w + " ";
        } else {
            w = mode ? space + ws[0] + "|" + ws[1] : ws[0] + "|" + ws[1] + space;
        }
      }

      // w = w.replace(/[\|\/\\]/g, ' ');

      b.append("text")
       .attr("x", this.currentP.x - FONT_SIZE*1/4)
       .attr("y", this.currentP.y - FONT_SIZE*1.5*i  - this.HEIGHT - FONT_SIZE)
       .attr("dy", ".35em")
       .attr("text-anchor", flag)
       .text(w)
       .attr("class","branch_text")

       if (flag == "end") this.currentP.x -= w.length*4
       else if (flag == "start") this.currentP.y += w.length*4

  }

  growRoots(timer) {
    for (let j = 0; j < this.roots.length; j++) {
      this.roots[j].grow();
      const current = this.roots[j].grow();
      if (Math.random() < 0.02 && this.roots.length < 10) {
        const newr = new Root(this.id +"_root_"+guid(), this.roots[0].plant, current.pos.x, current.pos.y, current.angle);
        newr.timer = timer;
        this.roots.push(newr);
      }
    }
  }

  grow() {
    //setTimeout
    let branchIdx = 0;
    const gs = this.growingSpeed;
    const self = this;

    function afterResult(data) {
      self.updateResult(data.results);
      self.endWord = data.endWord
      self.branchTimer = setInterval(() => {
          if (self.result.length > 0) {
            if (self.resultToBeDisplayed.length > 0) {
              const w = self.resultToBeDisplayed.pop();
              self.growBranch(w, branchIdx);
            } else {
              clearInterval(self.branchTimer);
              self.branchTimer = null;
              setTimeout(function(){
                if(self.next != null) self.reGenerate();
              }, 3000);
            }
          }
          branchIdx ++;
        }, gs);

      const rootTimer = setInterval(() => {
        if (self.lifeSpan <= 0) clearInterval(rootTimer);
        self.growRoots(rootTimer);
        self.lifeSpan --;
      }, Math.floor(gs/10));

    }

    this.getResult(afterResult);
  }

  initializeRoots() {
    const rWrapper = this.g.append("g")
           .attr("class","roots");
    //Initialize roots
    const r = new Root(this.id + "_root", this, this.x, this.y);
    this.roots.push(r);
  }


  draw() {
    var x = this.x, y = this.y;
    this.g = svg.append("g")
            .attr("class","plant seedling")
            .attr("id", this.id);

    var c = this.g.append("g")
           .attr("class","chunk");

    drawGround(x,y,c);
    drawDomain(this.domain,x,y,c);

    this.initializeRoots();
    // SEED
    var seed = drawSeed(this.word, x, y-10, c);
    // change height based on seed width
    this.HEIGHT = this.calculateHeight();
    // MAIN BRANCH
    drawMainBranch(x,y,x,y - this.HEIGHT, c);
  }

  animate() {
    if (ANIME) {
      var g = this.g;
    setTimeout(function(){g.classed("show", true);}, 100);
    }
  }

  compost(){
    const FALLING_TIME = 2000;
    const t = d3.transition()
    .duration(FALLING_TIME)
    .ease(d3.easeLinear);

    console.log("compost");
    this.lifeSpan += 200;
    this.currentP = {x:this.x,y:this.y};
    // (TODO: branches animation?)
    // all branch_text -> soil
    const self = this;
    let counter = 0;
    this.g.selectAll('.branch_text').each(function(d){
      d3.select(this).style("transform","");

      const w = d3.select(this).text().replace(/(\|\w+|\/|\\| |=)+/g, "");
      let x = d3.select(this).attr('x'),
            y =  parseFloat(d3.select(this).attr('y')) + self.COMPOST_DISTANCE;

      if (self.type == "bamboo" || "pine") {
        x = self.x;
        y = self.y + self.COMPOST_DISTANCE;
      }

      if(self.type == "ginkgo") x = x + counter*50;
      d3.select(this).transition(t).attr("x",x);
      d3.select(this).transition(t).attr("y",y);

      counter ++;

      setTimeout(function(){
        // create new soil words
        const s = new SoilWord(w, x, y, true);
        self.g.selectAll('.branch').remove();
      }, FALLING_TIME)
    })

    // remove outer branch layer

    // TODO: words falling animation
  }

  reGenerate(newSeed) {
    if(this.next == null) return;
    this.updateSeed(this.next);
    this.next = null;
    // if(newSeed) this.word = newSeed;
    if (isCompost) {
      this.compost();
      const self = this;
      setTimeout(function(){
        self.grow();
      }, COMPOST_TIME);
    } else{
      this.clear();
      this.grow();
    }
  }
}

class Ginkgo extends Plant {
  constructor(data) {
   super(data);
   this.WIDTH = 330;
   this.LENGTH = this.WIDTH/2;
   this.START_ANGLE = -160 + Math.floor(Math.random()*60);
   this.growingSpeed = 1000;
   this.lookFor = "nn";
   this.COMPOST_DISTANCE = 150;
  }

  updateBranch() {
    this.g.selectAll('.main_branch').attr("y2", this.y - this.HEIGHT);
    this.currentP.y -= this.HEIGHT;
  }

  calculateTime(){
    return START_DELAY + this.result.length * 500 + 1000;
  }

  calculateHeight() {
    return this.word.length*13 + 50;
  }

  clear() {
    super.clear();
    this.START_ANGLE = -160 + Math.floor(Math.random()*60);
  }

  reGenerate(newSeed) {
    super.reGenerate();
    this.updateBranch();
  }

  growBranch(w,i) {
      const x = this.x, y = this.currentP.y;
      var b = this.g.append("g")
             .style("transition-delay", START_DELAY +i*500 + "ms")
             .attr("class","branch");
      var angle = 15*i+this.START_ANGLE;

      // find the end point
      var endy = this.LENGTH * Math.sin(Math.radians(angle)) + y
      var endx = this.LENGTH * Math.cos(Math.radians(angle)) + x

      b.append("line")
        .style("stroke", STROKE_COLOR)
        .style("position", "absolute")
        .style("stroke-dasharray", DASH_STYLE)
        .attr("x1", x)
        .attr("y1", y)
        .attr("x2", endx)
        .attr("y2", endy)
        .attr("class","branch_line");

        b.append("text")
         .attr("x", x)
         .attr("y", y)
         .style("transform", "translate(5px) rotate("+ (angle) +"deg) ")
         .style("transform-origin", x + "px " + y + "px 0px")
         .attr("dy", ".35em")
         .text("            " + w )
         .attr("class","branch_text");

  }

  draw() {
      var x = this.x, y = this.y;
      this.g = svg.append("g")
             .attr("class","ginkgo seedling")
             .attr("id", this.id);

      var c = this.g.append("g")
             .attr("class","chunk");

    drawGround(x,y,c)
    // SEED
    var seed = drawSeed(this.word,x,y-20,c)
    this.HEIGHT = this.calculateHeight();
    drawMainBranch(x,y,x,y-this.HEIGHT, c);
    drawDomain(this.domain,x,y,c);
    this.initializeRoots();

    // BRANCHES
    this.currentP.y -= this.HEIGHT; //move to center
  }
}

class Pine extends Plant {
  constructor(data) {
   super(data);
   this.growingSpeed = 5000;
   this.lifeSpan = 300;
   this.WIDTH = 400;
   this.HEIGHT = 80;
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

  calculateTime(){
    return this.totalAnimation = START_DELAY + this.result.length * 1500 + 1000;
  }

  draw() {
    var x = this.x, y = this.y;
    this.g = svg.append("g")
           .attr("class","pine seedling")
           .attr("id", this.id);

    var c = this.g.append("g")
           .attr("class","chunk");

    this.initializeRoots();
    drawGround(x,y,c);
    drawSeed(this.seed,x,y,c,this.HEIGHT);
    drawMainBranch(x,y,x,y - this.HEIGHT, c);
    drawDomain(this.domain,x,y,c);
  }

  growBranch(word, idx) {
      var b = this.g.append("g")
             .style("transition-delay", 1500 + "ms")
             .attr("class","branch");

      b.append("text")
       .attr("x", this.x)
       .attr("y", this.y - FONT_SIZE*1.5*idx - this.HEIGHT)
       .attr("dy", ".35em")
       .attr("text-anchor", "middle")
       .text(word)
       .attr("class","branch_text");

  }

  // grow() {
  //   //setTimeout
  //   let branchIdx = 0;
  //   this.branchTimer = setInterval(() => {
  //     const self = this;
  //     let w;
  //     if (self.result > 15) clearInterval(this.branchTimer);
  //     self.getNewWord(function(w) {
  //       if (!w) clearInterval(this.branchTimer);
  //       self.growBranch(w, branchIdx);
  //       branchIdx ++;
  //     });
  //
  //   }, this.growingSpeed);
  //
  //
  //   const rootTimer = setInterval(() => {
  //     const self = this;
  //     if (self.lifeSpan <= 0) clearInterval(rootTimer);
  //     self.growRoots();
  //     self.lifeSpan --;
  //   }, Math.floor(this.growingSpeed/10));
  //
  // }


}

class Ivy extends Plant {
  constructor(data) {
   super(data);
   this.pointer = this.x;
   this.datamuseResultMax = 50;
   this.COMPOST_DISTANCE = 100;
   this.growingSpeed = 2000;
  }

  calculateTime(){
    return START_DELAY + this.result.length * 1000 + 1000;
  }

  updateResult(result) {
    this.result = result;
    this.resultToBeDisplayed = Array.from(result).reverse();;
  }

  getNewWord(callback) {
    let p = {'domain': this.domain,
            'max': this.datamuseResultMax}

    p = this.processSpecificParameters(p, this.word, this.result);
    if (p == false || p == undefined) {
      console.warn("[Invalid Parameters]");
      return false;
    }

    datamuse(p, this, function(data) {
      let w;
      do {
        w = data.result[Math.floor(Math.random()*data.result.length)].word;
      } while (data.plant.result.includes(w))
      data.plant.result.push(w);
      if (w == ".") return false;
      callback(w);
    })
  }

  growBranch(w, idx) {

       var b = this.g.append("g")
              .style("transition-delay", START_DELAY + idx * 1000 + "ms")
              .attr("class","branch");
       var v = idx % 2 == 0 ? -1 : 1;

       this.currentP.x += FONT_SIZE * w.length * 2/3;
       var ypos = this.y + (FONT_SIZE * v + Math.random() * 15) - FONT_SIZE * 3;

       b.append("text")
        .attr("x", this.currentP.x)
        .attr("y", ypos)
        .attr("dy", ".35em")
        .attr("text-anchor", "middle")
        .text(w)
        .attr("class","branch_text");

  }

  draw() {
    var x = this.x, y = this.y;
    this.g = svg.append("g")
           .attr("class","ivy seedling")
           .attr("id", this.id);

     var c = this.g.append("g")
            .attr("class","chunk");

     // special draw ground
     c.append("line")
       .style("stroke", STROKE_COLOR)
       .style("stroke-dasharray", DASH_STYLE)
       .attr("x1", x)
       .attr("y1", y)
       .attr("x2", x+GROUND_WIDTH)
       .attr("y2", y)
       .attr("class","ground");

    drawDomain(this.domain, x+100, y, c);
    this.initializeRoots();
    drawMainBranch(this.x+50, this.y+20, this.x, this.y + (FONT_SIZE + Math.random() * 15) - FONT_SIZE * 3, c);
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
   this.WIDTH = 400;
   this.LENGTH = this.WIDTH/3;
   this.growingSpeed = 500;
  }

  calculateTime(){
    return START_DELAY + this.result.length * 200 + 1000;
  }

  growBranch(w, i){
     var b = this.g.append("g")
            .style("transition-delay", START_DELAY +i*200 + "ms")
            .attr("class","branch");

     var angle = 180 + 18*i + Math.random();
     var local_Y = this.y - this.HEIGHT;
     var l = this.LENGTH + (i % 2 == 0 ?  -20 : 0);
     // find the end point
     var endy = l * Math.sin(Math.radians(angle)) + local_Y
     var endx = l * Math.cos(Math.radians(angle)) + this.x

     b.append("line")
       .style("stroke", STROKE_COLOR)
       .style("position", "absolute")
       .style("stroke-dasharray", DASH_STYLE)
       .attr("x1", this.x)
       .attr("y1", local_Y)
       .attr("x2", endx)
       .attr("y2", endy)
       .attr("class","branch_line");

       b.append("text")
        .attr("x", endx-20)
        .attr("y", endy-20)
        .style("transform", "translate(5px) rotate(" + (angle/5 - 60) +"deg) ")
        .style("transform-origin", this.x + "px " + local_Y + "px 0px")
        .attr("dy", ".35em")
        .text(w)
        // .attr("")
        .attr("class","branch_text");

      if (i == this.result.length -1) this.endPos = {
        "x":endx,
        "y":endy
      }

     //drawText

  }

  draw() {
    var x = this.x, y = this.y;
    var WIDTH = this.WIDTH, LENGTH = this.LENGTH;

     this.g = svg.append("g")
           .attr("class","dandelion seedling")
           .attr("id", this.id);
     var c = this.g.append("g")
            .attr("class","chunk");

     drawGround(x,y,c);

     this.initializeRoots();
     var seed = drawSeed(this.word,x,y,c);
     drawMainBranch(x,y,x,y - LENGTH, c);
     drawDomain(this.domain,x,y,c);

     this.currentP.y = this.y - 200;
  }
}

class Koru extends Plant {
  constructor(data) {
   super(data);
   this.totalLength = 13 + Math.floor(Math.random()*5);
   this.spiralWrapper;
  }

  calculateTime(){
    return this.totalAnimation = START_DELAY +  this.totalLength * 200 + 3000;
  }

  growBranch(w, i) {
      const b = this.spiralWrapper.append("tspan")
             .style("font-size", FONT_SIZE + i)
             .style("transition-delay", START_DELAY +i*200 + "ms")
             .text(w + " ")
  }

  draw() {
    var x = this.x, y = this.y;
    this.g = svg.append("g")
           .attr("class","koru seedling")
           .attr("id", this.id);

    var c = this.g.append("g")
           .attr("class","chunk");

    var w = getTextWidth(this.word);

     drawSeed(this.word, x,y,c)
     drawMainBranch(x,y,x,y - 60, c);

      var t = this.g.append("text")
       .attr("class", "koruResult")
       .attr("transform", "translate(" + (x - 100) +"," + (y - 250) +") scale(0.5)")

      this.spiralWrapper = t.append("textPath")
       .attr("xlink:href",'#Spiral');
  }
}

class Bamboo extends Plant {
  constructor(data) {
   super(data);
   this.growingSpeed = 3000;
  }

  calculateTime(){
    return this.totalAnimation = START_DELAY + this.result.length * 1000 + 1000;
  }

  updateResult(result) {
    this.result = result;
    this.resultToBeDisplayed = Array.from(result).reverse();;
  }

  growBranch(w, i) {

      const x = this.currentP.x, y = this.currentP.y;

      var b = this.g.append("g")
             .style("transition-delay", START_DELAY + i * 1000 + "ms")
             .attr("class","branch");
      var content = w + (i == 0 ? "" : "=");
      var h = getTextWidth(content, true);

      // if (i == 1) {
      //   setTimeout(function(){
      //     adjustView(x,y + window.innerHeight / 2);
      //   }, START_DELAY + (i + 1) * 1000)
      // }

      b.append("text")
       .attr("x", x)
       .attr("y", y)
       .attr("dy", ".35em")
       .attr("text-anchor", "end")
       .text(content)
       .attr("class","branch_text");

       this.currentP.y -= h;
  }

  draw() {
    var x = this.x, y = this.y;
    this.g = svg.append("g")
           .attr("class","bamboo seedling")
           .attr("id", this.id);

    var WIDTH = 500;

    var c = this.g.append("g")
           .attr("class","chunk");

    drawGround(x,y,c);
    drawDomain(this.domain, x, y, c)
    this.initializeRoots();

    var HEIGHT = getTextWidth(this.word, true);

    c.append("text")
     .attr("x", x - FONT_SIZE/2)
     .attr("y", y - 10)
     .style("writing-mode", "tb")
     .attr("text-anchor", "end")
     .attr("dy", ".35em")
     .text(this.word)
     .attr("class","seed");

   drawMainBranch(x,y,x,y - HEIGHT, c);

      this.currentP.x += 30;
      this.currentP.y -= 10;
  }
}

var PLANTS = {
"ginkgo":Ginkgo,
"plant":Plant,
//"koru":Koru,
"ivy":Ivy,
"bamboo":Bamboo,
"pine":Pine,
"dandelion":Dandelion
}

// Functions
function drawSeed(seed,x,y,g,h) {
  h = (h != undefined) ? h : seed.length*13;
  return g.append("text")
   .attr("x", x + FONT_SIZE/2)
   .attr("y", y - h + FONT_SIZE)
   .style("writing-mode", "tb")
   .attr("dy", ".35em")
   .text(seed)
   .attr("class","seed");
}

function drawDomain(domain,x,y,g) {
  g.append("text")
   .attr("x", x + FONT_SIZE/2)
   .attr("y", y + FONT_SIZE/2)
   .attr("dy", ".35em")
   .text(domain)
   .attr("class","domain");
}

function drawGround(x,y,g) {
  g.append("line")
    .style("stroke", STROKE_COLOR)
    .style("stroke-dasharray", DASH_STYLE)
    .attr("x1", x-GROUND_WIDTH/2)
    .attr("y1", y)
    .attr("x2", x+GROUND_WIDTH/2)
    .attr("y2", y)
    .attr("class","ground");
}

function drawMainBranch(x1,y1,x2,y2,g) {
   g.append("line")
    .style("stroke", STROKE_COLOR)
    .style("stroke-dasharray", DASH_STYLE)
    .attr("x1", x1)
    .attr("y1", y1)
    .attr("x2", x2)
    .attr("y2", y2)
    .attr("class","main_branch");
}

function getClosestSoilText(thisSoil) {
  let dmin=10000, closest;
  d3.selectAll(".soil.active").each(function() {
    if (d3.select(thisSoil).text() == d3.select(this).text()) {
      return true;
    }

    const d = getDistance(d3.select(thisSoil).attr('x'), d3.select(thisSoil).attr('y'), d3.select(this).attr('x'), d3.select(this).attr('y'));

    if (d < dmin) {
      dmin = d;
      closest = d3.select(this)
    }
  })
  return closest.text();
}

function getDistance(x1,y1,x2,y2){
  const a = x1 - x2;
  const b = y1 - y2;
  return Math.sqrt( a*a + b*b );
}
Math.radians = function(degrees) {
  return degrees * Math.PI / 180;
}
