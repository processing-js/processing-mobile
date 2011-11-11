void setup() {
  size(500, 500);
  noLoop();
  clearScreen();
}

void clearScreen() {
  background(204);
  textSize(68);
  textAlign(CENTER, CENTER);
  text("Select an image\nbelow or drag\nand drop an\nimage on\nthe sketch", width/2, height/2);
}

void drawImage(Image orig) {
  background(255);
  PImage pi = new PImage(orig);
  image(pi);
}
