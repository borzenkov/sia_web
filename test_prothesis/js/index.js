//поиграться с порядком записи точек в слайсы
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

function init() {
	var stats = initStats();
    // create a scene, that will hold all our elements such as objects, cameras and lights.
    scene = new THREE.Scene();
    var pp = new PlateParameters();
	var p = new Prothesis(pp, scene);
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