float angle;
float jitter;

void setup() {
  size(200, 200);
  smooth();
  noStroke();
  fill(255);
  rectMode(CENTER);
  frameRate(30);
}

void draw() {
  background(102);

  // during even-numbered seconds (0, 2, 4, 6...)
  if (second() % 2 == 0) {
    jitter = random(-0.1, 0.1);
  }
  angle = angle + jitter;
  float c = cos(angle);
  translate(width/2, height/2);
  rotate(c);
  rect(0, 0, 115, 115);
}

