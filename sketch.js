/* p5 magnet game with willybh */
var pos, vel, polarity, planets, avgXVel, cameraPos, lastCreation, wallPos, fuel, scoreText, gameState, pointsDelay, distText, hpright;
const rad = 10;

function setup() {
  createCanvas(1280, 720);
  scoreText = document.getElementById("score");
  distText = document.getElementById("distance");
  hpright = document.getElementById("right-healthbar");
  strokeWeight(3);
  noStroke();
  restart();
  textSize(24);
}

function restart() {
  gameState = 0;
  cameraPos = new p5.Vector(0, 0);
  vel = new p5.Vector(3, 0);
  avgXVel = 0;
  avgYVel = 0;
  pos = new p5.Vector(0, 0);
  polarity = true; // true -> positive --- false -> negative
  planets = [];
  lastCreation = 0;
  wallPos = -500;
  fuel = 100;
  pointsDelay = 60;
  scoreText.innerHTML = "0";
  distText.innerHTML = "0";
}

function draw() {
  resetMatrix();
  background(0);
  noStroke();
  if (!gameState) {
    updatePhys();
    avgXVel += (vel.x - avgXVel) * 0.01;
    avgYVel += (vel.y - avgYVel) * 0.01;
    cameraPos.set(-pos.x + 640 - avgXVel * 35, -pos.y + 360 - avgYVel * 20);
    if (pos.x - wallPos < rad) {
      gameState = 1;
      textSize(50);
    }
  }
  translate(cameraPos.x, cameraPos.y);
  drawPlanets();
  drawMe();
  drawWall();
  // drawLines();
  doUI();
}

function doUI() {
  if (!gameState) {
    if (pointsDelay == 0) {
      scoreText.innerHTML = int(scoreText.innerHTML) + 100;
      pointsDelay = 60;
    } else {
      pointsDelay--;
    }
    if (fuel < 30) {
      fill(255,sin(frameCount/50)*70);
      rect(-cameraPos.x,-cameraPos.y,width,height);
    }
    distText.innerHTML = int((pos.x - wallPos)/100);
    hpright.style.top = 720 - fuel * 7.2 + "px";
    hpright.style.height = fuel * 7.2 + "px";
  } else {
    fill(255);
    text("YOU LOST", -cameraPos.x + width/2 - 50, -cameraPos.y + height/2 - 20);
  }
}

function drawLines() {
  for (i in planets) {
    strokeWeight(planets[i].pull / (planets[i].pos.dist(pos) * 0.2) ** 2 * 100);
    stroke(polarity == planets[i].polarity ? "#f0f" : "#6f3"); //push : pull
    line(pos.x,pos.y,planets[i].pos.x,planets[i].pos.y);
  }
}

function drawWall() {
  fill(255,0,255);
  rect(-cameraPos.x, -cameraPos.y, max(0,wallPos+cameraPos.x), height);
  wallPos += 3;
}

function drawMe() {
  stroke(polarity ? (fuel == 0 ? "#007" : "#00f") : (fuel == 0 ? "#700" : "#f00"));
  strokeWeight(2);
  fill(255);
  ellipse(pos.x, pos.y, rad * 2 - 1); //player
  noStroke();
}

function drawPlanets() {
  for (i in planets) {
    let planet = planets[i];
    fill(planet.polarity ? "#008" : "#800"); //mag field
    ellipse(planet.pos.x, planet.pos.y, planet.magRad * 2);
    if (planet.station) {
      fill(planet.polarity ? "#ccf" : "#fcc");
    } else {fill(planet.polarity ? "#00f" : "#f00");} //planet
    ellipse(planet.pos.x, planet.pos.y, planet.rad * 2);
  }
}

function updatePhys() {
  pos.add(vel);
  if (frameCount - lastCreation > 120/vel.mag()) {createPlanet(); lastCreation = frameCount; if(fuel != 0) fuel--;}
  doPolarityPhys();
}

function Planet(x, y, pol, rad) {
  this.pos = new p5.Vector(x, y);
  this.polarity = pol;
  this.station = Math.random() < 0.2;
  this.rad = rad;
  this.pull = this.rad**2/50;
  this.magRad = this.rad*3;
}

function planetIsOffscreen(planet) {
  return (planet.pos.x > width + planet.magRad - cameraPos.x) || (planet.pos.x < -cameraPos.x - planet.magRad) || (planet.pos.y > height + planet.magRad - cameraPos.y) || (planet.pos.y < -cameraPos.y - planet.magRad);
}

function createPlanet() {
  fill(0, 255, 0);
  let workingPoint = new p5.Vector();
  let workingRad = Math.random()*100+20;
  var working = true;

  if (vel.heading() < 0) { workingPoint.y = -cameraPos.y - workingRad*3; }  // up
  else { workingPoint.y = -cameraPos.y + height + workingRad*3; } //down

  workingPoint.x = -cameraPos.x + Math.random() * width;
  for (i in planets) {
    if (planets[i].pos.dist(workingPoint) < Math.random()*300 + planets[i].magRad+200) {
      working = false;
    }
  }
  if (working) {
    planets.push(new Planet(workingPoint.x, workingPoint.y, Math.random() < 0.5, workingRad));
  }

  if (abs(vel.heading()) > Math.PI / 2) { workingPoint.x = -cameraPos.x - workingRad*3; } //left
  else { workingPoint.x = -cameraPos.x + width + workingRad*3; } //right

  workingPoint.y = -cameraPos.y + Math.random() * height;
  working = true;
  for (i in planets) {
    if (planets[i].pos.dist(workingPoint) < Math.random()*300 + planets[i].magRad+200) {
      working = false;
    }
  }
  if (working) {
    planets.push(new Planet(workingPoint.x, workingPoint.y, Math.random() < 0.5, workingRad));
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
          continue;
        }
      }
    }
    let dis = planet.pos.dist(pos);
    if (dis < planet.rad + rad) {
      let vecFromPlanet = p5.Vector.sub(planet.pos, pos).normalize();
      pos.set(p5.Vector.mult(vecFromPlanet, -planet.rad - rad).add(planet.pos));
      vel.sub(p5.Vector.mult(vecFromPlanet, vel.dot(vecFromPlanet) * 1.5));
    } else if (fuel != 0) {
      if (polarity == planet.polarity) { //repel
        vel.add(p5.Vector.sub(planet.pos, pos).normalize().mult(-planet.pull / (dis * 0.2) ** 2));
      } else { //attract
        vel.add(p5.Vector.sub(planet.pos, pos).normalize().mult(planet.pull / (dis * 0.2) ** 2));
      }
    }
    if (planet.station && dis < planet.magRad + rad) {
      if (fuel != 100) {
        fuel++;
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
