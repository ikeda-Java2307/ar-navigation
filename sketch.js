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
	text(String(current.lat), 0, 0);
	text(String(current.lon), 0, 10);
}