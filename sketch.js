/**/
var pos,vel,polarity,planets,avgXVel,bufferX;
const rad = 10;
const planetRad = 70;
const magFieldRad = 400;



function setup() {
  createCanvas(1280,720);
  strokeWeight(3);
  noStroke();
  restart();
}

function restart() {
  vel = new p5.Vector(3,0);
  bufferX = 600;
  avgXVel = 0;
  avgYVel = 0;
  pos = new p5.Vector(150,400);
  polarity = true; // true -> positive --- false -> negative
  planets = [];
  //on-screen planets
  planets.push(new Planet(Math.random()*1100+180,Math.random()*720,Math.random() < 0.5)); //test planet
  planets.push(new Planet(Math.random()*1100+180,Math.random()*720,Math.random() < 0.5)); //test planet
  planets.push(new Planet(Math.random()*1100+180,Math.random()*720,Math.random() < 0.5)); //test planet
  //off screen planets
  // for (var i = 0; i < 400; i++) {
  // 	addOffScreenPlanet();
  // }
}

function draw() {

  // if (frameCount > lastAddition + 180) {
  //
  // }

  resetMatrix();
  translate(-pos.x + 640 - avgXVel*35,-pos.y + 360 - avgYVel*20);
  background(0);
  updatePhys();
  avgXVel += (vel.x - avgXVel)*0.01;
  avgYVel += (vel.y - avgYVel)*0.01;
  drawPlanets();
  drawMe();

}

// function addOffScreenPlanet() { //thomas hlep
// 	var x = 0;
// 	var y = 0;
//
// 	while (x >= 0-magFieldRad && x <= 1280+magFieldRad ) {
// 		x = Math.random()*2000;
// 		x += x*-2*round(Math.random());
// 	console.log("x defined as "+x);
// 	}
// 	while (y >= 0-magFieldRad && y <= 720+magFieldRad ) {
// 		y = Math.random()*1500;
// 		y += y*-2*round(Math.random());
// 	console.log("y defined as "+y);
// 	}
// 	planets.push(new Planet(x,y,Math.random() < -0.5));
// 	console.log("planet pushed.")
// }

function drawMe() {
  stroke(polarity ? "#00f" : "#f00");
  fill(255);
  ellipse(pos.x,pos.y,rad*2,rad*2); //player
  noStroke();
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
  if (pos.x > bufferX) {
    planets.push(new Planet(pos.x + Math.random()*1100+180,pos.y + Math.random()*720, Math.random() < 0.5));
    bufferX = pos.x + 600
  }
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
    if (dis < planetRad + rad) {
      let vecFromPlanet = p5.Vector.sub(planet.pos,pos).normalize();
      pos.set(p5.Vector.mult(vecFromPlanet,-planetRad-rad).add(planet.pos));
      // let velAngle = vel.heading();
      vel.sub(p5.Vector.mult(vecFromPlanet,vel.dot(vecFromPlanet)*1.5));
    } else {
      if (polarity == planet.polarity) { //repel
        vel.add(p5.Vector.sub(planet.pos,pos).normalize().mult(-100/(dis*0.2)**2));
      } else { //attract
        vel.add(p5.Vector.sub(planet.pos,pos).normalize().mult(100/(dis*0.2)**2));
      }
    }
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
