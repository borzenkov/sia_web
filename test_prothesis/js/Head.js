function HeadParameters( prothesisParameters ) {
    this.pointsInContourForJunctionNumber = prothesisParameters.pointsInContourForJunctionNumber;
    this.pointsInGeneratorNumber = (this.pointsInContourForJunctionNumber + 2) / 2;
	this.length = 22;
	this.headControlPointsNumber = 1;
	this.headGeneratorFragmentPointsNumber = Math.ceil(this.pointsInGeneratorNumber / ( this.headControlPointsNumber + 1 ));
	this.segments = 10;
	this.phiStart = 0;
	this.phiLength = 2 * Math.PI;
	this.headCanvasScaleRate = 10;
}

function Head(parameters) {
	this.length = parameters.length;
    this.headControlPointsNumber = 3 * parameters.headControlPointsNumber;
    this.headGeneratorFragmentPointsNumber = parameters.headGeneratorFragmentPointsNumber;
    this.segments = parameters.segments;
	this.phiStart = parameters.phiStart;
	this.phiLength = parameters.phiLength;
	this.headCanvasScaleRate = parameters.headCanvasScaleRate;
    var firstPoint = new THREE.Vector3(0, 0, 0);
    var secondPoint = new THREE.Vector3(this.length / 4, 0, 0);
    var nextToLastPoint = new THREE.Vector3(this.length / 4, 0, this.length);
    var lastPoint = new THREE.Vector3(0, 0, this.length);
    var deltaX = this.length / (this.headControlPointsNumber + 1);
    var i;
    this.cubicPoints = new Array();
    this.cubicPoints.push(firstPoint);
    this.cubicPoints.push(secondPoint);
    for(i = 0; i < this.headControlPointsNumber; i++) {
        this.cubicPoints.push(new THREE.Vector3(this.length / 4, 0, (i + 1) * deltaX));
    }
    this.cubicPoints.push(nextToLastPoint);
    this.cubicPoints.push(lastPoint);

    this.cubicPointsForCanvas = new Array();
    for(i = 0; i < this.cubicPoints.length; i++) {
    	var x = this.cubicPoints[i].z;
    	var y = this.cubicPoints[i].x;
    	var pointForCanvas = new THREE.Vector3(this.headCanvasScaleRate * x, this.headCanvasScaleRate * y, 0);
    	this.cubicPointsForCanvas.push( pointForCanvas );
    }

    this.v0 = new THREE.Vector3(0, 0, 0);
    this.v1 = new THREE.Vector3(0, 0, 0);
    this.v2 = new THREE.Vector3(0, 0, 0);
    this.v3 = new THREE.Vector3(0, 0, 0);
	this.curve = new THREE.CubicBezierCurve3(this.v0, this.v1, this.v2, this.v3);
	this.headMesh = new THREE.Mesh();
	this.material = new THREE.MeshNormalMaterial();
	this.headMesh.material = this.material;

	this.build();
}

Head.prototype.generateHeadGeneratorPoints = function() {
	var lastHeadGeneratorPoint;
	for(i = 0; i < this.cubicPoints.length - 1; i += 3) {
        this.v0.set(this.cubicPoints[i].x, this.cubicPoints[i].y, this.cubicPoints[i].z);
        this.v1.set(this.cubicPoints[i + 1].x, this.cubicPoints[i + 1].y, this.cubicPoints[i + 1].z);
        this.v2.set(this.cubicPoints[i + 2].x, this.cubicPoints[i + 2].y, this.cubicPoints[i + 2].z);
        this.v3.set(this.cubicPoints[i + 3].x, this.cubicPoints[i + 3].y, this.cubicPoints[i + 3].z);
        this.headGeneratorPoints = this.headGeneratorPoints.concat(
            this.curve.getPoints(this.headGeneratorFragmentPointsNumber - 1));
        lastHeadGeneratorPoint = this.headGeneratorPoints.pop();
    }
    this.headGeneratorPoints.push(lastHeadGeneratorPoint);
};

