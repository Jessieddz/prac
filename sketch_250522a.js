let serial;
let serialOptions = { baudRate: 115200 };
let isConnected = false;
let msg = "Not connected";
let pulseRate = 70;

let pieces = [];
let flowers = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont('monospace');
  textSize(24);

  serial = new Serial();
  serial.on(SerialEvents.CONNECTION_OPENED, onSerialConnectionOpened);
  serial.on(SerialEvents.CONNECTION_CLOSED, onSerialConnectionClosed);
  serial.on(SerialEvents.DATA_RECEIVED, onSerialDataReceived);
  serial.on(SerialEvents.ERROR_OCCURRED, onSerialErrorOccurred);
}

function draw() {
  background(0);
  drawClock();

  
  let spawnRate = 60;
  if (pulseRate > 100) {
    spawnRate = 30;
  } else if (pulseRate < 60) {
    spawnRate = 90;
  }

  if (frameCount % spawnRate === 0) {
    pieces.push(new FallingPiece(pulseRate));
  }

  for (let piece of pieces) {
    if (!piece.landed) {
      piece.update();
      
      if (piece.y + piece.size / 2 >= height) {
        piece.y = height - piece.size / 2;
        piece.landed = true;
        if (random() < 0.2) {
          flowers.push(new Flower(piece.x, piece.y));
        }
      } else {
        for (let other of pieces) {
          if (other !== piece && other.landed) {
            let dx = abs(piece.x - other.x);
            let dy = (piece.y + piece.size / 2) - (other.y - other.size / 2);
            if (dx < piece.size && dy >= 0 && dy < piece.speed) {
              if ((piece.size - dx) / piece.size >= 0.8) {
                piece.y = other.y - piece.size;
                piece.landed = true;
                if (random() < 0.2) {
                  flowers.push(new Flower(piece.x, piece.y));
                }
                break;
              } else {
                piece.x += random([-1, 1]) * 5;
              }
            }
          }
        }
      }
    }
    piece.display();
  }

  for (let flower of flowers) {
    flower.display();
  }

  fill(255);
  textAlign(LEFT);
  text(`Heart Rate: ${int(pulseRate)} bpm`, 20, 30);
  text(msg, 20, height - 20);
}

function drawClock() {
  let h = nf(hour(), 2);
  let m = nf(minute(), 2);
  let s = nf(second(), 2);
  fill(255, 204, 0);
  textAlign(CENTER);
  textSize(48);
  text(`${h}:${m}:${s}`, width / 2, 60);
}

function mouseClicked() {
  if (!isConnected) {
    isConnected = connectPort();
  }
}

async function connectPort() {
  if (!serial.isOpen()) {
    await serial.connectAndOpen(null, serialOptions);
  } else {
    serial.autoConnectAndOpenPreviouslyApprovedPort(serialOptions);
    return true;
  }
}

// Serial events
function onSerialDataReceived(eventSender, newData) {
  let val = int(newData);
  if (!isNaN(val)) {
    pulseRate = val;
    msg = "Received: " + val;
  }
}

function onSerialConnectionOpened(eventSender) {
  msg = " Connected!";
}

function onSerialConnectionClosed(eventSender) {
  msg = " Connection Closed!";
}

function onSerialErrorOccurred(eventSender, error) {
  console.log("Serial Error:", error);
  msg = "Serial Error!";
}

// --- Classes ---
class FallingPiece {
  constructor(rate) {
    this.x = random(width);
    this.y = 0;
    this.size = 80 + random(5);
    this.angle = random(TWO_PI);
    this.landed = false;

    if (rate < 60) {
      this.speed = 1 + random(1);
      this.color = color(0, 255, 120);
    } else if (rate <= 100) {
      this.speed = 3 + random(2);
      this.color = color(100, 180, 255);
    } else {
      this.speed = 6 + random(2);
      this.color = color(255, 80, 80);
    }
  }

  update() {
    if (!this.landed) {
      this.y += this.speed;
      this.x += random(-0.5, 0.5);
    }
  }

  display() {
    push();
    translate(this.x, this.y);
    rotate(this.angle);
    fill(this.color);
    noStroke();
    rectMode(CENTER);
    rect(0, 0, this.size * 2, this.size / 2);
    pop();
  }
}

class Flower {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.petalColor = color(random(220, 255), random(120, 200), random(150, 255));
  }

  display() {
    push();
    translate(this.x, this.y);
    noStroke();
    fill(this.petalColor);
    for (let i = 0; i < 6; i++) {
      ellipse(10, 0, 36, 18);
      rotate(PI / 3);
    }
    fill(255, 204, 0);
    ellipse(0, 0, 10, 10);
    pop();
  }
}
