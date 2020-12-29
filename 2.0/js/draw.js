// noise
noise.seed(Math.random());
const SCALE_FACTOR = 20;
const STROKE_COLOR = "grey";
$(document).ready(function() {

// function dragstarted() {
//   d3.select(this).attr("stroke", "red");
// }
//
// function dragged(event, d) {
//   console.log(event, d);
//   d3.select(this).raise().attr("cx", d.x = event.x).attr("cy", d.y = event.y);
// }
//
// function dragended() {
//   d3.select(this).attr("stroke", STROKE_COLOR);
// }

var dragEvent = d3.drag().on("drag", function(d) {
    d3.select(this).attr("x", d.x-10).attr("y", d.y+5);
    // TODO: update soilWord object, d3 drag, how to pass variable
  });

function dragged(plant, d){
  console.log(plant, d)
  d3.select(this).attr("x", d.x-10).attr("y", d.y+5);
}

class soilWord {
  constructor(text, x, y, active) {
    this.x = x;
    this.y = y;
    this.text = text;
    this.id = guid();
    const tmp = d3.select("#soil").append("text")
                  .attr("class","soil")
                  .style("fill-opacity", active ? 1: 0.5)
                  .attr("id", this.id)
                  .text(this.text)
                  .attr("x", this.x)
                  .attr("y", this.y)
                  // .call(dragEvent)
                  .on("drag",dragged(this))
                  .on("click", this.clicked);
    this.boundingBox = document.getElementById(this.id).getBBox();
    if (active) soil.push(this);
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
    this.x = x;
    this.y = y;
    this.initialAngle = a;
    this.id = id;
    this.plant = plant;
    this.life = 70;

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
    this.id = data.id;
    this.type = data.type;
    this.word = data.seed;
    this.domain = data.domain;
    this.x = data.x;
    this.y = data.y;
    this.currentP = {x:this.x,y:this.y};

    this.endPos;
    this.endWord;

    this.result = data.results ? data.results:[];
    this.resultToBeDisplayed = Array.from(this.result);

    this.g;
    this.totalAnimation =   data.results ? this.calculateTime() : 0;
    this.roots = [];
    this.growingSpeed = 1000;
    this.lifeSpan = 300;

    this.datamuseResultMax = 5;
    this.HEIGHT = 100;
    // save it to all plants
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
          console.log(data)
          var json = JSON.parse(data);
          callback(json);
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
      console.log(data)
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

    function  afterResult(data) {
      self.updateResult(data.results);
      self.endWord = data.endWord
      self.branchTimer = setInterval(() => {
          if (self.result.length > 0) {
            if(self.resultToBeDisplayed.length > 0) {
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
    c.append("line")                 // attach a line
      .style("stroke", STROKE_COLOR)         // colour the line
      .style("stroke-dasharray", DASH_STYLE)  // stroke-linecap type
      .attr("x1", x)     // x position of the first end of the line
      .attr("y1", y)      // y position of the first end of the line
      .attr("x2", x)     // x position of the second end of the line
      .attr("y2", y - this.HEIGHT)    // y position of the second end of the line
      .attr("class","main_branch");
  }

  animate() {
    if (ANIME) {
      var g = this.g;
    setTimeout(function(){g.classed("show", true);}, 100);
    }
  }

  reGenerate(newSeed) {
    if(this.next == null) return;
    this.updateSeed(this.next);
    this.next = null;
    // if(newSeed) this.word = newSeed;

    this.clear();
    this.draw();
    this.grow();
  }
}

class Ginkgo extends Plant {
  constructor(data) {
   super(data);
   this.WIDTH = 330;
   this.LENGTH = this.WIDTH/2;
   this.START_ANGLE = -160 + Math.floor(Math.random()*60);
   this.growingSpeed = 800;
   this.lookFor = "nn";
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

  growBranch(w,i) {
      const x = this.x, y = this.currentP.y;
      var b = this.g.append("g")
             .style("transition-delay", START_DELAY +i*500 + "ms")
             .attr("class","branch");
      var angle = 15*i+this.START_ANGLE;

      // find the end point
      var endy = this.LENGTH * Math.sin(Math.radians(angle)) + y
      var endx = this.LENGTH * Math.cos(Math.radians(angle)) + x

      b.append("line")                 // attach a line
        .style("stroke", STROKE_COLOR)
        .style("position", "absolute")         // colour the line
        .style("stroke-dasharray", DASH_STYLE)  // stroke-linecap type
        .attr("x1", x)     // x position of the first end of the line
        .attr("y1", y)      // y position of the first end of the line
        .attr("x2", endx)     // x position of the second end of the line
        .attr("y2", endy)     // y position of the second end of the line
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
    // console.log(seed)
    // MAIN BRANCH
    c.append("line")                 // attach a line
      .style("stroke", STROKE_COLOR)         // colour the line
      .style("stroke-dasharray", DASH_STYLE)  // stroke-linecap type
      .attr("x1", x)     // x position of the first end of the line
      .attr("y1", y)      // y position of the first end of the line
      .attr("x2", x)     // x position of the second end of the line
      .attr("y2", y - this.HEIGHT)    // y position of the second end of the line
      .attr("class","main_branch");

    drawDomain(this.domain,x,y,c);
    this.initializeRoots();

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

      // SEED
      var seed = c.append("text")
       .attr("x", x + FONT_SIZE/2)
       .attr("y", y - this.HEIGHT + FONT_SIZE)
       .style("writing-mode", "tb")
       .attr("dy", ".35em")
       .text(this.word)
       .attr("class","seed");

       // MAIN BRANCH
       c.append("line")                 // attach a line
         .style("stroke", STROKE_COLOR)         // colour the line
         .style("stroke-dasharray", DASH_STYLE)  // stroke-linecap type
         .attr("x1", x)     // x position of the first end of the line
         .attr("y1", y)      // y position of the first end of the line
         .attr("x2", x)     // x position of the second end of the line
         .attr("y2", y-this.HEIGHT)    // y position of the second end of the line
         .attr("class","main_branch");

  // DOMAIN
      c.append("text")
       .attr("x", x + FONT_SIZE/2)
       .attr("y", y + FONT_SIZE/2)
       .attr("dy", ".35em")
       .text(this.domain)
       .attr("class","domain");
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

     c.append("line")
       .style("stroke", STROKE_COLOR)         // colour the line
       .style("stroke-dasharray", DASH_STYLE)  // stroke-linecap type
       .attr("x1", x)     // x position of the first end of the line
       .attr("y1", y)      // y position of the first end of the line
       .attr("x2", x+GROUND_WIDTH)     // x position of the second end of the line
       .attr("y2", y)    // y position of the second end of the line
       .attr("class","ground");

    drawDomain(this.domain, x+100, y, c);
    this.initializeRoots();

    drawIvyStart(this.x+50, this.y+20, this.x, this.y + (FONT_SIZE + Math.random() * 15) - FONT_SIZE * 3);

       function drawIvyStart(x1,y1,x2,y2,) {
         c.append("line")                 // attach a line
           .style("stroke", STROKE_COLOR)         // colour the line
           .style("stroke-dasharray", DASH_STYLE)  // stroke-linecap type
           .attr("x1", x1)     // x position of the first end of the line
           .attr("y1", y1)      // y position of the first end of the line
           .attr("x2", x2)     // x position of the second end of the line
           .attr("y2", y2)    // y position of the second end of the line
           .attr("class","main_branch");

       } // MAIN BRANCH

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
   this.LENGTH = this.WIDTH/3
  }
  calculateTime(){
    return START_DELAY + this.result.length * 200 + 1000;
  }
  growBranch(w, i){

     var b = this.g.append("g")
            .style("transition-delay", START_DELAY +i*200 + "ms")
            .attr("class","branch");

     var angle = 18*i + Math.random();
     // console.log(angle)
     var l = this.LENGTH + (i % 2 == 0 ?  -20 : 0);

     // find the end point
     var endy = l * Math.sin(Math.radians(angle)) + this.y
     var endx = l * Math.cos(Math.radians(angle)) + this.x

     b.append("line")                 // attach a line
       .style("stroke", STROKE_COLOR)
       .style("position", "absolute")         // colour the line
       .style("stroke-dasharray", DASH_STYLE)  // stroke-linecap type
       .attr("x1", this.x)     // x position of the first end of the line
       .attr("y1", this.y)      // y position of the first end of the line
       .attr("x2", endx)     // x position of the second end of the line
       .attr("y2", endy)     // y position of the second end of the line
       .attr("class","branch_line");

       b.append("text")
        .attr("x", endx-20)
        .attr("y", endy-20)
        .style("transform", "translate(5px) rotate("+ (angle/3) +"deg) ")
        .style("transform-origin", this.x + "px " + this.y + "px 0px")
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
      // MAIN BRANCH
      c.append("line")                 // attach a line
        .style("stroke", STROKE_COLOR)         // colour the line
        .style("stroke-dasharray", DASH_STYLE)  // stroke-linecap type
        .attr("x1", x)     // x position of the first end of the line
        .attr("y1", y)      // y position of the first end of the line
        .attr("x2", x)     // x position of the second end of the line
        .attr("y2", y-LENGTH)    // y position of the second end of the line
        .attr("class","main_branch");

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

       // MAIN BRANCH
       c.append("line")                 // attach a line
         .attr("x1", x)     // x position of the first end of the line
         .attr("y1", y)      // y position of the first end of the line
         .attr("x2", x)     // x position of the second end of the line
         .attr("y2", y - w - 60)    // y position of the second end of the line
         .attr("class","main_branch");


      var t = this.g.append("text")
       .attr("class", "koruResult")
       .attr("transform", "translate(" + (x - 100) +"," + (y - w - 250) +") scale(0.5)")

      this.spiralWrapper = t.append("textPath")
       .attr("xlink:href",'#Spiral');


  }
}

class Bamboo extends Plant {
  constructor(data) {
   super(data);
  }

  calculateTime(){
    return this.totalAnimation = START_DELAY + this.result.length * 1000 + 1000;
  }

  growBranch(w, i) {

      const x = this.currentP.x, y = this.currentP.y;

      var b = this.g.append("g")
             .style("transition-delay", START_DELAY + i * 1000 + "ms")
             .attr("class","branch");
      var content = w + (i == 0 ? "" : "=");
      var h = getTextWidth(content, true);

      if (i == 1) {
        setTimeout(function(){
          adjustView(x,y + window.innerHeight / 2);
        }, START_DELAY + (i + 1) * 1000)
      }

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

       // MAIN BRANCH
       c.append("line")                 // attach a line
         .attr("x1", x)     // x position of the first end of the line
         .attr("y1", y)      // y position of the first end of the line
         .attr("x2", x)     // x position of the second end of the line
         .attr("y2", y - HEIGHT)    // y position of the second end of the line
         .attr("class","main_branch");

      this.currentP.x += 30;
      this.currentP.y -= 10;
  }
}

var PLANTS = {
"ginkgo":Ginkgo,
"plant":Plant,
// "koru":Koru,
"ivy":Ivy,
// "bamboo":Bamboo,
// "pine":Pine,
// "dandelion":Dandelion
}

// *****************************//
Math.radians = function(degrees) {
  return degrees * Math.PI / 180;
};

var FONT_SIZE = 14,
    DASH_STYLE = FONT_SIZE/2 + ", " + FONT_SIZE/2,
    SECTION_GAP = 50, // between two plants
    GROUND_WIDTH = 200,
    START_DELAY = 500, // chunk - branch
    ANIME = true,
    LEFT_MARGIN = 200;

// ************** Generate the diagram  *****************

var margin = {top: 20, right: 50, bottom: 20, left: 50},
    width = window.innerWidth + LEFT_MARGIN*2,
    height = 1100;

let timeOutTracker = null;
// var diagonal = d3.svg.diagonal()
//  .projection(function(d) { return [d.y, d.x]; });

const svg = d3.select(".content").append("svg")
.attr("width", window.innerWidth)
.attr("height", height)
.append("g")
.attr("transform", "translate(" + margin.left + "," + 0 + ")")
.attr("class","wrapper");

const soilSVG = svg.append("g")
                   .attr("id","soil")
                   
let plants = {};//global data
let edges = {};
let soil = [];

initializeSoil();
adjustView(700);
plant("soap",'sea', randomPlant(), getRandomArbitrary(200, 240), 700)
plant("humanity",'technology', randomPlant(), getRandomArbitrary(350, 400), 650, 15000)
// plant("distance",'anatomy', "pine", 600, 530, 20000)
plant("body",'literature', randomPlant(), getRandomArbitrary(900, 1000), 710, 30000)
/**********************************/

function checkIntersections(r){
  const rootId = r.id,
        x = r.currentPos.x, y = r.currentPos.y,
        x1 = r.nextPos.x, y1 = r.nextPos.y;
  // id - "_root" = plant id
  const plantId = rootId.split("_")[0];
  for (var i = 0; i < soil.length; i++) {
    let b = soil[i].boundingBox;
    const collid = lineRect(x,y,x1,y1,b.x,b.y,b.width,b.height);
    if (collid) {
      const newW = soil[i].text;
      const pos = RiTa.pos(newW)[0];
      if (r.plant.lookFor && pos.indexOf(r.plant.lookFor) < 0) {
        console.log("The word is not what the plant looks for.", newW, pos);
        return;
      }
      const plant = plants["" + plantId];
      plant.updateDomain(RiTa.stem(newW), RiTa.LANCASTER);
      clearInterval(r.timer);
      if (r.plant.branchTimer == null && r.plant.next != null) {
        r.plant.reGenerate();
      } else {
        r.plant.next = r.plant.endWord;
      }

    }
  }
  return false;
}

function lineRect(x1, y1, x2, y2, rx, ry, rw, rh) {
  // Modified from: http://www.jeffreythompson.org/collision-detection/line-rect.php

  function lineLine(x1, y1, x2, y2, x3, y3, x4, y4) {

    // calculate the direction of the lines
    const uA = ((x4-x3)*(y1-y3) - (y4-y3)*(x1-x3)) / ((y4-y3)*(x2-x1) - (x4-x3)*(y2-y1));
    const uB = ((x2-x1)*(y1-y3) - (y2-y1)*(x1-x3)) / ((y4-y3)*(x2-x1) - (x4-x3)*(y2-y1));

    // if uA and uB are between 0-1, lines are colliding
    if (uA >= 0 && uA <= 1 && uB >= 0 && uB <= 1) {
      // const intersectionX = x1 + (uA * (x2-x1));
      // const intersectionY = y1 + (uA * (y2-y1));
      return true;
    }
    return false;
  }
  // check if the line has hit any of the rectangle's sides
  // uses the Line/Line function below
  const left =   lineLine(x1,y1,x2,y2, rx,ry,rx, ry+rh);
  const right =  lineLine(x1,y1,x2,y2, rx+rw,ry, rx+rw,ry+rh);
  const top =    lineLine(x1,y1,x2,y2, rx,ry, rx+rw,ry);
  const bottom = lineLine(x1,y1,x2,y2, rx,ry+rh, rx+rw,ry+rh);

  // if ANY of the above are true, the line
  // has hit the rectangle
  if (left || right || top || bottom) {
    return true;
  }
  return false;
}

function initializeSoil() {
  const stopWords = ['i','me','my','myself','we','our','ours','ourselves','you','your','yours','yourself','yourselves','he','him','his','himself','she','her','hers','herself','it','its','itself','they','them','their','theirs','themselves','what','which','who','whom','this','that','these','those','am','is','are','was','were','be','been','being','have','has','had','having','do','does','did','doing','a','an','the','and','but','if','or','because','as','until','while','of','at','by','for','with','about','against','between','into','through','during','before','after','above','below','to','from','up','down','in','out','on','off','over','under','again','further','then','once','here','there','when','where','why','how','all','any','both','each','few','more','most','other','some','such','no','nor','not','only','own','same','so','than','too','very','s','t','can','will','just','don','should','now'];

  const punctuations = [",", ".",":","'","?","!","“","”"];

  let xPos = LEFT_MARGIN+50, yPos = 800;

  jQuery.get('text.txt', function(data) {
    const allContexts = data.split("--");
    const soil = allContexts[Math.floor(Math.random()*allContexts.length)];
    const words = RiTa.tokenize(soil);
    for (let w of words) {
      const t = new soilWord(w, xPos, yPos, !(stopWords.includes(w) || punctuations.includes(w)));
      xPos += (t.boundingBox.width + Math.random()*10 + 15);
      const rightEdge = window.innerWidth - 100 > LEFT_MARGIN + 1100 ? LEFT_MARGIN + 1100 : window.innerWidth-100;
      if (xPos > rightEdge) {
        yPos += 30;
        xPos = LEFT_MARGIN+50;
      }
    }
  })


}

function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}

function generateSequenceFromData(data) {
    var id = 0;

    function f(id){
      var p = PLANTS[data.plants[id].type];
      var plant = new p(data.plants[id]);
      adjustView(plant.y, id==0);
      plant.draw();
      plant.grow();
      plant.animate();

      lastAnimationTime = plant.totalAnimation;
      if (id <= Object.keys(data.plants).length -2) {
        id += 1;
        timeoutTracker = setTimeout(function(){
          f(id);
        }, lastAnimationTime);
      }
    }

    if(id==0) f(id);

}

function guid() {
  // https://slavik.meltser.info/the-efficient-way-to-create-guid-uuid-in-javascript-with-explanation/
    function _random_letter() {
        return String.fromCharCode(97+Math.floor(Math.random() * 26));
    }
    function _p8(s) {
        var p = (Math.random().toString(16)+"000000000").substr(2,8);
        return s ? "-" + p.substr(0,4) + "-" + p.substr(4,4) : _random_letter() + p.substr(0, 7);
    }
    return _p8() + _p8(true) + _p8(true) + _p8();
}

function plant(word, domain, p, x, y, delay=0) {
  var data = {
    "id": guid(),
    "type":p,
    "seed": word,
    "domain":domain,
    "x":x+ LEFT_MARGIN,
    "y":y,
  };

  setTimeout(function(){
    var plant = new PLANTS[p](data);
    plant.draw();
    plant.grow();
    plant.animate();
  }, delay)


}

function generateSequence(word, domain, x, y){
  var id = 0;
  var LIMIT = 5;
  var lastEndPos, lastWord;

  function f(id){
    var p = randomPlant();
    // var p = "plant";
    var data = {
      "id": id,
      "type":p,
      "seed": lastWord ? lastWord : word,
      "domain":domain,
      "x": lastEndPos ? lastEndPos.x + Math.random()*400 - 200 : width/2,
      "y": lastEndPos ? lastEndPos.y - 200 :height-20,
    }
    var plant = new PLANTS[p](data);
    plant.getResult(function() {
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
        setTimeout(function(){
          f(id);
        }, lastAnimationTime);
      }
    })
  }

  if(id==0) f(id);
}

function anime(g) {
  if (ANIME) {
  setTimeout(function(){g.classed("show", true);}, 100);
  }
}

function drawSeed(seed,x,y,g) {
  var h = seed.length*13;
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
  g.append("line")                 // attach a line
    .style("stroke", STROKE_COLOR)         // colour the line
    .style("stroke-dasharray", DASH_STYLE)  // stroke-linecap type
    .attr("x1", x-GROUND_WIDTH/2)     // x position of the first end of the line
    .attr("y1", y)      // y position of the first end of the line
    .attr("x2", x+GROUND_WIDTH/2)     // x position of the second end of the line
    .attr("y2", y)    // y position of the second end of the line
    .attr("class","ground");
}

function randomPlant() {
    var keys = Object.keys(PLANTS);
    return keys[ keys.length * Math.random() << 0];
};

function getTextWidth(text, isVertical) {
  var test = isVertical ? document.getElementById("verticalTest") : document.getElementById("Test");
  test.innerHTML = text;
  return isVertical ? test.clientHeight : test.clientWidth;
}

function clearCanvas() {
   clearTimeout(timeoutTracker);
   console.log("clear canvas")
   d3.selectAll("svg g.seedling").remove();
   lastEndPos = null;
   lastWord = "";

}
function adjustView(y, now){
  y =  y - window.innerHeight + 200;
  console.log("VIEW:",y, now);
  $('html,body').animate({
         scrollTop: y +"px"
     }, now ? 500 : 3000);
}

function getUrlVars()
{
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for(var i = 0; i < hashes.length; i++)
    {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
}

$('#run').click(function(){
  console.log("click")
    //Some code
});

$( "form" ).on( "submit", function( event ) {
  event.preventDefault();
  var word = $( this ).serializeArray()[0].value;
  var domain= $( this ).serializeArray()[1].value;
  if (word.length > 0 && domain.length > 1){
    clearCanvas();
    generateSequence(word, domain);
  } else {
    $('.message').html("Invalid seed")
  }

  console.log("Plant:"+ word +" in "+ domain);

});

});
