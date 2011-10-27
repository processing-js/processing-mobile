float x, y;
float boxsize = 40.0;

void setup()
{
  size(200,200);
  noStroke();
  frameRate(30);
}

void draw()
{
  background(102);

  x = x + 0.8;

  if (x > width + boxsize) {
    x = -boxsize;
  }

  translate(x, height/2-boxsize/2);
  fill(255);
  rect(-boxsize/2, -boxsize/2, boxsize, boxsize);

  // Transforms accumulate.
  // Notice how this rect moves twice
  // as fast as the other, but it has
  // the same parameter for the x-axis value
  translate(x, boxsize);
  fill(0);
  rect(-boxsize/2, -boxsize/2, boxsize, boxsize);
}

