/* p5 magnet game with willybh */
var pos, vel, polarity, planets, avgXVel, cameraPos, lastCreation, wallPos, fuel, scoreText, gameState, pointsDelay, distText;
const rad = 10;
const planetRad = 70;
const magFieldRad = 200;

function setup() {
  createCanvas(1280, 720);
  scoreText = document.getElementById("score");
  distText = document.getElementById("distance");
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
  if (!gameState) {
    updatePhys();
    avgXVel += (vel.x - avgXVel) * 0.01;
    avgYVel += (vel.y - avgYVel) * 0.01;
    cameraPos.set(Math.floor(-pos.x + 640 - avgXVel * 35), Math.floor(-pos.y + 360 - avgYVel * 20));
    if (pos.x - wallPos < rad) {
      gameState = 1;
      textSize(50);
    }
  }
  translate(cameraPos.x, cameraPos.y);
  drawPlanets();
  drawMe();
  drawWall();
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
    fill(255);
    rect(Math.floor(pos.x - 55), Math.floor(pos.y - 55), 110, 20);
    fill(0);
    rect(Math.floor(pos.x - fuel/2),Math.floor(pos.y - 50), fuel , 10);
    distText.innerHTML = int((pos.x - wallPos)/10);
  } else {
    fill(255);
    text("YOU LOSE", -cameraPos.x + width/2, -cameraPos.y + height/2);
  }
}

function drawWall() {
  fill(255,0,255);
  rect(-cameraPos.x, -cameraPos.y, max(0,wallPos+cameraPos.x), height);
  wallPos += 3;
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
    ellipse(planet.pos.x, planet.pos.y, magFieldRad * 2);
    if (planet.station) {
      fill(planet.polarity ? "#ccf" : "#fcc");
    } else {fill(planet.polarity ? "#00f" : "#f00");} //planet
    ellipse(planet.pos.x, planet.pos.y, planetRad * 2);
  }
}

function updatePhys() {
  pos.add(vel);
  if (frameCount - lastCreation > 120/vel.mag()) {createPlanet(); lastCreation = frameCount; if(fuel != 0) fuel--;}
  doPolarityPhys();
}

function Planet(x, y, pol) {
  this.pos = new p5.Vector(x, y);
  this.polarity = pol;
  this.station = Math.random() < 0.2;
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
        vel.add(p5.Vector.sub(planet.pos, pos).normalize().mult(-100 / (dis * 0.2) ** 2)); //chjange these 100s
      } else { //attract
        vel.add(p5.Vector.sub(planet.pos, pos).normalize().mult(100 / (dis * 0.2) ** 2)); //same
      }
    }
    if (planet.station && dis < magFieldRad + rad) {
      if (fuel != 100) {
        fuel++;
      }
    }
  }
}

function keyPressed() {
  if (key == 'R') {
    restart();
  } else if (key == " " && fuel != 0) {
    polarity = !polarity;
  }
}
