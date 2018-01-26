/**/
var pos,vel,polarity,planets,avgXVel,bufferX,cameraPos;
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
  cameraPos = new p5.Vector(0,0);
  vel = new p5.Vector(-3,0);
  bufferX = 600;
  avgXVel = 0;
  avgYVel = 0;
  pos = new p5.Vector(0,0);
  polarity = true; // true -> positive --- false -> negative
  planets = [];
  //on-screen planets
  // planets.push(new Planet(Math.random()*1100+180,Math.random()*720,Math.random() < 0.5)); //test planet
  // planets.push(new Planet(Math.random()*1100+180,Math.random()*720,Math.random() < 0.5)); //test planet
  // planets.push(new Planet(Math.random()*1100+180,Math.random()*720,Math.random() < 0.5)); //test planet
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
  cameraPos.set(-pos.x + 640 - avgXVel*35,-pos.y + 360 - avgYVel*20);
  translate(cameraPos.x,cameraPos.y);
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

function drawWall() {
  fill(255,0,255);
  rect(0,pos.y-400,wallWidth+Math.random()*3,1280);
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
    planets.push(new Planet(pos.x + Math.random()*1100-180,pos.y + Math.random()*720-360, Math.random() < 0.5));
    bufferX = pos.x + 600
  }
  createPlanet();
  doPolarityPhys();
}

function Planet(x,y,pol) {
  this.pos = new p5.Vector(x,y);
  this.polarity = pol;
}

function planetIsOffscreen(planet) {
  return (planet.pos.x > width+300-cameraPos.x) || (planet.pos.x < -cameraPos.x-300) || (planet.pos.y > height+300-cameraPos.y) || (planet.pos.y < -cameraPos.y-300);
}

function createPlanet() {
  fill(0,255,0);
  let workingPoint = new p5.Vector();
  var working = true;
  if (vel.heading() < 0) {
    rect(-cameraPos.x,-cameraPos.y,width,100);
    workingPoint.y = -cameraPos.y-300;
    // up
  } else {
    rect(-cameraPos.x,-cameraPos.y+height-100,width,100);
    workingPoint.y = -cameraPos.y+height+300;
    // down
  }
  workingPoint.x = -cameraPos.x+Math.random()*width;
  for (i in planets) {
    if (planets[i].pos.dist(workingPoint) < 600) {
      working = false;
    }
  }
  if (working) {
    planets.push(new Planet(workingPoint.x,workingPoint.y,Math.random() < 0.5));
  }

  if (abs(vel.heading()) > Math.PI/2) {
    rect(-cameraPos.x,-cameraPos.y,100,height);

    workingPoint.x = -cameraPos.x - 300;

    // left
  } else {
    rect(-cameraPos.x+width-100,-cameraPos.y,100,height);

    workingPoint.x = -cameraPos.x + width + 300;
    // right
  }
  workingPoint.y = -cameraPos.y + Math.random()*height;
  working = true;
  for (i in planets) {
    if (planets[i].pos.dist(workingPoint) < 600) {
      working = false;
    }
  }
  if (working) {
    planets.push(new Planet(workingPoint.x,workingPoint.y,Math.random() < 0.5));
  }
}

function doPolarityPhys() {
  var planet;
  var i = planets.length;
  while (i--) {
    planet = planets[i]
    if (planetIsOffscreen(planet)) {
      if (Math.abs(p5.Vector.sub(planet.pos,pos).heading() - vel.heading()) > Math.PI/2) {
        planets.splice(i,1);
        continue;
      }
    }
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
