var camera;
var renderer;
var cameraControl;
var scene;
var junc;
var mesh;
var pp;
var p;
var prothesis = require('./js/Prothesis.js');

window.onload = init;
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
    scene = new THREE.Scene();
    pp = new prothesis.PlateParameters();
	p = new prothesis.Prothesis(pp);
    scene.add(p.plate.plateMesh);
    scene.add(p.plate.firstFaceMesh);
    scene.add(p.plate.secondFaceMesh);
    scene.add(p.plate.plateMirroredMesh);
    scene.add(p.plate.lateralFaceMesh);
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(0xFFFFFF, 1.0);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;

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
        this.hole_G_Radius = 2;
        this.hole_G_CenterX = 5;
        this.hole_G_CenterY = 15;
        this.asGeom = function () {
            p.plate.contourFilletRadius = controls.contourFilletRadius;
            p.plate.angleBetaPartitionNumber = controls.angleBetaPartitionNumber;
            p.plate.contourFilletSlicesNumber = controls.contourFilletSlicesNumber;
            p.plate.point_D_FilletRadius = controls.point_D_FilletRadius;
            p.plate.hole_G_Radius = controls.hole_G_Radius;
            p.plate.hole_G_Center.x = controls.hole_G_CenterX;
            p.plate.hole_G_Center.y = controls.hole_G_CenterY;
            p.plate.plateMesh.geometry.dispose();
            p.plate.firstFaceMesh.geometry.dispose();
            p.plate.plateMirroredMesh.geometry.dispose();
            p.plate.lateralFaceMesh.geometry.dispose();
            p.plate.build();
        };
    };
    var gui = new dat.GUI();
    gui.add(controls, 'contourFilletRadius', 0.5, 5).step(0.1).onChange(controls.asGeom);
    gui.add(controls, 'angleBetaPartitionNumber', 1, 50).step(1).onChange(controls.asGeom);
    gui.add(controls, 'contourFilletSlicesNumber', 1, 50).step(1).onChange(controls.asGeom);
    gui.add(controls, 'point_D_FilletRadius', 1, 10).step(1).onChange(controls.asGeom);
    gui.add(controls, 'hole_G_Radius', 1, 10).step(1).onChange(controls.asGeom);
    gui.add(controls, 'hole_G_CenterX', 1, 20).step(1).onChange(controls.asGeom);
    gui.add(controls, 'hole_G_CenterY', 1, 50).step(1).onChange(controls.asGeom);
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