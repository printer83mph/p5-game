/* p5 magnet game with willybh */
var pos, vel, polarity, planets, avgXVel, cameraPos, lastCreation;
const rad = 10;
const planetRad = 70;
const magFieldRad = 400;

function setup() {
  createCanvas(1280, 720);
  strokeWeight(3);
  noStroke();
  restart();
}

function restart() {
  cameraPos = new p5.Vector(0, 0);
  vel = new p5.Vector(3, 0);
  avgXVel = 0;
  avgYVel = 0;
  pos = new p5.Vector(0, 0);
  polarity = true; // true -> positive --- false -> negative
  planets = [];
  lastCreation = 0;
}

function draw() {
  resetMatrix();
  cameraPos.set(-pos.x + 640 - avgXVel * 35, -pos.y + 360 - avgYVel * 20);
  translate(cameraPos.x, cameraPos.y);
  background(0);
  updatePhys();
  avgXVel += (vel.x - avgXVel) * 0.01;
  avgYVel += (vel.y - avgYVel) * 0.01;
  drawPlanets();
  drawMe();
}

function drawWall() {
  fill(255, 0, 255);
  rect(0, pos.y - 400, wallWidth + Math.random() * 3, 1280);
}

function drawMe() {
  stroke(polarity ? "#00f" : "#f00");
  fill(255);
  ellipse(pos.x, pos.y, rad * 2); //player
  noStroke();
}

function drawPlanets() {
  for (i in planets) {
    let planet = planets[i];
    fill(planet.polarity ? "#008" : "#800"); //mag field
    ellipse(planet.pos.x, planet.pos.y, magFieldRad);
  }
  for (i in planets) {
    let planet = planets[i];
    fill(planet.polarity ? "#00f" : "#f00"); //planet
    ellipse(planet.pos.x, planet.pos.y, planetRad * 2);
  }
}

function updatePhys() {
  pos.add(vel);
  if (frameCount - lastCreation > 120/vel.mag()) {createPlanet(); lastCreation = frameCount}
  doPolarityPhys();
}

function Planet(x, y, pol) {
  this.pos = new p5.Vector(x, y);
  this.polarity = pol;
}

function planetIsOffscreen(planet) {
  return (planet.pos.x > width + 300 - cameraPos.x) || (planet.pos.x < -cameraPos.x - 300) || (planet.pos.y > height + 300 - cameraPos.y) || (planet.pos.y < -cameraPos.y - 300);
}

function createPlanet() {
  fill(0, 255, 0);
  let workingPoint = new p5.Vector();
  var working = true;

  if (vel.heading() < 0) {
    // rect(-cameraPos.x, -cameraPos.y, width, 100);
    workingPoint.y = -cameraPos.y - 300;
    // up
  } else {
    // rect(-cameraPos.x, -cameraPos.y + height - 100, width, 100);
    workingPoint.y = -cameraPos.y + height + 300;
    // down
  }
  workingPoint.x = -cameraPos.x + Math.random() * width;
  for (i in planets) {
    if (planets[i].pos.dist(workingPoint) < Math.random()*300 + 400) {
      working = false;
    }
  }
  if (working) {
    planets.push(new Planet(workingPoint.x, workingPoint.y, Math.random() < 0.5));
  }

  if (abs(vel.heading()) > Math.PI / 2) {
    // rect(-cameraPos.x, -cameraPos.y, 100, height);
    workingPoint.x = -cameraPos.x - 300;
    // left
  }

  else {
    // rect(-cameraPos.x + width - 100, -cameraPos.y, 100, height);
    workingPoint.x = -cameraPos.x + width + 300;
    // right
  }
  workingPoint.y = -cameraPos.y + Math.random() * height;
  working = true;
  for (i in planets) {
    if (planets[i].pos.dist(workingPoint) < Math.random()*300 + 400) {
      working = false;
    }
  }
  if (working) {
    planets.push(new Planet(workingPoint.x, workingPoint.y, Math.random() < 0.5));
  }
}

function doPolarityPhys() {
  var planet;
  var i = planets.length;
  var despawnLogic = frameCount == lastCreation;
  while (i--) {
    planet = planets[i]
    if (despawnLogic) {
      if (planetIsOffscreen(planet)) {
        if (Math.abs(p5.Vector.sub(planet.pos, pos).heading() - vel.heading()) > Math.PI / 2) {
          planets.splice(i, 1);
          console.log("Deleted planet");
          continue;
        }
      }
    }
    let dis = planet.pos.dist(pos);
    if (dis < planetRad + rad) {
      let vecFromPlanet = p5.Vector.sub(planet.pos, pos).normalize();
      pos.set(p5.Vector.mult(vecFromPlanet, -planetRad - rad).add(planet.pos));
      // let velAngle = vel.heading();
      vel.sub(p5.Vector.mult(vecFromPlanet, vel.dot(vecFromPlanet) * 1.5));
    } else {
      if (polarity == planet.polarity) { //repel
        vel.add(p5.Vector.sub(planet.pos, pos).normalize().mult(-100 / (dis * 0.2) ** 2));
      } else { //attract
        vel.add(p5.Vector.sub(planet.pos, pos).normalize().mult(100 / (dis * 0.2) ** 2));
      }
    }
  }
}

function keyPressed() {
  if (key == 'R') {
    restart();
  } else if (key == " ") {
    polarity = !polarity;
  }
}
