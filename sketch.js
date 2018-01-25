/**/
var pos,vel,polarity,planets,avgXVel;
const rad = 10;
const planetRad = 50;
const magFieldRad = 400;
// true -> positive --- false -> negative


function setup() {
  createCanvas(1280,720);
  strokeWeight(3);
  noStroke();
  restart();
}

function restart() {
  vel = new p5.Vector(3,0);
  avgXVel = 0;
  avgYVel = 0;
  pos = new p5.Vector(150,400);
  polarity = true;
  planets = [];
  planets.push(new Planet(Math.random()*1100+180,Math.random()*720,Math.random() < 0.5)); //test planet
  planets.push(new Planet(Math.random()*1100+180,Math.random()*720,Math.random() < 0.5)); //test planet
  planets.push(new Planet(Math.random()*1100+180,Math.random()*720,Math.random() < 0.5)); //test planet
}

function draw() {
  resetMatrix();
  translate(-pos.x + 640 - avgXVel*30,-pos.y + 360 - avgYVel*30);
  background(0);
  updatePhys();
  avgXVel += (vel.x - avgXVel)*0.01;
  avgYVel += (vel.y - avgYVel)*0.01;
  drawPlanets();
  drawMe();

}

function drawMe() {
  stroke(polarity ? "#00f" : "#f00");
  fill(255);
  ellipse(pos.x,pos.y,rad*2,rad*2); //player
  noStroke();
}

function drawMagFields() {

}

function drawPlanets() {
  for (i in planets) {
    let planet = planets[i];
    fill(planet.polarity ? "rgba(0,0,255,0.4)" : "rgba(255,0,0,0.4)"); //mag field
    ellipse(planet.pos.x,planet.pos.y,magFieldRad,magFieldRad);
  }
  for (i in planets) {
    let planet = planets[i];
    fill(planet.polarity ? "#00f" : "#f00"); //planet
    ellipse(planet.pos.x,planet.pos.y,planetRad*2,planetRad*2);
  }
}

function updatePhys() {
  pos.add(vel);
  doPolarityPhys();
}

function Planet(x,y,pol) {
  this.pos = new p5.Vector(x,y);
  this.polarity = pol;
}

function doPolarityPhys() {
  var planet;
  for (i in planets) {
    planet = planets[i]
    let dis = planet.pos.dist(pos);
    // if (dis < magFieldRad/2 + rad) {
      if (dis < planetRad + rad) {
        let vecFromPlanet = p5.Vector.sub(planet.pos,pos).normalize();
        pos.set(p5.Vector.mult(vecFromPlanet,-planetRad-rad).add(planet.pos));
        // let velAngle = vel.heading();
        vel.sub(p5.Vector.mult(vecFromPlanet,vel.dot(vecFromPlanet)*1.5));
      } else {
        if (polarity == planet.polarity) { //repel
          vel.add(p5.Vector.sub(planet.pos,pos).normalize().mult(-1000/dis**2));
        } else { //attract
          vel.add(p5.Vector.sub(planet.pos,pos).normalize().mult(1000/dis**2));
        }
      }
    // }
  }
}

// function checkCollisions() {
//   if (pos.x > width - rad) {
//     pos.x = width - rad;
//     vel.x *= -0.9;
//   } else if (pos.x < rad) {
//     pos.x = rad;
//     vel.x *= -0.9;
//   } if (pos.y > height - rad) {
//     pos.y = height - rad;
//     vel.y *= -0.9;
//   } else if (pos.y < rad) {
//     pos.y = rad;
//     vel.y *= -0.9;
//   }
// }

function mousePressed() {
  polarity = !polarity;
}

function keyPressed() {
  if (key == 'R') {
    restart();
  }
}
