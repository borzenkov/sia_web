"use strict";

var cubicCanvas;
var cubicGraphics;
var cubicPoints;
var cubicHideSelect;
var lockSelect;

var renderer;
var scene;
var camera;
var controls;
var stats;

var numberOfHeadControlPoints;

function Point2D(x,y) {
    this.x = x;
    this.y = y;
}

function cubicDraw() {
    var i;
    cubicGraphics.fillStyle = "white";
    cubicGraphics.fillRect(0,0,600,600);
    if ( ! cubicHideSelect.checked ) {
        cubicGraphics.lineWidth = 1;
        if (lockSelect.checked) {
            cubicGraphics.strokeStyle = "#880000";
        }
        else {
            cubicGraphics.strokeStyle = "#888888";
        }
        for (i = 0; i < cubicPoints.length - 1; i++) {
            if (i % 3 != 1) {
                cubicGraphics.beginPath();
                cubicGraphics.moveTo( cubicPoints[i].x + .5, cubicPoints[i].y + .5 );
                cubicGraphics.lineTo( cubicPoints[i+1].x + .5, cubicPoints[i+1].y + .5 );
                cubicGraphics.stroke();
            }
        }
        for (i = 0; i < cubicPoints.length; i++) {
            if ( i % 3 == 0 ) {
                cubicGraphics.fillStyle="black";
                disk(cubicGraphics, cubicPoints[i].x, cubicPoints[i].y, 5);
            }
            else {
                cubicGraphics.fillStyle= "blue";
                cubicGraphics.fillRect(cubicPoints[i].x - 5, cubicPoints[i].y - 5, 10, 10);

            }
        }
    }
    cubicGraphics.beginPath();
    cubicGraphics.moveTo(cubicPoints[0].x,cubicPoints[0].y);
    for (i = 1; i < cubicPoints.length; i += 3) {
        cubicGraphics.bezierCurveTo(cubicPoints[i].x,cubicPoints[i].y,
            cubicPoints[i+1].x,cubicPoints[i+1].y,
            cubicPoints[i+2].x,cubicPoints[i+2].y);
    }
    cubicGraphics.lineWidth = 2;
    cubicGraphics.strokeStyle = "black";
    cubicGraphics.stroke();
}

function disk( graphics, x, y, radius ) {
    graphics.beginPath();
    graphics.arc(x,y,radius,0,Math.PI*2);
    graphics.fill();

}

function doLock() {
    if ( lockSelect.checked ) {
        var i;
        for(i = 2; i < cubicPoints.length - 4; i += 3)
        {
            cubicPoints[i + 2].x = 2*cubicPoints[i + 1].x - cubicPoints[i].x;
            cubicPoints[i + 2].y = 2*cubicPoints[i + 1].y - cubicPoints[i].y;
        }
    }
    cubicDraw();
}


var draggingCubic = false;
var dragPointIndex;

function doMouseUp(evt) {
    draggingCubic = false;
}

function doTouchEnd(evt) {
    draggingCubic = false;
}

