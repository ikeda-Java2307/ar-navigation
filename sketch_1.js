let cam;
const route = [
  { lat: 37.525140, lon: 138.914896 }
/*
  { lat: 35.0003, lon: 139.0005 },
  { lat: 35.0006, lon: 139.0008 },
  { lat: 35.0010, lon: 139.0012 }*/
];
let targetIndex = 0;
let targetPoint = route[targetIndex];
let current = {};

navigator.geolocation.watchPosition(pos => {
  current.lat = pos.coords.latitude; //current.lat?
  current.lon = pos.coords.longitude; //current.lon?
});


function setup() {
	// カメラ機能
  	createCanvas(windowWidth, windowHeight);
  	cam = createCapture({
		video: {
			facingMode: { exact: "environment" },
		},
	});
    cam.size(width, height);
    cam.hide();
}

function draw() {
    image(cam, 0, 0, width, height);
	textSize(50);
	text(String(current.lat), 0, 0, width, height);
	text(String(current.lon), 0, 50, width, height);
}

/*
function bearing(lat1, lon1, lat2, lon2) {
  let y = sin(radians(lon2 - lon1)) * cos(radians(lat2));
  let x =
    cos(radians(lat1)) * sin(radians(lat2)) -
    sin(radians(lat1)) * cos(radians(lat2)) * cos(radians(lon2 - lon1));
  return degrees(atan2(y, x));
}*/


/*
// ============================
// 設定値
// ============================

// 目的地（例：中学校）
const route = [
  { lat: 37.525140, lon: 138.914896 }*/
/*
  { lat: 35.0003, lon: 139.0005 },
  { lat: 35.0006, lon: 139.0008 },
  { lat: 35.0010, lon: 139.0012 }*//*
];

let cam;
// let current = { lat: null, lon: null };
let current = {};
// GPS
navigator.geolocation.watchPosition(pos => {
  current.lat = pos.coords.latitude;
  current.lon = pos.coords.longitude;
});
let heading = 0;
let uiType = "A";

// ログ
let startTime;
let logs = [];

// ============================
// 初期化
// ============================

function setup() {
  createCanvas(windowWidth, windowHeight);

  // カメラ取得（ARの核）
  cam = createCapture({
    video: {
	  facingMode: { exact: "environment" },
	},
  });
  cam.size(width, height);
  cam.hide();
  
  startTime = millis();
}

// ============================
// メインループ
// ============================

function draw() {
  // カメラ映像
  image(cam, 0, 0, width, height);
  textSize(30);
  text(String(current.lat), 0, 0, width, height);
  text(String(current.lon), 0, 30, width, height);

  if (current.lat === null) return;

  let target = bearing(
    current.lat,
    current.lon,
    DEST.lat,
    DEST.lon
  );

  let angle = target - heading;
  let error = abs(angle);

  drawUI(angle, error);

  // 正しい方向を向いた判定
  if (error < 10) {
    recordResult(error);
  }
}

// ============================
// UI描画
// ============================

function drawUI(angle, error) {
  push();
  translate(width / 2, height / 2);
  rotate(radians(angle));
  fill(255, 0, 0);
  triangle(0, -40, -20, 20, 20, 20);
  pop();

  fill(255);
  textAlign(CENTER);
  textSize(20);

  if (uiType === "B") {
    text("120m", width / 2, height / 2 + 60);
  }

  if (uiType === "C") {
    text("120m まっすぐ", width / 2, height / 2 + 60);
  }
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
  heading = e.alpha || 0;
});

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
}*/
