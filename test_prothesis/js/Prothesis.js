var plate = require('./Plate.js');
var Plate = plate.Plate;
var PlateParameters = plate.PlateParameters;

var head = require('./Head.js');
var Head = head.Head;
var HeadParameters = head.HeadParameters;

var junction = require('./Junction.js');
var Junction = junction.Junction;

function Prothesis() {
	this.parameters = new ProthesisParameters();
	this.plate = new Plate( this.parameters.plateParameters );
	this.head = new Head( this.parameters.headParameters );
	var point9 = new THREE.Vector3( 1, 0, 1 );
	var point10 = new THREE.Vector3( 5, 0, 3 );
	var point11 = new THREE.Vector3( 8, 0, 7 );
	var point12 = new THREE.Vector3( 5, 0, 10 );
	var curve = new THREE.CubicBezierCurve3( point9, point10, point11, point12 );
	this.junction = new Junction( this.plate.pointsForJunction, this.head.pointsForJunction, 100, curve );
	this.junctionMesh = this.junction.getJunction();
}

function ProthesisParameters() {
	this.pointsInContourForJunctionNumber = 400;//a number divisible by 4 is required
	this.plateParameters = new PlateParameters( this );
	this.headParameters = new HeadParameters( this );
}

exports.Prothesis = Prothesis;