Head.prototype.build = function() {
	this.convertCanvasPointsTo3DPoints();
	this.headGeneratorPoints = new Array();
    this.pointsForJunction = new Array();
	this.generateHeadGeneratorPoints();
	this.headMesh.geometry = new THREE.LatheGeometry(this.headGeneratorPoints, this.segments, this.phiStart, this.phiLength);
    this.generatePointsForJunction();
};

Head.prototype.convertCanvasPointsTo3DPoints = function() {
	for(i = 0; i < this.cubicPointsForCanvas.length; i++) {
    	var x = this.cubicPointsForCanvas[i].y / this.headCanvasScaleRate;
    	var y = 0;
    	var z = this.cubicPointsForCanvas[i].x / this.headCanvasScaleRate;
    	var normalPoint = new THREE.Vector3(x, y, z);
    	this.cubicPoints[i].copy(normalPoint);
    }
};

Head.prototype.initializeWidget = function(canvas) {
    this.canvas = canvas;
    this.cubicGraphics = this.canvas.getContext("2d");
};

Head.prototype.drawWidget = function() {
	var cubicPoints = this.cubicPointsForCanvas;
    var i;
    this.cubicGraphics.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.cubicGraphics.fillStyle = "white";
    this.cubicGraphics.fillRect(0,0,600,600);
    if (true) {
        this.cubicGraphics.lineWidth = 1;
        if (true) {
            this.cubicGraphics.strokeStyle = "#880000";
        }
        else {
            this.cubicGraphics.strokeStyle = "#888888";
        }
        for (i = 0; i < cubicPoints.length - 1; i++) {
            if (i % 3 != 1) {
                this.cubicGraphics.beginPath();
                this.cubicGraphics.moveTo( cubicPoints[i].x + .5, cubicPoints[i].y + .5 );
                this.cubicGraphics.lineTo( cubicPoints[i+1].x + .5, cubicPoints[i+1].y + .5 );
                this.cubicGraphics.stroke();
            }
        }
        for (i = 0; i < cubicPoints.length; i++) {
            this.cubicGraphics.fillStyle="black";
            this.disk(this.cubicGraphics, cubicPoints[i].x, cubicPoints[i].y, 5);
        }
    }
    this.cubicGraphics.beginPath();
    this.cubicGraphics.moveTo(cubicPoints[0].x,cubicPoints[0].y);
    for (i = 1; i < cubicPoints.length; i += 3) {
        this.cubicGraphics.bezierCurveTo(cubicPoints[i].x,cubicPoints[i].y,
            cubicPoints[i+1].x,cubicPoints[i+1].y,
            cubicPoints[i+2].x,cubicPoints[i+2].y);
    }
    this.cubicGraphics.lineWidth = 2;
    this.cubicGraphics.strokeStyle = "black";
    this.cubicGraphics.stroke();
};

Head.prototype.disk = function( graphics, x, y, radius ) {
    graphics.beginPath();
    graphics.arc(x,y,radius,0,Math.PI*2);
    graphics.fill();
};

Head.prototype.generatePointsForJunction = function () {
    this.pointsForJunction = new Array();
    var i;
    for( i = 0; i < this.headGeneratorPoints.length; i++ ) {
        var x = this.headGeneratorPoints[i].x;
        var y = this.headGeneratorPoints[i].y;
        var z = this.headGeneratorPoints[i].z;
        var copiedPoint = new THREE.Vector3( x, y, z );
        this.pointsForJunction.push( copiedPoint );
    }

    for( i = this.headGeneratorPoints.length - 2; i >= 1; i-- ) {
        var x = -this.headGeneratorPoints[i].x;
        var y = this.headGeneratorPoints[i].y;
        var z = this.headGeneratorPoints[i].z;
        var mirroredPoint = new THREE.Vector3( x, y, z );
        this.pointsForJunction.push( mirroredPoint );
    }

    var x = this.headMesh.position.x;
    var y = this.headMesh.position.y;
    var z = this.headMesh.position.z;
    var translationVector = new THREE.Vector3( x, y, z );

    for( i = 0; i < this.pointsForJunction.length; i++ ) {
        this.pointsForJunction[i].addVectors( this.pointsForJunction[i], translationVector );
    }
    console.log(this.pointsForJunction.length);
};

exports.HeadParameters = HeadParameters;
exports.Head = Head;