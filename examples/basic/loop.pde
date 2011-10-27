float y = 100;
boolean doLoop = false;

void setup() {
  size(450, 450);
  stroke(255);
  noLoop();
}

void draw() {
  background(0);
  line(0, y, width, y);

  y = y - 1;
  if (y < 0) {
    y = height;
  }
}

void mousePressed() {
  if (doLoop) {
    noLoop();
  } else {
    loop();
  }
  doLoop = !doLoop;
}
