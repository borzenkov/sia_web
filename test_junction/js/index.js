var camera;
var renderer;
var cameraControl;
var scene;
var junc;
var mesh;

window.onload = init;
// calls the handleResize function when the window is resized
window.addEventListener('resize', handleResize, false);

var remote = require('remote');
var reloadApp = function () {
	remote.getCurrentWindow().reload();
}

var enableCameraControl = function() {
    cameraControl.enabled = true;
}

var disableCameraControl = function() {
    cameraControl.enabled = false;
}

var initJunction = function( circleSliceRadius, circleSliceRotation, circleStartPoint ) {
	var curve1 = new THREE.EllipseCurve(
	0,  0,            // ax, aY
	circleSliceRadius, circleSliceRadius * 2,           // xRadius, yRadius
	0,  2 * Math.PI,  // aStartAngle, aEndAngle
	false,            // aClockwise
	circleSliceRotation                 // aRotation 
	);

	var pointSet1 = [];
	for(var i = 0; i < 1; i += 1 / 100) {
		pointSet1.push(curve1.getPoint(i));
	}
	if(circleStartPoint) {
		var newPointSet1 = new Array();
		var i;
		for(i = circleStartPoint; i < pointSet1.length; i++) {
			newPointSet1.push(pointSet1[i]);
		}
		for(i = 0; i < circleStartPoint; i++) {
			newPointSet1.push(pointSet1[i]);
		}
		pointSet1 = newPointSet1;
	}

	var point1 = new THREE.Vector3( 2, 1, 0 );
	var point2 = new THREE.Vector3( -2, 1, 0 );
	var point3 = new THREE.Vector3( -2, -1, 0 );
	var point4 = new THREE.Vector3( 2, -1, 0 );
	var rectangleSide1 = new THREE.LineCurve3( point1, point2 );
	var rectangleSide2 = new THREE.LineCurve3( point2, point3 );
	var rectangleSide3 = new THREE.LineCurve3( point3, point4 );
	var rectangleSide4 = new THREE.LineCurve3( point4, point1 );

	var rectangleSide1Points = rectangleSide1.getPoints( 24 );
	var rectangleSide2Points = rectangleSide2.getPoints( 24 );
	var rectangleSide3Points = rectangleSide3.getPoints( 24 );
	var rectangleSide4Points = rectangleSide4.getPoints( 24 );

	var pointSet2 = rectangleSide1Points;
	pointSet2 = pointSet2.concat(rectangleSide2Points);
	pointSet2 = pointSet2.concat(rectangleSide3Points);
	pointSet2 = pointSet2.concat(rectangleSide4Points);

	var point9 = new THREE.Vector3( 1, 0, 1 );
	var point10 = new THREE.Vector3( 5, 0, 3 );
	var point11 = new THREE.Vector3( 8, 0, 7 );
	var point12 = new THREE.Vector3( 5, 0, 10 );
	var curve = new THREE.CubicBezierCurve3( point9, point10, point11, point12 );
	junc = new Junction(pointSet1, pointSet2, 100, curve);
	mesh = junc.getJunction();
}

