/**/
var vel = new p5.Vector(3,0);
var pos = new p5.Vector(150,400);
const rad = 10;
const planetRad = 20;
const magFieldRad = 400;
var polarity = true;    //true -> positive --- false -> negative
var planets = [];

function setup() {
  createCanvas(1280,720);
  strokeWeight(10);
  noStroke();
  planets.push(new Planet(Math.random()*1100+180,Math.random()*720,Math.random() < 0.5)); //test planet
}

function draw() {
  background(0);

  updatePhys();
  drawPlanets();
  drawMe();
}

function drawMe() {
  stroke(polarity ? "#00f" : "#f00");
  fill(255);
  ellipse(pos.x,pos.y,rad*2,rad*2); //player
  noStroke();
}

function drawPlanets() {
  for (i in planets) {
    let planet = planets[i];
    fill(planet.polarity ? "rgba(3, 0, 224, 0.8)" : "rgba(224, 0, 0, 0.8)"); //mag field
    ellipse(planet.pos.x,planet.pos.y,magFieldRad,magFieldRad);
    fill(planet.polarity ? "#00f" : "#f00"); //planet
    ellipse(planet.pos.x,planet.pos.y,planetRad*2,planetRad*2);
  }
}

function updatePhys() {
  doPolarityPhys();
  moveMe();
}

function moveMe() {
  pos.add(vel);
}

function Planet(x,y,pol) {
  this.pos = new p5.Vector(x,y);
  this.polarity = pol;
}

function returnClosestPoint(P1,P2,var v) {
  return P1 + ( (P2.sub(P1)) * dot)

}

function doPolarityPhys() {
  var planet;
  for (i in planets) {
    planet = planets[i]
    let dis = planet.pos.dist(pos);
    if (dis < magFieldRad/2 + rad) {
      if (dis < planetRad + rad) {
        let angleToPlayer = p5.Vector.sub(planet.pos,pos).heading();
        
      } else {
        if (polarity == planet.polarity) { //repel
          vel.add(p5.Vector.sub(planet.pos,pos).normalize().mult(-10/dis));
        } else { //attract
          vel.add(p5.Vector.sub(planet.pos,pos).normalize().mult(10/dis));
          vel.mult(0.99);
        }
      }
    }
  }
}
