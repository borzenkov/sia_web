var camera;
var webGLRenderer;
var cameraControl;

var enableCameraControl = function() {
    cameraControl.enabled = true;
}

var disableCameraControl = function() {
    cameraControl.enabled = false;
}

// once everything is loaded, we run our Three.js stuff.
function init() {
    var stats = initStats();
    // create a scene, that will hold all our elements such as objects, cameras and lights.
    var scene = new THREE.Scene();
    // create a camera, which defines where we're looking at.
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    // create a render and set the size
    webGLRenderer = new THREE.WebGLRenderer();
    webGLRenderer.setClearColor(new THREE.Color(0xEEEEEE, 1.0));
    webGLRenderer.setSize(window.innerWidth, window.innerHeight);
    webGLRenderer.shadowMap.enabled = true;
    var shape = createMesh(new THREE.ShapeGeometry(drawShape(5)));
    // add the sphere to the scene
    scene.add(shape);
    // position and point the camera to the center of the scene
    camera.position.x = -20;
    camera.position.y = 60;
    camera.position.z = 60;
    camera.lookAt(new THREE.Vector3(20, 20, 0));

	// add controls
	cameraControl = new THREE.OrbitControls(camera);

    // add the output of the renderer to the html element
    document.getElementById("WebGL-output").appendChild(webGLRenderer.domElement);
    // call the render function
    var step = 0;
    // setup the control gui
    var controls = new function () {
        this.amount = 2;
        this.bevelThickness = 2;
        this.bevelSize = 0.5;
        this.bevelEnabled = true;
        this.bevelSegments = 3;
        this.bevelEnabled = true;
        this.curveSegments = 12;
        this.steps = 1;
        this.rd = 5;
        this.asGeom = function () {
            // remove the old plane
            scene.remove(shape);
            // create a new one
            var options = {
                amount: controls.amount,
                bevelThickness: controls.bevelThickness,
                bevelSize: controls.bevelSize,
                bevelSegments: controls.bevelSegments,
                bevelEnabled: controls.bevelEnabled,
                curveSegments: controls.curveSegments,
                steps: controls.steps
            };
            shape = createMesh(new THREE.ExtrudeGeometry(drawShape(controls.rd), options));
            // add it to the scene.
            scene.add(shape);
        };
    };
    var gui = new dat.GUI();
    gui.add(controls, 'amount', 0, 20).onChange(controls.asGeom);
    gui.add(controls, 'bevelThickness', 0, 10).onChange(controls.asGeom);
    gui.add(controls, 'bevelSize', 0, 10).onChange(controls.asGeom);
    gui.add(controls, 'bevelSegments', 0, 30).step(1).onChange(controls.asGeom);
    gui.add(controls, 'bevelEnabled').onChange(controls.asGeom);
    gui.add(controls, 'curveSegments', 1, 30).step(1).onChange(controls.asGeom);
    gui.add(controls, 'steps', 1, 5).step(1).onChange(controls.asGeom);
    gui.add(controls, 'rd', 1, 5).step(0.1).onChange(controls.asGeom);
    controls.asGeom();
    render();
    function drawShape(rd) {
        var A = new THREE.Vector3( 28, 57, 0 );
        var B = new THREE.Vector3( 11, 57, 0 );
        var C = new THREE.Vector3( 0, 45, 0 );
        var D = new THREE.Vector3( 0, 0, 0 );
        var E = new THREE.Vector3( 26, 17, 0 );
        var F = new THREE.Vector3( 26, 49, 0 );
        var rc = 10;
        //var rd = 5;
        var re = 5;
        var rf = 5;

        var shape = getPlateShape( A, B, C, D, E, F, rc, rd, re, rf );

        return shape;
    }
    function createMesh(geom) {
        geom.applyMatrix(new THREE.Matrix4().makeTranslation(-20, 0, 0));
        // assign two materials
        var meshMaterial = new THREE.MeshNormalMaterial({
            transparent: true,
            opacity: 0.7
        });
        //  meshMaterial.side = THREE.DoubleSide;
        var wireFrameMat = new THREE.MeshBasicMaterial();
        wireFrameMat.wireframe = true;
        // create a multimaterial
        var mesh = THREE.SceneUtils.createMultiMaterialObject(geom, [meshMaterial]);
        return mesh;
    }
    function createLine(shape, spaced) {
        if (!spaced) {
            var mesh = new THREE.Line(shape.createPointsGeometry(), new THREE.LineBasicMaterial({
                color: 0xff3333,
                linewidth: 2
            }));
            return mesh;
        } else {
            var mesh = new THREE.Line(shape.createSpacedPointsGeometry(20), new THREE.LineBasicMaterial({
                color: 0xff3333,
                linewidth: 2
            }));
            return mesh;
        }
    }
    function render() {
    	cameraControl.update();
        stats.update();
        //shape.rotation.y = step += 0.01;
        // render using requestAnimationFrame
        requestAnimationFrame(render);
        webGLRenderer.render(scene, camera);
    }
    function initStats() {
        var stats = new Stats();
        stats.setMode(0); // 0: fps, 1: ms
        // Align top-left
        stats.domElement.style.position = 'absolute';
        stats.domElement.style.left = '0px';
        stats.domElement.style.top = '0px';
        document.getElementById("Stats-output").appendChild(stats.domElement);
        return stats;
    }
}

window.onload = init;
// calls the handleResize function when the window is resized
window.addEventListener('resize', handleResize, false);

/**
 * Function handles the resize event. This make sure the camera and the renderer
 * are updated at the correct moment.
 */
function handleResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    webGLRenderer.setSize(window.innerWidth, window.innerHeight);
}