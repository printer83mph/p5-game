/**/
var vel = new p5.Vector(0,0);
var pos = new p5.Vector(150,400);
var rad = 25;
var polarity = true;
var planets = [];

function setup() {
  createCanvas(1280,720);
  noStroke();
  planets.push({x:100,y:100,polarity:true});
}

function draw() {
  updatePhys();

  background(0);
  ellipse(pos.x,pos.y,rad*2,rad*2);
  for (i in planets) {
    ellipse(planets[i].x,planets[i].y,rad*2,rad*2);
  }
}

function updatePhys() {
  doPolarityPhys();
  moveMe();
}

function moveMe() {
  pos.add(vel);

}

function doPolarityPhys() {
  for (i in planets) {
    let dis = Math.sqrt((planets[i].x-pos.x**2) + (planets[i].y-pos.x)**2);
    if (dis < 100) {
      if (dis < rad*2) {
        
      } else {

      }
    }
  }
}
