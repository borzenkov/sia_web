var A = new THREE.Vector3( 28, 57, 0 );
var B = new THREE.Vector3( 11, 57, 0 );
var C = new THREE.Vector3( 0, 45, 0 );
var D = new THREE.Vector3( 0, 0, 0 );
var E = new THREE.Vector3( 26, 17, 0 );
var F = new THREE.Vector3( 26, 49, 0 );
var rc = 10;
var rd = 5;
var re = 5;
var rf = 5;
var thickness = 5;

function Plate(A, B, C, D, E, F, rc, rd, re, rf, thickness) {
	var self = this;

	var isPlateShapeBuilt = false;

	function buildPlateShape() {
		isPlateShapeBuilt = true;
	}

	//Shape is what you add to a scene (a.k.a. vtkActor)
	this.getPlateShape = function () {
		if( !isPlateShapeBuilt ) buildPlateShape();
		return plateShape;
	}
}

//var plate = new Plate( A, B, C, D, E, F, rc, rd, re, rf, thickness );

var calculateFillet = function(P1, P2, P3, r) {
	var vectorP2P1 = new THREE.Vector3( P1.x - P2.x, P1.y - P2.y, 0 );
	var vectorP2P3 = new THREE.Vector3( P3.x - P2.x, P3.y - P2.y, 0 );

	var axis = new THREE.Vector3();
	axis.crossVectors( vectorP2P3, vectorP2P1 );
	axis.normalize();

	var angleAlpha = vectorP2P1.angleTo( vectorP2P3 );
	var angleBeta = Math.PI - angleAlpha;
	var cotHalfAngleAlpha = 1 / Math.tan( angleAlpha / 2);
	var P2P4 = Math.abs( r * cotHalfAngleAlpha );
	var P2P5 = r * Math.sqrt( 1 + Math.pow( cotHalfAngleAlpha, 2 ) );

	var vectorP2P4 = new THREE.Vector3();
	vectorP2P4.copy( vectorP2P1 );
	vectorP2P4.setLength( P2P4 );

	var vectorP2P6 = new THREE.Vector3();
	vectorP2P6.copy( vectorP2P3 );
	vectorP2P6.setLength( P2P4 );

	var vectorP2P5 = new THREE.Vector3();
	vectorP2P5.addVectors( vectorP2P4, vectorP2P6 );
	vectorP2P5.setLength( P2P5 );

	var P4 = new THREE.Vector3();
	P4.addVectors( P2, vectorP2P4 );

	var P5 = new THREE.Vector3();
	P5.addVectors( P2, vectorP2P5 );

	var P6 = new THREE.Vector3();
	P6.addVectors( P2, vectorP2P6 );

	var output = [];
	output.push(P4);
	output.push(P5);
	output.push(P6);
	output.push(angleBeta);
	output.push(axis);

	return output;
};

var drawFillet = function (shape, P4, P5, P6, angleBeta, axis, deltaAngleBeta) {
	var i;

	var vectorP5P4 = new THREE.Vector3();
	vectorP5P4.subVectors( P4, P5 );

	var newP4 = new THREE.Vector3();

	for( i = 0; i < angleBeta; i += deltaAngleBeta ){
		vectorP5P4.applyAxisAngle(axis, deltaAngleBeta);
		newP4.addVectors( P5, vectorP5P4 );
		shape.lineTo( newP4.x, newP4.y );
	}
};

var getPlateShape = function (A, B, C, D, E, F, rc, rd, re, rf) {
	var shape = new THREE.Shape();
     
    shape.moveTo( A.x, A.y );
	shape.lineTo( B.x, B.y );

	var cFillet = calculateFillet( B, C, D, rc );
	shape.lineTo( cFillet[0].x, cFillet[0].y );
	drawFillet( shape, cFillet[0], cFillet[1], cFillet[2], cFillet[3], cFillet[4], Math.PI / 90 );

	var dFillet = calculateFillet( C, D, E, rd );
	shape.lineTo( dFillet[0].x, dFillet[0].y );
	drawFillet( shape, dFillet[0], dFillet[1], dFillet[2], dFillet[3], dFillet[4], Math.PI / 90 );

	var eFillet = calculateFillet( D, E, F, re );
	shape.lineTo( eFillet[0].x, eFillet[0].y );
	drawFillet( shape, eFillet[0], eFillet[1], eFillet[2], eFillet[3], eFillet[4], Math.PI / 90 );

	var fFillet = calculateFillet( E, F, A, rf );
	shape.lineTo( fFillet[0].x, fFillet[0].y );
	drawFillet( shape, fFillet[0], fFillet[1], fFillet[2], fFillet[3], fFillet[4], Math.PI / 90 );

    return shape;
};