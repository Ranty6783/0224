// 水泡類別
class Bubble {
  constructor() {
    this.x = random(width);
    this.y = height + random(20, 100);
    this.r = random(15, 35);
    this.alpha = 180;
    this.speed = random(1, 2.5);
    this.broken = false;
    this.breakFrame = 0;
    this.maxBreakFrame = 15;
  }
  update() {
    if (!this.broken) {
      this.y -= this.speed;
      if (this.y < random(80, 200)) {
        this.broken = true;
        this.breakFrame = 0;
      }
    } else {
      this.breakFrame++;
    }
  }
  draw() {
    noStroke();
    if (!this.broken) {
      fill(255, 80);
      ellipse(this.x, this.y, this.r * 2);
      // 反光效果：左上角小圓
      fill(255, 180);
      ellipse(this.x - this.r * 0.5, this.y - this.r * 0.5, this.r * 0.5);
    } else {
      // 破掉動畫：畫出放射狀線條
      stroke(255, this.alpha);
      strokeWeight(2);
      noFill();
      let n = 8;
      let baseR = this.r;
      let len = map(this.breakFrame, 0, this.maxBreakFrame, 0, baseR * 1.5);
      for (let i = 0; i < n; i++) {
        let angle = TWO_PI * i / n;
        let x1 = this.x + cos(angle) * baseR;
        let y1 = this.y + sin(angle) * baseR;
        let x2 = this.x + cos(angle) * (baseR + len);
        let y2 = this.y + sin(angle) * (baseR + len);
        line(x1, y1, x2, y2);
      }
      noStroke();
    }
  }
  isDead() {
    return this.broken && this.breakFrame > this.maxBreakFrame;
  }
}

let bubbles = [];
// 全域變數定義
let shapes = [];
let song;
let amplitude;

// 外部定義的二維陣列，魚形多邊形的頂點座標，保持不變以確保形狀一致
let points = [[-3, 5], [3, 7], [1, 5],[2,4],[4,3],[5,2],[6,2],[8,4],[8,-1],[6,0],[0,-3],[2,-6],[-2,-3],[-4,-2],[-5,-1],[-6,1],[-6,2]];
function preload() {
  // 目的：在程式開始前預載入外部音樂資源
  song = loadSound('midnight-quirk-255361.mp3');
}

function setup() {
  // 目的：初始化畫布、音樂播放狀態與生成多邊形物件
  createCanvas(windowWidth, windowHeight);

  // 讓音樂循環播放
  // 注意：瀏覽器通常需要使用者互動（點擊）後才能播放聲音，可透過 mousePressed 觸發
  song.loop();

  // 初始化振幅分析器
  amplitude = new p5.Amplitude();

  // 使用 for 迴圈產生 10 個形狀物件
  for (let i = 0; i < 10; i++) {
    // 只記錄位置、顏色、速度，不再變形 points
    shapes.push({
      x: random(width),             // 初始 X 座標
      y: random(height),            // 初始 Y 座標
      dx: random(-3, 3),            // X 軸水平移動速度
      dy: random(-3, 3),            // Y 軸垂直移動速度
      color: color(random(255), random(255), random(255)), // 隨機顏色
      size: random(30, 80)          // 每個 shape 的基礎大小
    });
  }
}

function draw() {
  // 設定背景顏色
  background('#ffcdb2');
  strokeWeight(2);

  // 產生水泡（每幾幀產生一個）
  if (frameCount % 15 === 0) {
    bubbles.push(new Bubble());
  }
  // 更新與繪製水泡
  for (let i = bubbles.length - 1; i >= 0; i--) {
    bubbles[i].update();
    bubbles[i].draw();
    if (bubbles[i].isDead()) {
      bubbles.splice(i, 1);
    }
  }

  // 取得當前音量大小 (0 到 1) 並映射為縮放倍率 (0.5 到 2)
  let level = amplitude.getLevel();
  let sizeFactor = map(level, 0, 1, 0.5, 2);

  // 走訪並繪製每個形狀
  for (let shape of shapes) {
    // 位置更新
    shape.x += shape.dx;
    shape.y += shape.dy;

    // 邊緣反彈檢查
    if (shape.x < 0 || shape.x > width) shape.dx *= -1;
    if (shape.y < 0 || shape.y > height) shape.dy *= -1;

    // 設定外觀與繪製
    fill(shape.color);
    stroke(shape.color);

    push();
    translate(shape.x, shape.y);
    // 先縮小一半，再根據音量縮放
    let scaleFactor = shape.size * sizeFactor * 0.5;
    // dx > 0 向右移動，水平翻轉（向右看）；dx < 0 向左移動，正常（向左看）
    if (shape.dx > 0) {
      scale(-scaleFactor, -scaleFactor); // 水平翻轉+上下顛倒
    } else {
      scale(scaleFactor, -scaleFactor);  // 僅上下顛倒
    }
    beginShape();
    for (let p of points) {
      vertex(p[0], p[1]);
    }
    endShape(CLOSE);
    pop();
  }
}

// 額外功能：點擊滑鼠切換播放/暫停 (解決瀏覽器自動播放限制)
function mousePressed() {
  if (song.isPlaying()) {
    song.pause();
  } else {
    song.loop();
  }
}

// 額外功能：視窗大小改變時調整畫布
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}