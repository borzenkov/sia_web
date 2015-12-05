var camera;
var renderer;
var cameraControl;
var scene;
var junc;
var mesh;
var prothesis = require('./js/Prothesis.js');
var p = new prothesis.Prothesis();

var cubicCanvas, cubicGraphics;
var draggingCubic = false;
var dragPointIndex;
var movingHead = false;

window.onload = init;
window.addEventListener('resize', handleResize, false);

var enableCameraControl = function() {
    cameraControl.enabled = true;
}

var disableCameraControl = function() {
    cameraControl.enabled = false;
}

function init() {
    document.addEventListener('mousemove', getMouseCoordinates, false);
	var stats = initStats();
    scene = new THREE.Scene();
    scene.add(p.plate.plateMesh);
    scene.add(p.plate.firstFaceMesh);
    scene.add(p.plate.secondFaceMesh);
    scene.add(p.plate.plateMirroredMesh);
    scene.add(p.plate.lateralFaceMesh);
    scene.add(p.head.headMesh);
    scene.add(p.junctionMesh);
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 20000);

    renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(0xFFFFFF, 1.0);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;

    camera.position.x = 0;
    camera.position.y = 0;
    camera.position.z = 65;
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
        this.thickness = 5;

        this.headPositionX = 0;
        this.headPositionY = 0;
        this.headPositionZ = 0;
        this.rebuildPlate = function () {
            p.plate.contourFilletRadius = controls.contourFilletRadius;
            p.plate.angleBetaPartitionNumber = controls.angleBetaPartitionNumber;
            p.plate.contourFilletSlicesNumber = controls.contourFilletSlicesNumber;
            p.plate.point_D_FilletRadius = controls.point_D_FilletRadius;
            p.plate.hole_G_Radius = controls.hole_G_Radius;
            p.plate.hole_G_Center.x = controls.hole_G_CenterX;
            p.plate.hole_G_Center.y = controls.hole_G_CenterY;
            p.plate.thickness = controls.thickness;
            p.plate.plateMesh.geometry.dispose();
            p.plate.firstFaceMesh.geometry.dispose();
            p.plate.plateMirroredMesh.geometry.dispose();
            p.plate.lateralFaceMesh.geometry.dispose();
            p.plate.build();
        };
        this.positionHead = function () {
            p.head.headMesh.position.x = controls.headPositionX;
            p.head.headMesh.position.y = controls.headPositionY;
            p.head.headMesh.position.z = controls.headPositionZ;
        };
    };
    var gui = new dat.GUI();
    var cameraFolder = gui.addFolder('Камера');
    var plateFolder = gui.addFolder('Пластинка');
    plateFolder.add(controls, 'contourFilletRadius', 0.5, 5).step(0.1).onChange(controls.rebuildPlate);
    plateFolder.add(controls, 'angleBetaPartitionNumber', 1, 50).step(1).onChange(controls.rebuildPlate);
    plateFolder.add(controls, 'contourFilletSlicesNumber', 1, 50).step(1).onChange(controls.rebuildPlate);
    plateFolder.add(controls, 'point_D_FilletRadius', 1, 10).step(1).onChange(controls.rebuildPlate);
    plateFolder.add(controls, 'hole_G_Radius', 1, 10).step(1).onChange(controls.rebuildPlate);
    plateFolder.add(controls, 'hole_G_CenterX', 1, 20).step(1).onChange(controls.rebuildPlate);
    plateFolder.add(controls, 'hole_G_CenterY', 1, 50).step(1).onChange(controls.rebuildPlate);
    plateFolder.add(controls, 'thickness', 1, 50).step(1).onChange(controls.rebuildPlate);
    var headFolder = gui.addFolder('Головка');
    headFolder.add(controls, 'headPositionX', -100, 100).step(1).onChange(controls.positionHead);
    headFolder.add(controls, 'headPositionY', -100, 100).step(1).onChange(controls.positionHead);
    headFolder.add(controls, 'headPositionZ', -100, 100).step(1).onChange(controls.positionHead);

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

    //Initialize head canvas
    cubicCanvas = document.getElementById("headCanvas");
    p.head.initializeWidget(cubicCanvas);
    p.head.drawWidget();
    document.addEventListener("mouseup", doMouseUp, false);
    cubicCanvas.addEventListener("mousedown", function(e){doMouseDown(e, p);}, false);
    cubicCanvas.addEventListener("mousemove", function(e){doMouseMove(e, p);}, false);
}

function handleResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function showOrHideHeadParameters(){
    var headParametersWindow = document.getElementById('HeadParametersWindow');
    headParametersWindow.style.display = (headParametersWindow.style.display == 'block') ? 'none' : 'block';
}

function doMouseUp(evt) {
    draggingCubic = false;
}