function doCubicMouseDown(evt) {
    if (draggingCubic || cubicHideSelect.checked) {
        return;
    }
    var r = cubicCanvas.getBoundingClientRect();
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

function doCubicTouchStart(evt) {
    if (draggingCubic || cubicHideSelect.checked) {
        return;
    }
    evt.preventDefault();
    evt.stopPropagation();
    var r = cubicCanvas.getBoundingClientRect();
    var x = Math.round(evt.touches[0].pageX - r.left);
    var y = Math.round(evt.touches[0].pageY - r.top);
    for (var i = cubicPoints.length - 1; i >= 0; i--) {
        var p = cubicPoints[i];
        if (Math.abs(p.x - x) <= 5 && Math.abs(p.y - y) <= 5) {
            draggingCubic = true;
            dragPointIndex = i;
            return;
        }
    }
}

function doCubicMouseMove(evt) {
    if (!draggingCubic) {
        return;
    }
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
    else if (lockSelect.checked) {
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
    cubicDraw();
    makeHead();
}

function doCubicTouchMove(evt) {
    if (!draggingCubic) {
        return;
    }
    evt.preventDefault();
    evt.stopPropagation();

    var r = cubicCanvas.getBoundingClientRect();
    var x = Math.round(evt.touches[0].pageX - r.left);
    var y = Math.round(evt.touches[0].pageY - r.top);
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
    else if (lockSelect.checked) {
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
    cubicDraw();
    makeHead();
}

function init() {
    try {
        cubicCanvas = document.getElementById("cubic");
        cubicGraphics = cubicCanvas.getContext("2d");
    }
    catch (e) {
        var message = document.getElementById("message");
        message.innerHTML = "Oops... Sorry, your browser doesn't support the canvas element.";
        return;
    }
    var headLength = document.getElementById("headLength").valueAsNumber;
    numberOfHeadControlPoints = document.getElementById("numberOfHeadControlPoints").valueAsNumber;
    lockSelect = document.getElementById("lock");
    lockSelect.checked = false;
    lockSelect.onclick = doLock;
    cubicHideSelect = document.getElementById("cubicHide");
    cubicHideSelect.checked = false;
    cubicHideSelect.onclick = function() { cubicDraw(); };
    var firstPoint = new Point2D(0, 0);
    var secondPoint = new Point2D(0, headLength / 2);
    var nextToLastPoint = new Point2D(headLength, headLength / 2);
    var lastPoint = new Point2D(headLength, 0);
    var deltaX = headLength / (numberOfHeadControlPoints + 1);
    var i;
    cubicPoints = [];
    cubicPoints.push(firstPoint);
    cubicPoints.push(secondPoint);
    for(i = 0; i < numberOfHeadControlPoints; i++){
        cubicPoints.push(new Point2D((i + 1) * deltaX - 10, headLength / 2));
        cubicPoints.push(new Point2D((i + 1) * deltaX, headLength / 2));
        cubicPoints.push(new Point2D((i + 1) * deltaX + 10, headLength / 2));
    }
    cubicPoints.push(nextToLastPoint);
    cubicPoints.push(lastPoint);
    cubicDraw();
    document.addEventListener("mouseup", doMouseUp, false);
    cubicCanvas.addEventListener("mousedown", doCubicMouseDown, false);
    cubicCanvas.addEventListener("mousemove", doCubicMouseMove, false);
    document.addEventListener("touchend", doTouchEnd, false);
    cubicCanvas.addEventListener("touchstart", doCubicTouchStart, false);
    cubicCanvas.addEventListener("touchmove", doCubicTouchMove, false);

    scene = new THREE.Scene();
    renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(0x000000, 1.0);
    renderer.setSize(400, 400);
    camera = new THREE.PerspectiveCamera(45, 1, 0.1, 2000);
    camera.position.x = 500;
    camera.position.y = 500;
    camera.position.z = 500;
    document.body.appendChild(renderer.domElement);

    controls = new THREE.TrackballControls( camera, renderer.domElement );
    controls.minDistance = 0;
    controls.maxDistance = Infinity;
    makeHead();
    camera.lookAt(headObject);
    animate();
}

function animate() {

    requestAnimationFrame( animate );

    controls.update();

    renderer.render( scene, camera );

}

var headGeneratorPoints = [];
var numberOfHeadGeneratorFragmentPoints = 10;
var v0 = new THREE.Vector3(0, 0, 0),
    v1 = new THREE.Vector3(0, 0, 0),
    v2 = new THREE.Vector3(0, 0, 0),
    v3 = new THREE.Vector3(0, 0, 0);
var curve = new THREE.CubicBezierCurve3(v0, v1, v2, v3);
function generateHeadGeneratorPoints(){
    var i;
    for(i = headGeneratorPoints.length - 1; i >= 0; i--){
        delete headGeneratorPoints.pop();
    }
    var numberOfHeadGeneratorFragments = numberOfHeadControlPoints + 1;
    var lastHeadGeneratorPoint;
    for(i = 0; i < cubicPoints.length - 1; i += 3){
        v0.set(cubicPoints[i].x, cubicPoints[i].y, 0);
        v1.set(cubicPoints[i + 1].x, cubicPoints[i + 1].y, 0);
        v2.set(cubicPoints[i + 2].x, cubicPoints[i + 2].y, 0);
        v3.set(cubicPoints[i + 3].x, cubicPoints[i + 3].y, 0);
        headGeneratorPoints = headGeneratorPoints.concat(curve.getPoints(numberOfHeadGeneratorFragmentPoints - 1));
        lastHeadGeneratorPoint = headGeneratorPoints.pop();
    }
    headGeneratorPoints.push(lastHeadGeneratorPoint);
}

var headMeshPoints = [];
var numberOfHeadGenerators = 40;
var headGeneratorTurningAngle = 2 * Math.PI / numberOfHeadGenerators;
var headRevolutionAxis = new THREE.Vector3(1, 0, 0);
function generateHeadMeshPoints(){
    for(i = headMeshPoints.length - 1; i >= 0; i--){
        delete headMeshPoints.pop();
    }
    generateHeadGeneratorPoints();
    var i, j;
    for(i = 0; i < numberOfHeadGenerators; i++){
        for(j = 0; j < headGeneratorPoints.length; j++){
            var pnt = new THREE.Vector3(headGeneratorPoints[j].x, headGeneratorPoints[j].y, headGeneratorPoints[j].z);
            pnt.applyAxisAngle( headRevolutionAxis, headGeneratorTurningAngle * i );
            headMeshPoints.push(pnt);
        }
    }
}

var headObject = new THREE.Mesh();
headObject.name = "headObject";
var headObjectMaterial = new THREE.MeshNormalMaterial();
var headGeometry = new THREE.Geometry();
function makeHead(){
    scene.remove(scene.getObjectByName("headObject"));
    var i, j;

    generateHeadMeshPoints();

    for(i = 0; i < headMeshPoints.length; i++){
        delete headGeometry.vertices.pop();
    }

    for(i = 0; i < numberOfHeadGenerators; i++) {
        for (j = 0; j < headGeneratorPoints.length - 1; j++) {
            delete headGeometry.faces.pop();
            delete headGeometry.faces.pop();
        }
    }

    for(i = 0; i < headMeshPoints.length; i++){
        headGeometry.vertices.push(headMeshPoints[i]);
    }
    for(i = 0; i < numberOfHeadGenerators - 1; i++){
        for(j = 0; j < headGeneratorPoints.length - 1; j++){
            var firstPointOfFirstTriangleIndex = i * headGeneratorPoints.length + j;
            var secondPointOfFirstTriangleIndex = i * headGeneratorPoints.length + j + headGeneratorPoints.length;
            var thirdPointOfFirstTriangleIndex = i * headGeneratorPoints.length + j + headGeneratorPoints.length + 1;
            headGeometry.faces.push( new THREE.Face3( firstPointOfFirstTriangleIndex, secondPointOfFirstTriangleIndex, thirdPointOfFirstTriangleIndex ) );

            var firstPointOfSecondTriangleIndex = i * headGeneratorPoints.length + j;
            var secondPointOfSecondTriangleIndex = i * headGeneratorPoints.length + j + headGeneratorPoints.length + 1;
            var thirdPointOfSecondTriangleIndex = i * headGeneratorPoints.length + j + 1;
            headGeometry.faces.push( new THREE.Face3( firstPointOfSecondTriangleIndex, secondPointOfSecondTriangleIndex, thirdPointOfSecondTriangleIndex ) );
        }
    }

    for(j = 0; j < headGeneratorPoints.length - 1; j++){
        firstPointOfFirstTriangleIndex = (numberOfHeadGenerators - 1) * headGeneratorPoints.length + j;
        secondPointOfFirstTriangleIndex = j;
        thirdPointOfFirstTriangleIndex = j + 1;
        headGeometry.faces.push( new THREE.Face3( firstPointOfFirstTriangleIndex, secondPointOfFirstTriangleIndex, thirdPointOfFirstTriangleIndex ) );

        firstPointOfSecondTriangleIndex = (numberOfHeadGenerators - 1) * headGeneratorPoints.length + j;
        secondPointOfSecondTriangleIndex = j + 1;
        thirdPointOfSecondTriangleIndex = (numberOfHeadGenerators - 1) * headGeneratorPoints.length + j + 1;
        headGeometry.faces.push( new THREE.Face3( firstPointOfSecondTriangleIndex, secondPointOfSecondTriangleIndex, thirdPointOfSecondTriangleIndex ) );
    }


    headGeometry.dynamic = true;
    headGeometry.verticesNeedUpdate = true;
    headGeometry.elementsNeedUpdate = true;
    headGeometry.normalsNeedUpdate = true;
    //headGeometry.uvsNeedUpdate = true;
    //headGeometry.tangentsNeedUpdate = true;
    //headGeometry.colorsNeedUpdate = true;
    //headGeometry.lineDistancesNeedUpdate = true;
    headGeometry.computeFaceNormals();
    headObject.geometry = headGeometry;
    headObject.material = headObjectMaterial;
    headObject.name = "headObject";

    scene.add(headObject);
}

/*var spheres = [];
 function makeHead(){
 var i;
 for(i = 0; i < spheres.length; i++) {
 scene.remove(spheres[i]);
 }
 for(i = 0; i < spheres.length; i++) {
 spheres.pop();
 }
 generateHeadMeshPoints();
 for(i = 0; i < headMeshPoints.length; i++){
 var geometry = new THREE.SphereGeometry( 5, 4, 4 );
 var material = new THREE.MeshBasicMaterial( {color: 0xffff00} );
 var sphere = new THREE.Mesh( geometry, material );
 sphere.position.x = headMeshPoints[i].x;
 sphere.position.y = headMeshPoints[i].y;
 sphere.position.z = headMeshPoints[i].z;
 spheres.push(sphere);
 scene.add(sphere);
 }
 }*/
