size(450, 450);

background(255, 255, 255);

fill(0);
text("(0, 0)", 0, 25);
text("X", width/2, 13);
text("Y", 0, height/2);

strokeWeight(2);
stroke(255, 50, 50);
line(30, 0, 30, height);
line(0, 30, width, 30);

strokeWeight(1);
stroke(0);
for (int i = 50; i < width; i = i + 20) {
  line(i, 30, i, height);
  line(30, i, width, i);
}

for (int i = 0; i <= 20; i++) {
  textAlign(CENTER, BASELINE);
  text(i, 40 + (i * 20), 25);
  textAlign(RIGHT, BASELINE);
  text(i, 25, 45 + (i * 20));
}
