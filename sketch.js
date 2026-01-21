// ============================
// 設定値
// ============================

// ターゲットまでのチェックポイント
const route = [ //{lat: 37.525229, lon: 138.914889} // テスト
  { lat: 37.525151, lon: 138.914931 }, // P1スタート
  { lat: 37.525057, lon: 138.914556 }, // P2右折
  { lat: 37.525968, lon: 138.914143 }, // P3左折、手前を右折
  { lat: 37.526117, lon: 138.913971 }, // P4直進
  { lat: 37.527302, lon: 138.913971 }, // P5左折
  { lat: 37.527255, lon: 138.912279 }, // P6右折
  { lat: 37.528537, lon: 138.911158 }, // P7信号左折
  { lat: 37.527792, lon: 138.909859 }, // P8右折
  { lat: 37.527808, lon: 138.909402 }, // P9右折
  { lat: 37.529404, lon: 138.909367 }, // P10左折
  { lat: 37.529540, lon: 138.909088 }, // P11直進
  { lat: 37.529757, lon: 138.908874 }, // P12左折
  { lat: 37.529012, lon: 138.907511 }  // P13ゴール
];

let font;
let cam;
let current = { lat: null, lon: null };
let heading = 0;
let pitch = 0;
let test = 0;
let pitchClamped = 0;

let uiType = "A";

let targetIndex = 0;
let targetPoint = route[targetIndex];

let history = [];

let nav_finished = false;

// ログ
let startTime;
let logs = [];
let error = 0;

function preload() {
  font = loadFont("assets/static/NotoSansJP-Regular.ttf");
}

// ============================
// 初期化
// ============================

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  textFont(font);

  // カメラ取得（ARの核）
  cam = createCapture({
    video: {
	  facingMode: { exact: "environment" },
	},
  });
  cam.size(width, height);
  cam.hide();

  // GPS
  navigator.geolocation.watchPosition(pos => {
      current.lat = pos.coords.latitude;
      current.lon = pos.coords.longitude;
	  current = smoothGPS(current.lat, current.lon);
      console.log("gps", current.lat, current.lon);
    }, err => {
      console.error(err);
    }, {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 20000
    }
  );

  startTime = millis();
}

// ============================
// メインループ
// ============================

function draw() {
  // カメラ映像
  // image(cam, 0, 0, width, height);
  // push(); 
  background(0);

  push();
  resetMatrix();
  translate(0, 0, -500);
  
  noStroke();
  texture(cam);
  plane(width*2-150, height*2-150);
  // ortho(-width, width, -height, height);
  //image(cam, -width / 2, -height / 2, width, height);
  // image(cam, -width+80, -height+120, width * 1.5, height * 1.5);
/*
  // 傾きデータを取得して回転（前後）
  angleMode(DEGREES);
  pitch = rotationX;
  // (任意) 左右の傾きも追加
  heading = rotationY;
  */
  pop();

  if (current.lat === null) return;

  let target = bearing(
    current.lat,
    current.lon,
    targetPoint.lat,
    targetPoint.lon
  );

  let angle = target - heading;
  error = abs(angle);

  let d = checkReach(); // チェックポイントまでの距離を計算

  drawUI(angle, d);
  drawArrow3D(angle);
  
  push();
  resetMatrix(); 
  translate(-width / 2, -height / 2)
  textAlign(LEFT, TOP)
  textSize(16);
  text(
    current.lat.toFixed(6) + ", " + current.lon.toFixed(6), 0, 0
  );
  text("target: " + target.toFixed(1), 0, 16);
  text("angle: " + angle.toFixed(1), 0, 32);
  text("pitch: " + pitch.toFixed(1), 0, 48);
  text("test: " + test.toFixed(1), 0, 64);
  pop();
}

// ============================
// チェックポイント到達処理
// ============================

function checkReach() {
  let d = distance(
    current.lat, current.lon,
    targetPoint.lat, targetPoint.lon
  );

  //targetIndex = 13; // テスト
  if (d < 5) { // 5m以内
	if (targetIndex+1 == 14) { //ゴールに到着
	  push();
	  // translate(width / 2, height / 2);
      textAlign(CENTER);
      textSize(25);
	
	  let string = "目的地に到着しました\nナビゲーションを終了します";
	  let padding = 10;
      let w = textWidth(string) + padding * 2;
      let h = 50;
	  nav_finished = true;

      // 背景
      fill(0, 0, 0, 160); // 半透明黒
      noStroke();
      rect(-w/2, 80, w, 75, 8);

      // 文字
      fill(255);
      text(string, 0, 110);
	  pop();
	  return;
	}
	targetIndex++;
    targetPoint = route[targetIndex];
	// 正しい方向を向いた判定
    if (error < 10) {
      recordResult(error);
    }
  }
  return d;
}

// ============================
// 座標の平均化でブレを減らす
// ============================