var changeJunction = function( circleSliceRadius, circleSliceRotation, circleStartPoint ) {
	var curve1 = new THREE.EllipseCurve(
	0,  0,            // ax, aY
	circleSliceRadius, circleSliceRadius * 2,           // xRadius, yRadius
	0,  2 * Math.PI,  // aStartAngle, aEndAngle
	false,            // aClockwise
	circleSliceRotation                 // aRotation 
	);

	var pointSet1 = [];
	for(var i = 0; i < 1; i += 1 / 100) {
		pointSet1.push(curve1.getPoint(i));
	}
	if(circleStartPoint) {
		var newPointSet1 = new Array();
		var i;
		for(i = circleStartPoint; i < pointSet1.length; i++) {
			newPointSet1.push(pointSet1[i]);
		}
		for(i = 0; i < circleStartPoint; i++) {
			newPointSet1.push(pointSet1[i]);
		}
		pointSet1 = newPointSet1;
	}

	var point1 = new THREE.Vector3( 2, 1, 0 );
	var point2 = new THREE.Vector3( -2, 1, 0 );
	var point3 = new THREE.Vector3( -2, -1, 0 );
	var point4 = new THREE.Vector3( 2, -1, 0 );
	var rectangleSide1 = new THREE.LineCurve3( point1, point2 );
	var rectangleSide2 = new THREE.LineCurve3( point2, point3 );
	var rectangleSide3 = new THREE.LineCurve3( point3, point4 );
	var rectangleSide4 = new THREE.LineCurve3( point4, point1 );

	var rectangleSide1Points = rectangleSide1.getPoints( 24 );
	var rectangleSide2Points = rectangleSide2.getPoints( 24 );
	var rectangleSide3Points = rectangleSide3.getPoints( 24 );
	var rectangleSide4Points = rectangleSide4.getPoints( 24 );

	var pointSet2 = rectangleSide1Points;
	pointSet2 = pointSet2.concat(rectangleSide2Points);
	pointSet2 = pointSet2.concat(rectangleSide3Points);
	pointSet2 = pointSet2.concat(rectangleSide4Points);

	var point9 = new THREE.Vector3( 1, 0, 1 );
	var point10 = new THREE.Vector3( 5, 0, 3 );
	var point11 = new THREE.Vector3( 8, 0, 7 );
	var point12 = new THREE.Vector3( 5, 0, 10 );
	var curve = new THREE.CubicBezierCurve3( point9, point10, point11, point12 );

	junc.setSlice1( pointSet1 );
	junc.setSlice2( pointSet2 );
	mesh = junc.getJunction();
}

function init() {
	initJunction(5, 0, 0);
	var stats = initStats();
    // create a scene, that will hold all our elements such as objects, cameras and lights.
    scene = new THREE.Scene();
    // create a camera, which defines where we're looking at.
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    // create a render, sets the background color and the size
    renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(0xFFFFFF, 1.0);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;

    // position and point the camera to the center of the scene
    camera.position.x = 15;
    camera.position.y = 16;
    camera.position.z = 13;
    camera.lookAt(scene.position);

    // add controls
    cameraControl = new THREE.TrackballControls(camera);
    cameraControl.dynamicDampingFactor = 0.3;

    // add the output of the renderer to the html element
    document.getElementById("WebGL-output").appendChild(renderer.domElement);

    var controls = new function () {
        this.circleSliceRadius = 5;
        this.circleSliceRotation = 	Math.PI / 4;
        this.circleStartPoint = 0;
        this.asGeom = function () {
            // remove the old plane
            scene.remove(mesh);
            // create a new one
            changeJunction( controls.circleSliceRadius, controls.circleSliceRotation, controls.circleStartPoint );
            // add it to the scene.
            scene.add(mesh);
        };
    };
    var gui = new dat.GUI();
    gui.add(controls, 'circleSliceRadius', 1, 5).step(0.1).onChange(controls.asGeom);
    gui.add(controls, 'circleSliceRotation', -2*Math.PI, 2*Math.PI).step(0.01).onChange(controls.asGeom);
    gui.add(controls, 'circleStartPoint', 0, 100).step(1).onChange(controls.asGeom);
    controls.asGeom();
    // call the render function, after the first render, interval is determined
    // by requestAnimationFrame
    render();
    function render() {
    	// update the camera
    	cameraControl.update();
    	stats.update();
    	// render using requestAnimationFrame
    	requestAnimationFrame(render);
    	renderer.render(scene, camera);
	}
    function initStats() {
    	var stats = new Stats();
    	stats.setMode(0); // 0: fps, 1: ms
    	// Align top-left
    	stats.domElement.style.position = 'absolute';
    	stats.domElement.style.left = '0px';
    	stats.domElement.style.bottom = '0px';
    	document.getElementById("Stats-output").appendChild(stats.domElement);
    	return stats;
	}
}

/**
 * Function handles the resize event. This make sure the camera and the renderer
 * are updated at the correct moment.
 */
function handleResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}