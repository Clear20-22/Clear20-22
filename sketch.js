let stars = [];
let particles = [];
const STAR_COUNT = 180;
const PARTICLE_COUNT = 90;
let t = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);

  for (let i = 0; i < STAR_COUNT; i++) {
    stars.push({
      x: random(width),
      y: random(height),
      z: random(0.2, 1.2),
      tw: random(TWO_PI)
    });
  }

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push(new FlowParticle(random(width), random(height)));
  }

  noStroke();
}

function draw() {
  drawGradientBackground();
  drawNebulaGlow();
  drawStars();
  drawWaveField();
  drawFlowParticles();
  drawMouseAura();
  t += 0.008;
}

function drawGradientBackground() {
  for (let y = 0; y < height; y += 2) {
    const amt = y / height;
    const c = lerpColor(color("#0d1117"), color("#111a2d"), amt);
    stroke(c);
    line(0, y, width, y);
  }
  noStroke();
}

function drawNebulaGlow() {
  blendMode(ADD);
  fill(70, 130, 255, 22);
  ellipse(width * 0.25 + sin(t * 0.9) * 60, height * 0.35, 380, 280);
  fill(255, 90, 200, 18);
  ellipse(width * 0.72 + cos(t * 1.1) * 50, height * 0.6, 420, 300);
  fill(90, 255, 210, 16);
  ellipse(width * 0.52 + sin(t * 1.3) * 40, height * 0.45, 500, 260);
  blendMode(BLEND);
}

function drawStars() {
  for (const s of stars) {
    const twinkle = map(sin(t * 2.5 + s.tw), -1, 1, 80, 255);
    fill(150, 200, 255, twinkle * s.z);
    circle(s.x, s.y, 1.5 * s.z + 0.4);

    s.x += 0.05 * s.z;
    if (s.x > width + 5) {
      s.x = -5;
      s.y = random(height);
    }
  }
}

function drawWaveField() {
  noFill();
  for (let j = 0; j < 8; j++) {
    const yBase = map(j, 0, 7, height * 0.2, height * 0.9);
    const hueShift = map(j, 0, 7, 140, 255);
    stroke(80, hueShift, 255, 70);
    strokeWeight(1.2);

    beginShape();
    for (let x = 0; x <= width; x += 14) {
      const n = noise(x * 0.0025, j * 0.2, t * 0.7);
      const wave = sin(x * 0.01 + t * 2 + j) * 18;
      const y = yBase + map(n, 0, 1, -45, 45) + wave;
      vertex(x, y);
    }
    endShape();
  }
  noStroke();
}

function drawFlowParticles() {
  for (const p of particles) {
    p.update();
    p.render();
  }
}

function drawMouseAura() {
  const d = dist(mouseX, mouseY, width / 2, height / 2);
  const r = map(d, 0, width * 0.8, 140, 60, true);
  noFill();
  stroke(88, 166, 255, 90);
  strokeWeight(1.5);
  circle(mouseX, mouseY, r);
  noStroke();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

class FlowParticle {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.vel = p5.Vector.random2D().mult(random(0.3, 1.2));
    this.size = random(1.5, 3.8);
    this.alpha = random(120, 220);
  }

  update() {
    const angle = noise(this.pos.x * 0.002, this.pos.y * 0.002, t) * TWO_PI * 2.0;
    const flow = p5.Vector.fromAngle(angle).mult(0.08);
    this.vel.add(flow).limit(1.8);

    // mouse attraction
    const m = createVector(mouseX, mouseY);
    const dir = p5.Vector.sub(m, this.pos);
    const distSq = constrain(dir.magSq(), 1200, 60000);
    dir.setMag(120 / distSq);
    this.vel.add(dir);

    this.pos.add(this.vel);
    this.edges();
  }

  edges() {
    if (this.pos.x < -10) this.pos.x = width + 10;
    if (this.pos.x > width + 10) this.pos.x = -10;
    if (this.pos.y < -10) this.pos.y = height + 10;
    if (this.pos.y > height + 10) this.pos.y = -10;
  }

  render() {
    fill(120, 200, 255, this.alpha);
    circle(this.pos.x, this.pos.y, this.size);

    fill(255, 255, 255, this.alpha * 0.25);
    circle(this.pos.x + 0.8, this.pos.y + 0.8, this.size * 0.45);
  }
}
