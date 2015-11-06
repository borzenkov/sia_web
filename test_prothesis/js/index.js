//поиграться с порядком записи точек в слайсы
var camera;
var renderer;
var cameraControl;
var scene;
var junc;
var mesh;
var pp;
var p;

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

function init() {
	var stats = initStats();
    // create a scene, that will hold all our elements such as objects, cameras and lights.
    scene = new THREE.Scene();
    pp = new PlateParameters();
	p = new Prothesis(pp);
    scene.add(p.plate.plateMesh);
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
        this.contourFilletRadius = 0.5;
        this.angleBetaPartitionNumber = 10;
        this.contourFilletSlicesNumber = 10;
        this.contourFilletSlicesNumber = 10;
        this.point_D_FilletRadius = 5;
        this.asGeom = function () {
            p.plate.contourFilletRadius = controls.contourFilletRadius;
            p.plate.angleBetaPartitionNumber = controls.angleBetaPartitionNumber;
            p.plate.contourFilletSlicesNumber = controls.contourFilletSlicesNumber;
            p.plate.point_D_FilletRadius = controls.point_D_FilletRadius;
            p.plate.plateMesh.geometry.dispose();
            p.plate.build();
        };
    };
    var gui = new dat.GUI();
    gui.add(controls, 'contourFilletRadius', 0.5, 5).step(0.1).onChange(controls.asGeom);
    gui.add(controls, 'angleBetaPartitionNumber', 1, 50).step(1).onChange(controls.asGeom);
    gui.add(controls, 'contourFilletSlicesNumber', 1, 50).step(1).onChange(controls.asGeom);
    gui.add(controls, 'point_D_FilletRadius', 1, 10).step(1).onChange(controls.asGeom);
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