function smoothGPS(lat, lon) {
  history.push({ lat, lon });
  if (history.length > 5) history.shift();

  let avg = history.reduce((a, b) => ({
    lat: a.lat + b.lat,
    lon: a.lon + b.lon
  }));

  return {
    lat: avg.lat / history.length,
    lon: avg.lon / history.length
  };
}

// ============================
// ２地点間の距離
// ============================

const R = Math.PI / 180;

function distance(lat1, lng1, lat2, lng2) {
  lat1 *= R;
  lng1 *= R;
  lat2 *= R;
  lng2 *= R;
  let calc = 6371 * 1000 * Math.acos(Math.cos(lat1) * Math.cos(lat2) * Math.cos(lng2 - lng1) + Math.sin(lat1) * Math.sin(lat2));
  return calc.toFixed(4);
}

// ============================
// UI描画
// ============================

function drawUI(angle, d) {
  push();
  textAlign(CENTER);
  textSize(20);
  if (uiType === "B") {
	if (nav_finished == false){
	  let string = String(d) + "m";
	  let padding = 10;
      let w = textWidth(string) + padding * 2;
      let h = 36;

      textBox(w, h, string);
	}
  }
  if (uiType === "C") {
	if (nav_finished == false){
	  let string = String(d) + "m 矢印方向";
	  let padding = 10;
      let w = textWidth(string) + padding * 2;
      let h = 36;

      textBox(w, h, string);
	}
  }
  if (uiType === "D") {
	if (nav_finished == false){
	  drawCheckpointMarker(angle, d);
	}
  }
  if (uiType === "E") {
	if (nav_finished == false){
	  let string = String(d) + "m 矢印方向";
	  let padding = 10;
      let w = textWidth(string) + padding * 2;
      let h = 36;

      textBox(w, h, string);
	  drawCheckpointMarker(angle, d);
	}
  }
  pop();
}

function textBox(w, h, string) {
  // 背景
  fill(0, 0, 0, 160);
  noStroke();
  rect(-w/2, 85, w, h, 8);

  // 文字
  fill(255);
  text(string, 0, 110);
}

function drawArrow3D(angle) { // 3D矢印
  push();

  resetMatrix();
  translate(0, 50, 100);

  // 進行方向（Y軸）
  rotateY(radians(-angle));
  
  ambientLight(100);
  directionalLight(255, 255, 255, 0, 0, -1);
  ambientMaterial(255, 0, 0);

  fill(255, 0, 0);
  noStroke();
  rotateX(radians(90));
  translate(0, -10, 0)
  cone(20, -40);
  translate(0, 40, 0);
  cylinder(8, -50);

  pop();
}

// チェックポイント目印
function drawCheckpointMarker(angle, distance) {
  // 背面を非表示
  if (cos(radians(angle)) <= 0) return;

  // 距離で奥行きを決める（疑似AR）
  let z = map(distance, 5, 50, -150, -500);
  z = constrain(z, -800, -150);
  let size = map(distance, 5, 50, 60, 20);

  push();
  resetMatrix();
  // 方角
  rotateY(radians(-angle));
  // 見下ろし
  //rotateX(radians(60));
  translate(0, 0, z);

  // 視認性
  noStroke();
  ambientLight(120);
  directionalLight(255, 255, 255, 0, 0, -1);

  ambientMaterial(0, 150, 255);
  sphere(size);

  pop();
}

// ============================
// 方位・角度計算
// ============================

function bearing(lat1, lon1, lat2, lon2) {
  let y = sin(radians(lon2 - lon1)) * cos(radians(lat2));
  let x =
    cos(radians(lat1)) * sin(radians(lat2)) -
    sin(radians(lat1)) * cos(radians(lat2)) *
    cos(radians(lon2 - lon1));
  return degrees(atan2(y, x));
}

// ============================
// 端末の向き（iOS対応）
// ============================

window.addEventListener("deviceorientation", e => {
  if (e.webkitCompassHeading !== undefined) {
    // iOS（北基準・時計回り）
    heading = e.webkitCompassHeading;
	// 縦方向
	pitch = e.beta;
  } else if (e.alpha !== null) {
    // Android等
    heading = e.alpha;
	pitch = e.beta;
  }
});

// iOS用：タップで許可
function touchStarted() {
  if (typeof DeviceOrientationEvent.requestPermission === "function") {
    DeviceOrientationEvent.requestPermission();
  }
}

function clamp(v, min, max) {
  let result = Math.max(min, Math.min(max, v));
  return result;
}

// ============================
// ログ記録・CSV出力
// ============================

function recordResult(error) {
  let time = millis() - startTime;
  logs.push(`${targetIndex},${uiType},${time},${error.toFixed(1)}`);
  startTime = millis(); // 次試行用
}

function downloadCSV() {
  let csv = "targetIndex, UI,Time(ms),Error(deg)\n" + logs.join("\n");
  let blob = new Blob([csv], { type: "text/csv" });
  let a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "result.csv";
  a.click();
}
