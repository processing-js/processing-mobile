/* @pjs preload="eames.jpg"; */

PImage img;

int smallPoint = 2;
int largePoint;
int top, left;

void setup() {
  size(200, 200);
  img = loadImage("eames.jpg");
  noStroke();
  background(255);
  smooth();
  largePoint = min(width, height) / 10;
  // center the image on the screen
  left = (width - img.width) / 2;
  top = (height - img.height) / 2;
}

void draw() {
  float pointillize = map(random(img.width), 0, width, smallPoint, largePoint);
  int x = int(random(img.width));
  int y = int(random(img.height));
  color pix = img.get(x, y);
  fill(pix, 128);
  ellipse(left + x, top + y, pointillize, pointillize);
}
