let cam;

function setup() {
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
}