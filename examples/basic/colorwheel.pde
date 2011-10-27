int segs = 12;
int steps = 6;
float rotAdjust = TWO_PI / segs / 2;
float radius;
float segWidth;
float interval = TWO_PI / segs;

void setup() {
  size(200, 200);
  background(127);
  smooth();
  ellipseMode(RADIUS);
  noStroke();
  // make the diameter 90% of the sketch area
  radius = min(width, height) * 0.45;
  segWidth = radius / steps;

  drawShadeWheel();
}

void drawShadeWheel() {
  for (int j = 0; j < steps; j++) {
    color[] cols = {
      color(255-(255/steps)*j, 255-(255/steps)*j, 0),
      color(255-(255/steps)*j, (255/1.5)-((255/1.5)/steps)*j, 0),
      color(255-(255/steps)*j, (255/2)-((255/2)/steps)*j, 0),
      color(255-(255/steps)*j, (255/2.5)-((255/2.5)/steps)*j, 0),
      color(255-(255/steps)*j, 0, 0),
      color(255-(255/steps)*j, 0, (255/2)-((255/2)/steps)*j),
      color(255-(255/steps)*j, 0, 255-(255/steps)*j),
      color((255/2)-((255/2)/steps)*j, 0, 255-(255/steps)*j),
      color(0, 0, 255-(255/steps)*j),
      color(0, 255-(255/steps)*j, (255/2.5)-((255/2.5)/steps)*j),
      color(0, 255-(255/steps)*j, 0),
      color((255/2)-((255/2)/steps)*j, 255-(255/steps)*j, 0)
    };
    for (int i = 0; i < segs; i++) {
      fill(cols[i]);
      arc(width/2, height/2, radius, radius,
          interval*i+rotAdjust, interval*(i+1)+rotAdjust);
    }
    radius -= segWidth;
  }
}
