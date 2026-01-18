// ============================
// 設定値
// ============================

// ターゲットまでのチェックポイント
const route = [ // {lat: 37.52535707129404, lon: 138.91485761773126} // テスト
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
let uiType = "A";

let targetIndex = 0;
let targetPoint = route[targetIndex];

let nav_finished = false;

// ログ
let startTime;
let logs = [];

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
  
  // texture(cam);
  // plane(width, height);
  // ortho(-width, width, -height, height);
  //image(cam, -width / 2, -height / 2, width, height);
  image(cam, -width+80, -height+120, width * 1.5, height * 1.5);
  
  pop();

  if (current.lat === null) return;

  let target = bearing(
    current.lat,
    current.lon,
    targetPoint.lat,
    targetPoint.lon
  );

  let angle = target - heading;
  let error = abs(angle);

  let d = checkReach(); // チェックポイントまでの距離を計算

  // drawUI(angle, d);
  drawArrow3D(angle, d);
  
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
  pop();

  // 正しい方向を向いた判定
  if (error < 10) {
    recordResult(error);
  }
}

// ============================
// チェックポイント到達処理
// ============================

function checkReach() {
  let d = distance(
    current.lat, current.lon,
    targetPoint.lat, targetPoint.lon
  );

  // targetIndex = 12; // テスト
  if (d < 5) { // 5m以内
	if (targetIndex == 12) { //ゴールに到着
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
      rect(-w/2, 40, w, 75, 8);

      // 文字
      fill(255);
      text(string, 0, 70);
	  pop();
	  return;
	}
	targetIndex++;
    targetPoint = route[targetIndex];
  }
  return d;
}

// ============================
// 座標の平均化でブレを減らす
// ============================

let history = [];

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
  // translate(width, height);
  rotate(radians(angle));
  fill(255, 0, 0);
  triangle(0, -40, -20, 20, 20, 20);
  pop();

  push();
  // translate(width, height);
  textAlign(CENTER);
  textSize(20);
  if (uiType === "B") {
	let string = String(d) + "m";
	let padding = 10;
    let w = textWidth(string) + padding * 2;
    let h = 36;

	if (nav_finished == false){
      // 背景
      fill(0, 0, 0, 160); // 半透明黒
      noStroke();
      rect(-w/2, 34, w, h, 8);

      // 文字
      fill(255);
      text(string, 0, 60);
	}
  }
  if (uiType === "C") {
	if (nav_finished == false){
	  let string = String(d) + "m まっすぐ";
	  let padding = 10;
      let w = textWidth(string) + padding * 2;
      let h = 36;

      // 背景
      fill(0, 0, 0, 160);
      noStroke();
      rect(-w/2, 34, w, h, 8);

      // 文字
      fill(255);
      text(string, 0, 60);
	}
  }
  pop();
}

function drawArrow3D(angle, d) {
  push();/*  // 2D矢印
  rotateZ(radians(angle));
  normalMaterial();
  ambientLight(150);
  directionalLight(255, 255, 255, 0, 0, -1);

  // 軸
  fill(255, 0, 0);
  box(20, 100, 20);

  // 先端
  fill(255, 0, 0);
  translate(0, -70, 100);
  cone(30, -50);*/
/*
   //旧3D矢印（矢印変な方向）
    // 画面中央・少し奥
  translate(0, 50, 100);

  // ① 進行方向（Y軸回転）
  rotateY(radians(angle));

  // ② 見下ろし角度（X軸回転）
  rotateX(radians(60));

  // 色
  ambientMaterial(255, 255, 0);

  // 矢印先端
  fill(255, 0, 0);
  cone(20, -40);

  // 矢印の軸
  translate(0, 30, 0);
  cylinder(6, 40);
*/
  // 新3D矢印（スマホの縦方向追加）
  translate(0, 50, 100);

  // ① 進行方向（Y軸）
  rotateY(radians(angle));

  // ② スマホの縦傾き → 見る角度
  rotateX(radians(60 - pitchClamped));

  ambientMaterial(255, 0, 0);

  cone(20, 40);
  translate(0, 30, 0);
  cylinder(6, 40);

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
	pitch = e.beta;
  } else if (e.alpha !== null) {
    // Android等
    heading = e.alpha;
	pitch = e.beta;
  }
});

let pitchClamped = clamp(pitch, -45, 45);

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

// iOS用：タップで許可
function touchStarted() {
  if (typeof DeviceOrientationEvent.requestPermission === "function") {
    DeviceOrientationEvent.requestPermission();
  }
}

// ============================
// ログ記録・CSV出力
// ============================

function recordResult(error) {
  let time = millis() - startTime;
  logs.push(`${uiType},${time},${error.toFixed(1)}`);
  startTime = millis(); // 次試行用
}

function downloadCSV() {
  let csv = "UI,Time(ms),Error(deg)\n" + logs.join("\n");
  let blob = new Blob([csv], { type: "text/csv" });
  let a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "result.csv";
  a.click();
}
