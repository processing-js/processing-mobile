void setup() {
  size(450, 450);
  background(51);
  noStroke();
  smooth();
  noLoop();
}

void draw() {
  drawTarget(250, 250, 400, 10);
  drawTarget(152, 16, 200, 3);
  drawTarget(100, 144, 180, 5);
}

void drawTarget(int xloc, int yloc, int size, int num) {
  float grayvalues = 255/num;
  float steps = size/num;
  for (int i = 0; i < num; i++) {
    fill(i*grayvalues);
    ellipse(xloc, yloc, size-i*steps, size-i*steps);
  }
}
