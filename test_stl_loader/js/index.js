window.onload = init;
// calls the handleResize function when the window is resized
window.addEventListener('resize', handleResize, false);

var showSTLFile = function()
{
	var inputFile = document.getElementById('input').files;
	var inputFilePath = inputFile[0].path;

	 // Binary files

    var material = new THREE.MeshNormalMaterial();
    var loader = new THREE.STLLoader();
    loader.load( inputFilePath, function ( geometry ) {

        var mesh = new THREE.Mesh( geometry, material );
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        scene.add( mesh );

    } );
}

var renderer;
var scene;
var camera;

function init() {
    // create a scene, that will hold all our elements such as objects, cameras and lights.
    scene = new THREE.Scene();
    // create a camera, which defines where we're looking at.
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    // create a render, sets the background color and the size
    renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(0xFFFFFF, 1.0);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMapEnabled = true;

    // position and point the camera to the center of the scene
    camera.position.x = 15;
    camera.position.y = 16;
    camera.position.z = 13;
    camera.lookAt(scene.position);

    // add controls
    cameraControl = new THREE.OrbitControls(camera);

    // add the output of the renderer to the html element
    document.body.appendChild(renderer.domElement);
    // call the render function, after the first render, interval is determined
    // by requestAnimationFrame
    render();
}

/**
 * Called when the scene needs to be rendered. Delegates to requestAnimationFrame
 * for future renders
 */
function render() {
    // update the camera
    cameraControl.update();
    // render using requestAnimationFrame
    requestAnimationFrame(render);
    renderer.render(scene, camera);
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