function doMouseDown( evt, p ) {
    if (draggingCubic) {
        return;
    }
    var canvas = document.getElementById("headCanvas");
    var cubicPoints = p.head.cubicPointsForCanvas;
    var r = canvas.getBoundingClientRect();
    var x = Math.round(evt.clientX - r.left);
    var y = Math.round(evt.clientY - r.top);
    for (var i = cubicPoints.length - 1; i >= 0; i--) {
        var p = cubicPoints[i];
        if (Math.abs(p.x - x) <= 5 && Math.abs(p.y - y) <= 5) {
            draggingCubic = true;
            dragPointIndex = i;
            return;
        }
    }
}

function doMouseMove( evt, p ) {
    if (!draggingCubic) {
        return;
    }
    var canvas = document.getElementById("headCanvas");
    var cubicPoints = p.head.cubicPointsForCanvas;
    var r = cubicCanvas.getBoundingClientRect();
    var x = Math.round(evt.clientX - r.left);
    var y = Math.round(evt.clientY - r.top);
    var offsetX = x - cubicPoints[dragPointIndex].x;
    var offsetY = y - cubicPoints[dragPointIndex].y;
    cubicPoints[dragPointIndex].x = x;
    cubicPoints[dragPointIndex].y = y;
    if ( dragPointIndex % 3 == 0) {
        if (dragPointIndex > 0) {
            cubicPoints[dragPointIndex - 1].x += offsetX;
            cubicPoints[dragPointIndex - 1].y += offsetY;
        }
        if (dragPointIndex < cubicPoints.length - 1) {
            cubicPoints[dragPointIndex + 1].x += offsetX;
            cubicPoints[dragPointIndex + 1].y += offsetY;
        }
    }
    else if (true) {
        var i;
        for(i = 2; i < cubicPoints.length - 2; i += 3){
            if(dragPointIndex == i){
                cubicPoints[i + 2].x = 2*cubicPoints[i + 1].x - cubicPoints[i].x;
                cubicPoints[i + 2].y = 2*cubicPoints[i + 1].y - cubicPoints[i].y;
            }
        }
        for(i = 4; i < cubicPoints.length - 2; i += 3){
            if(dragPointIndex == i){
                cubicPoints[i - 2].x = 2*cubicPoints[i - 1].x - cubicPoints[i].x;
                cubicPoints[i - 2].y = 2*cubicPoints[i - 1].y - cubicPoints[i].y;
            }
        }
    }
    p.head.headMesh.geometry.dispose();
    p.head.drawWidget();
    p.head.build();
}

var geometry = new THREE.PlaneGeometry( 1000, 1000, 1 );
var material = new THREE.MeshBasicMaterial(
    {
        color: 0xffff00,
        side: THREE.DoubleSide, 
        transparent: true, 
        opacity: 0.5});
//material.depthTest = false;
var plane = new THREE.Mesh( geometry, material );
plane.visible = true;
var mouse = new THREE.Vector3();
var raycaster = new THREE.Raycaster();
var pickingObject = false;
var pickedObject;
var pickedPointOnPlane = new THREE.Vector3();
var objectPositionOnStart = new THREE.Vector3();
function pickObjectMode() {
    if( pickingObject ) {
        pickingObject = false;
        document.removeEventListener('mousedown', captureObject, false);
        document.removeEventListener('mouseup', releaseObject, false);
        return;
    }
    pickingObject = true;
    document.addEventListener('mousedown', captureObject, false);
    document.addEventListener('mouseup', releaseObject, false);
}
function getMouseCoordinates( event ) {
    mouse.x = ( event.clientX / renderer.domElement.clientWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / renderer.domElement.clientHeight ) * 2 + 1;
}
function captureObject() {
    // update the picking ray with the camera and mouse position    
    raycaster.setFromCamera( mouse, camera );   

    // calculate objects intersecting the picking ray
    var intersects = raycaster.intersectObjects( scene.children );
    if( intersects.length ) {
        disableCameraControl();
        pickedObject = intersects[0].object;
        plane.position.copy(pickedObject.position);
        var intersectionWithPlane = raycaster.intersectObject( plane );
        pickedPointOnPlane.copy(intersectionWithPlane[0].point);
        objectPositionOnStart.copy(pickedObject.position);
        document.addEventListener('mousemove', moveObject, false);
    }
}
function releaseObject() {
    document.removeEventListener('mousemove', moveObject, false);
    enableCameraControl();
}

function moveObject() {
    raycaster.setFromCamera( mouse, camera );
    var intersectionWithPlane = raycaster.intersectObject( plane );
    var translationVector = new THREE.Vector3();
    translationVector.subVectors(intersectionWithPlane[0].point, pickedPointOnPlane);
    translationVector.addVectors(objectPositionOnStart, translationVector);
    pickedObject.position.copy(translationVector);
    plane.position.copy(pickedObject.position);
}

function cameraOrbitMode() {
    if( !cameraControl.noRotate ) {
        cameraControl.noRotate = true;
        return;
    }
    cameraControl.noRotate = false;
}

function cameraPanMode() {
    if( !cameraControl.noPan ) {
        cameraControl.noPan = true;
        return;
    }
    cameraControl.noPan = false;
}