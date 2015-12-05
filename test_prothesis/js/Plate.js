var calculateFillet = function(P1, P2, P3, r) {
	var vectorP2P1 = new THREE.Vector3( P1.x - P2.x, P1.y - P2.y, P1.z - P2.z );
	var vectorP2P3 = new THREE.Vector3( P3.x - P2.x, P3.y - P2.y, P3.z - P2.z );

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

var getFilletPoints = function (fillet, angleBetaPartitionNumber) {
	var P4 = fillet[0];
	var P5 = fillet[1];
	var P6 = fillet[2];
	var angleBeta = fillet[3];
	var deltaAngleBeta = angleBeta / angleBetaPartitionNumber;
	var axis = fillet[4];
	var i;
	var points = new Array();

	var vectorP5P4 = new THREE.Vector3();
	vectorP5P4.subVectors( P4, P5 );

	for( i = 0; i < angleBetaPartitionNumber; i++ ){
		var newP4 = new THREE.Vector3();
		vectorP5P4.applyAxisAngle(axis, deltaAngleBeta);
		newP4.addVectors( P5, vectorP5P4 );
		points.push(newP4);
	}
	return points;
};

function PlateParameters( prothesisParameters ) {
	this.pointsInContourForJunctionNumber = prothesisParameters.pointsInContourForJunctionNumber;
	this.point_A = new THREE.Vector3( 28, 57, 0 );
	this.point_B = new THREE.Vector3( 11, 57, 0 );
	this.point_C = new THREE.Vector3( 0, 45, 0 );
	this.point_D = new THREE.Vector3( 0, 0, 0 );
	this.point_E = new THREE.Vector3( 26, 17, 0 );
	this.point_F = new THREE.Vector3( 26, 49, 0 );
	this.point_C_FilletRadius = 10;
	this.point_D_FilletRadius = 5;
	this.point_E_FilletRadius = 5;
	this.point_F_FilletRadius = 5;
	this.contourFilletRadius = 0.5;
	this.thickness = 5;
	this.contourFilletSlicesNumber = 10;
	this.angleBetaPartitionNumber = 10;
	this.hole_G_Center = new THREE.Vector3( 5, 15, 0 );
	this.hole_G_Radius = 2;
}

function Plate(parameters) {
	this.pointsInContourForJunctionNumber = parameters.pointsInContourForJunctionNumber;
	//Plate's parameters initialization
	this.point_A = new THREE.Vector3();
	this.point_B = new THREE.Vector3();
	this.point_C = new THREE.Vector3();
	this.point_D = new THREE.Vector3();
	this.point_E = new THREE.Vector3();
	this.point_F = new THREE.Vector3();
	this.point_A.copy(parameters.point_A);
	this.point_B.copy(parameters.point_B);
	this.point_C.copy(parameters.point_C);
	this.point_D.copy(parameters.point_D);
	this.point_E.copy(parameters.point_E);
	this.point_F.copy(parameters.point_F);
	this.point_C_FilletRadius = parameters.point_C_FilletRadius;
	this.point_D_FilletRadius = parameters.point_D_FilletRadius;
	this.point_E_FilletRadius = parameters.point_E_FilletRadius;
	this.point_F_FilletRadius = parameters.point_F_FilletRadius;
	this.contourFilletRadius = parameters.contourFilletRadius;
	this.thickness = parameters.thickness;
	this.point_A1 = new THREE.Vector3();
	this.point_B1 = new THREE.Vector3();
	this.point_C1 = new THREE.Vector3();
	this.point_D1 = new THREE.Vector3();
	this.point_E1 = new THREE.Vector3();
	this.point_F1 = new THREE.Vector3();
	this.point_C1_FilletRadius = 0;
	this.point_D1_FilletRadius = 0;
	this.point_E1_FilletRadius = 0;
	this.point_F1_FilletRadius = 0;
	this.contourFilletSlicesNumber = parameters.contourFilletSlicesNumber;
	this.contourFilletSlices = new Array();
	this.angleBetaPartitionNumber = parameters.angleBetaPartitionNumber;
	this.firstContourFilletSlice = new Array();
	this.lastContourFilletSlice = new Array();
	this.plateMesh = new THREE.Mesh();
	this.material = new THREE.MeshNormalMaterial();
	//this.material.side = THREE.DoubleSide;
	this.plateMesh.material = this.material;
	this.firstFaceMesh = new THREE.Mesh();
	this.firstFaceMesh.material = this.material;
	this.hole_G_Center = parameters.hole_G_Center;
	this.hole_G_Radius = parameters.hole_G_Radius;
	this.plateMirroredMesh = new THREE.Mesh();
	this.plateMirroredMesh.material = this.material;
	this.secondFaceMesh = new THREE.Mesh();
	this.secondFaceMesh.material = this.material;
	this.lateralFaceMesh = new THREE.Mesh();
	this.lateralFaceMesh.material = this.material;
	//Build plate
	this.build();
}

Plate.prototype.build = function() {
	this.plateMesh.geometry = new THREE.Geometry();
	this.plateMirroredMesh.geometry = new THREE.Geometry();
	this.lateralFaceMesh.geometry = new THREE.Geometry();
	this.buildScaledContour();
	this.buildContourFillet();
	this.buildFirstFace();
	this.buildSecondFace();
	this.buildMirroredContourFillet();
	this.buildLateralFace();
	this.generatePointsForJunction();
};

Plate.prototype.buildScaledContour = function() {
	//A1
	var vector_AB = new THREE.Vector3();
	vector_AB.subVectors(this.point_B, this.point_A);
	var vector_AF = new THREE.Vector3();
	vector_AF.subVectors(this.point_F, this.point_A);
	var angle_AB_AF = vector_AB.angleTo(vector_AF);
	var AA1 = this.contourFilletRadius / Math.sin(angle_AB_AF);
	var vector_AA1 = new THREE.Vector3();
	vector_AA1.copy(vector_AB);
	vector_AA1.setLength(AA1);
	this.point_A1.addVectors(this.point_A, vector_AA1);

	//B1
	var vector_CB = new THREE.Vector3();
	vector_CB.subVectors(this.point_B, this.point_C);
	var vector_BA = new THREE.Vector3();
	vector_BA.subVectors(this.point_A, this.point_B);
	var angle_CB_BA = vector_CB.angleTo(vector_BA);
	var BB1 = this.contourFilletRadius / Math.sin(angle_CB_BA);
	var vector_BB1 = new THREE.Vector3();
	vector_BB1.copy(vector_BA);
	vector_BB1.setLength(BB1);
	this.point_B1.addVectors(this.point_B, vector_BB1);

	//C1
	this.point_C1 = calculateFillet(this.point_B, this.point_C, this.point_D, this.contourFilletRadius)[1];

	//D1
	this.point_D1 = calculateFillet(this.point_C, this.point_D, this.point_E, this.contourFilletRadius)[1];

	//E1
	this.point_E1 = calculateFillet(this.point_D, this.point_E, this.point_F, this.contourFilletRadius)[1];

	//F1 получается отражением центра скругления относительно точки F
	var point_F_FilletCenter = calculateFillet(this.point_E, this.point_F, this.point_A, this.contourFilletRadius)[1];
	var vectorFromPoint_F_FilletCenterToPoint_F = new THREE.Vector3();
	vectorFromPoint_F_FilletCenterToPoint_F.subVectors(this.point_F, point_F_FilletCenter);
	this.point_F1.addVectors(this.point_F, vectorFromPoint_F_FilletCenterToPoint_F);

	this.point_C1_FilletRadius = this.point_C_FilletRadius - this.contourFilletRadius;
	this.point_D1_FilletRadius = this.point_D_FilletRadius - this.contourFilletRadius;
	this.point_E1_FilletRadius = this.point_E_FilletRadius - this.contourFilletRadius;
	this.point_F1_FilletRadius = this.point_F_FilletRadius + this.contourFilletRadius;
};

Plate.prototype.buildContourFillet = function() {
	this.point_A.setZ(this.contourFilletRadius);
	this.point_B.setZ(this.contourFilletRadius);
	this.point_C.setZ(this.contourFilletRadius);
	this.point_D.setZ(this.contourFilletRadius);
	this.point_E.setZ(this.contourFilletRadius);
	this.point_F.setZ(this.contourFilletRadius);
	this.point_A1.setZ(0);
	this.point_B1.setZ(0);
	this.point_C1.setZ(0);
	this.point_D1.setZ(0);
	this.point_E1.setZ(0);
	this.point_F1.setZ(0);

	this.buildFirstContourFilletSlice();
	this.buildLastContourFilletSlice();
	this.calculateContourFilletSlicesNumber();
	this.contourFilletSliceRotationAngle = Math.PI / (2 * (this.contourFilletSlicesNumber + 1));
	
	var i, j;
	
	this.contourFilletSlices.length = 0;
	for(i = 0; i < this.contourFilletSlicesNumber + 2; i++) {
		this.contourFilletSlices[i] = new Array();
	}
	
	this.contourFilletSlices[0] = this.firstContourFilletSlice;
	
	//Building contour fillet points between A and A1, B and B1 as points on an ellipse
	for(i = 0; i < 2; i++) {
		var point_O = new THREE.Vector3();
		point_O.setX(this.firstContourFilletSlice[i].x);
		point_O.setY(this.firstContourFilletSlice[i].y);
		point_O.setZ(this.lastContourFilletSlice[i].z);
		var vector_OP1 = new THREE.Vector3();
		vector_OP1.subVectors(this.firstContourFilletSlice[i], point_O);
		var vector_OP = new THREE.Vector3();
		vector_OP.subVectors(this.lastContourFilletSlice[i], point_O);
		var axis = new THREE.Vector3();
		axis.crossVectors( vector_OP1, vector_OP );
		axis.normalize();
		
		for(j = 0; j < this.contourFilletSlicesNumber; j++) {
			var newPoint_P1 = new THREE.Vector3();
			var newVector_OP1 = new THREE.Vector3();
			newVector_OP1.copy(vector_OP1);
			newVector_OP1.applyAxisAngle(axis, (j + 1) * this.contourFilletSliceRotationAngle);
			//calculate newVector_OP1 size
			var a = vector_OP.length();
			var b = vector_OP1.length();
			var phi = ( 3 / 2 ) * Math.PI + (j + 1) * this.contourFilletSliceRotationAngle;
			var ro = ( a * b ) / ( Math.sqrt( Math.pow( ( a * Math.sin( phi ) ), 2 )  + Math.pow( ( b * Math.cos( phi ) ), 2 ) ) );
			newVector_OP1.setLength(ro);
			newPoint_P1.addVectors( point_O, newVector_OP1 );
			this.contourFilletSlices[j + 1].push(newPoint_P1);
		}
	}
	//Building contour fillet points between first and last contour fillet slices
	//i starts from 2 since we get points between A and A1, B and B1 as points on ellipse
	for(i = 2; i < this.firstContourFilletSlice.length; i++) {
		var point_O = new THREE.Vector3();
		point_O.setX(this.firstContourFilletSlice[i].x);
		point_O.setY(this.firstContourFilletSlice[i].y);
		point_O.setZ(this.lastContourFilletSlice[i].z);
		var vector_OP1 = new THREE.Vector3();
		vector_OP1.subVectors(this.firstContourFilletSlice[i], point_O);
		var vector_OP = new THREE.Vector3();
		vector_OP.subVectors(this.lastContourFilletSlice[i], point_O);
		var axis = new THREE.Vector3();
		axis.crossVectors( vector_OP1, vector_OP );
		axis.normalize();
		for(j = 0; j < this.contourFilletSlicesNumber; j++) {
			var newPoint_P1 = new THREE.Vector3();
			var newVector_OP1 = new THREE.Vector3();
			newVector_OP1.copy(vector_OP1);
			newVector_OP1.applyAxisAngle(axis, (j + 1) * this.contourFilletSliceRotationAngle);
			newPoint_P1.addVectors( point_O, newVector_OP1 );
			this.contourFilletSlices[j + 1].push(newPoint_P1);
		}
	}
	
	this.contourFilletSlices[this.contourFilletSlicesNumber + 1] = this.lastContourFilletSlice;

	for(i = 0; i < this.contourFilletSlicesNumber + 2; i++) {
		for(j = 0; j < this.contourFilletSlices[i].length; j++) {
			this.plateMesh.geometry.vertices.push(this.contourFilletSlices[i][j]);
		}
	}
	
	for(i = 0; i < this.contourFilletSlices.length - 1; i++) {
		for(j = 0; j < this.contourFilletSlices[i].length - 1; j++) {
			var firstPointOfFirstTriangleIndex = i * this.contourFilletSlices[i].length + j;
	    	var secondPointOfFirstTriangleIndex = i * this.contourFilletSlices[i].length + j + 1;
	    	var thirdPointOfFirstTriangleIndex = (i + 1) * this.contourFilletSlices[i].length + j + 1;
	    	this.plateMesh.geometry.faces.push( new THREE.Face3( firstPointOfFirstTriangleIndex, secondPointOfFirstTriangleIndex, thirdPointOfFirstTriangleIndex ) );
	    	var firstPointOfSecondTriangleIndex = i * this.contourFilletSlices[i].length + j;
	    	var secondPointOfSecondTriangleIndex = (i + 1) * this.contourFilletSlices[i].length + j + 1;
	    	var thirdPointOfSecondTriangleIndex = (i + 1) * this.contourFilletSlices[i].length + j;
	    	this.plateMesh.geometry.faces.push( new THREE.Face3( firstPointOfSecondTriangleIndex, secondPointOfSecondTriangleIndex, thirdPointOfSecondTriangleIndex ) );
		}
	}

	for(i = 0; i < this.contourFilletSlices.length - 1; i++) {
		var firstPointOfFirstTriangleIndex = i * this.contourFilletSlices[i].length;
		var secondPointOfFirstTriangleIndex = (i + 1) * this.contourFilletSlices[i].length;
		var thirdPointOfFirstTriangleIndex = i * this.contourFilletSlices[i].length + this.contourFilletSlices[i].length - 1;
		this.plateMesh.geometry.faces.push( new THREE.Face3( firstPointOfFirstTriangleIndex, secondPointOfFirstTriangleIndex, thirdPointOfFirstTriangleIndex ) );

		var firstPointOfSecondTriangleIndex = (i + 1) * this.contourFilletSlices[i].length;
        var secondPointOfSecondTriangleIndex = (i + 1) * this.contourFilletSlices[i].length + this.contourFilletSlices[i].length - 1;
        var thirdPointOfSecondTriangleIndex = i * this.contourFilletSlices[i].length + this.contourFilletSlices[i].length - 1;
        this.plateMesh.geometry.faces.push( new THREE.Face3( firstPointOfSecondTriangleIndex, secondPointOfSecondTriangleIndex, thirdPointOfSecondTriangleIndex ) );
	}

	this.plateMesh.geometry.computeFaceNormals();
};

Plate.prototype.buildFirstContourFilletSlice = function() {
	this.firstContourFilletSlice.length = 0;
	this.firstContourFilletSlice.push(this.point_A1);
	this.firstContourFilletSlice.push(this.point_B1);
	
	var point_C1_Fillet = calculateFillet(this.point_B1, this.point_C1, this.point_D1, this.point_C1_FilletRadius);
	this.firstContourFilletSlice.push(point_C1_Fillet[0]);
	
	this.firstContourFilletSlice = this.firstContourFilletSlice.concat( getFilletPoints(point_C1_Fillet, this.angleBetaPartitionNumber) );
	var point_D1_Fillet = calculateFillet(this.point_C1, this.point_D1, this.point_E1, this.point_D1_FilletRadius);
	this.firstContourFilletSlice.push(point_D1_Fillet[0]);
	this.firstContourFilletSlice = this.firstContourFilletSlice.concat( getFilletPoints(point_D1_Fillet, this.angleBetaPartitionNumber) );
	
	var point_E1_Fillet = calculateFillet(this.point_D1, this.point_E1, this.point_F1, this.point_E1_FilletRadius);
	this.firstContourFilletSlice.push(point_E1_Fillet[0]);
	this.firstContourFilletSlice = this.firstContourFilletSlice.concat( getFilletPoints(point_E1_Fillet, this.angleBetaPartitionNumber) );
	
	var point_F1_Fillet = calculateFillet(this.point_E1, this.point_F1, this.point_A1, this.point_F1_FilletRadius);
	this.firstContourFilletSlice.push(point_F1_Fillet[0]);
	this.firstContourFilletSlice = this.firstContourFilletSlice.concat( getFilletPoints(point_F1_Fillet, this.angleBetaPartitionNumber) );
};

Plate.prototype.buildLastContourFilletSlice = function() {
	this.lastContourFilletSlice.length = 0;
	this.lastContourFilletSlice.push(this.point_A);
	this.lastContourFilletSlice.push(this.point_B);
	
	var point_C_Fillet = calculateFillet(this.point_B, this.point_C, this.point_D, this.point_C_FilletRadius);
	this.lastContourFilletSlice.push(point_C_Fillet[0]);
	this.lastContourFilletSlice = this.lastContourFilletSlice.concat( getFilletPoints(point_C_Fillet, this.angleBetaPartitionNumber) );
	
	var point_D_Fillet = calculateFillet(this.point_C, this.point_D, this.point_E, this.point_D_FilletRadius);
	this.lastContourFilletSlice.push(point_D_Fillet[0]);
	this.lastContourFilletSlice = this.lastContourFilletSlice.concat( getFilletPoints(point_D_Fillet, this.angleBetaPartitionNumber) );
	
	var point_E_Fillet = calculateFillet(this.point_D, this.point_E, this.point_F, this.point_E_FilletRadius);
	this.lastContourFilletSlice.push(point_E_Fillet[0]);
	this.lastContourFilletSlice = this.lastContourFilletSlice.concat( getFilletPoints(point_E_Fillet, this.angleBetaPartitionNumber) );
	
	var point_F_Fillet = calculateFillet(this.point_E, this.point_F, this.point_A, this.point_F_FilletRadius);
	this.lastContourFilletSlice.push(point_F_Fillet[0]);
	this.lastContourFilletSlice = this.lastContourFilletSlice.concat( getFilletPoints(point_F_Fillet, this.angleBetaPartitionNumber) );
};

Plate.prototype.buildFirstFace = function() {
	var firstFaceShape = new THREE.Shape();
	var i;
	firstFaceShape.moveTo( this.point_A1.x, this.point_A1.y );
	firstFaceShape.lineTo( this.point_B1.x, this.point_B1.y );
	for(i = 2; i < this.firstContourFilletSlice.length; i++) {
		firstFaceShape.lineTo( this.firstContourFilletSlice[i].x, this.firstContourFilletSlice[i].y );
	}
	var holeG = new THREE.Path();
    holeG.absarc(this.hole_G_Center.x, this.hole_G_Center.y, this.hole_G_Radius, 0, Math.PI * 2, true);
    firstFaceShape.holes.push(holeG);
	var firstFaceGeometry = new THREE.ShapeGeometry( firstFaceShape );
	for(i = 0; i < firstFaceGeometry.vertices.length; i++) {
		firstFaceGeometry.vertices[i].setZ(this.thickness);
	}
	this.firstFaceMesh.geometry = firstFaceGeometry;
};

Plate.prototype.buildSecondFace = function() {
	var secondFaceGeometry = new THREE.Geometry();
	secondFaceGeometry.copy(this.firstFaceMesh.geometry);
	for(i = 0; i < secondFaceGeometry.vertices.length; i++) {
		secondFaceGeometry.vertices[i].setZ( 0 );
	}

	for ( var i = 0; i < secondFaceGeometry.faces.length; i ++ ) {
    	var face = secondFaceGeometry.faces[ i ];
    	var temp = face.a;
    	face.a = face.c;
    	face.c = temp;
    }

	secondFaceGeometry.computeFaceNormals();
	secondFaceGeometry.computeVertexNormals();

	//var faceVertexUvs = secondFaceGeometry.faceVertexUvs[ 0 ];
	//for ( var i = 0; i < faceVertexUvs.length; i++ ) {
   	//	var temp = faceVertexUvs[ i ][ 0 ];
    //	faceVertexUvs[ i ][ 0 ] = faceVertexUvs[ i ][ 2 ];
    //	faceVertexUvs[ i ][ 2 ] = temp;
    //}

	this.secondFaceMesh.geometry = secondFaceGeometry;
};

Plate.prototype.buildMirroredContourFillet = function() {
	this.plateMirroredMesh.geometry.copy(this.plateMesh.geometry);
	var mirrorMatrix = new THREE.Matrix4();
	mirrorMatrix.makeScale(1, 1, -1);

	var translateMatrix = new THREE.Matrix4();
	translateMatrix.makeTranslation(0, 0, -this.thickness);

	var combinedMatrix = new THREE.Matrix4();
	combinedMatrix.multiplyMatrices( mirrorMatrix, translateMatrix );
	this.plateMirroredMesh.geometry.applyMatrix( combinedMatrix );

	for ( var i = 0; i < this.plateMirroredMesh.geometry.faces.length; i ++ ) {
    	var face = this.plateMirroredMesh.geometry.faces[ i ];
    	var temp = face.a;
    	face.a = face.c;
    	face.c = temp;
    }
};

Plate.prototype.buildLateralFace = function () {
	var pointsNumber = this.lastContourFilletSlice.length;
	var startIndex = this.plateMesh.geometry.vertices.length - pointsNumber;
	var i;
	for(i = startIndex; i < startIndex + pointsNumber; i++) {
		this.lateralFaceMesh.geometry.vertices.push( this.plateMesh.geometry.vertices[i] );
	}
	for(i = startIndex; i < startIndex + pointsNumber; i++) {
		this.lateralFaceMesh.geometry.vertices.push( this.plateMirroredMesh.geometry.vertices[i] );
	}
	
	for(i = 0; i < pointsNumber - 1; i++) {
		var firstPointOfFirstTriangleIndex = i;
		var secondPointOfFirstTriangleIndex = i + 1;
		var thirdPointOfFirstTriangleIndex = pointsNumber + i + 1;
		this.lateralFaceMesh.geometry.faces.push( new THREE.Face3( firstPointOfFirstTriangleIndex, secondPointOfFirstTriangleIndex, thirdPointOfFirstTriangleIndex ) );
		var firstPointOfSecondTriangleIndex = i;
		var secondPointOfSecondTriangleIndex = pointsNumber + i + 1;
		var thirdPointOfSecondTriangleIndex = pointsNumber + i;
		this.lateralFaceMesh.geometry.faces.push( new THREE.Face3( firstPointOfSecondTriangleIndex, secondPointOfSecondTriangleIndex, thirdPointOfSecondTriangleIndex ) );
	}

	var firstPointOfFirstTriangleIndex = pointsNumber - 1;
	var secondPointOfFirstTriangleIndex = 0;
	var thirdPointOfFirstTriangleIndex = pointsNumber;
	var firstPointOfSecondTriangleIndex = pointsNumber - 1;
	var secondPointOfSecondTriangleIndex = pointsNumber;
	var thirdPointOfSecondTriangleIndex = pointsNumber + pointsNumber - 1;
	this.lateralFaceMesh.geometry.faces.push( new THREE.Face3( firstPointOfFirstTriangleIndex, secondPointOfFirstTriangleIndex, thirdPointOfFirstTriangleIndex ) );
	this.lateralFaceMesh.geometry.faces.push( new THREE.Face3( firstPointOfSecondTriangleIndex, secondPointOfSecondTriangleIndex, thirdPointOfSecondTriangleIndex ) );

	this.lateralFaceMesh.geometry.computeFaceNormals();
};

Plate.prototype.getContourForJunction = function () {

};

Plate.prototype.calculateContourFilletSlicesNumber = function () {
	var x, y, z;
	x = this.firstContourFilletSlice[1].x;
	y = this.firstContourFilletSlice[1].y;
	z = this.firstContourFilletSlice[1].z;
	this.junctionContourPoint_A = new THREE.Vector3( x, y, z );
	x = this.firstContourFilletSlice[0].x;
	y = this.firstContourFilletSlice[0].y;
	z = this.firstContourFilletSlice[0].z;
	this.junctionContourPoint_B = new THREE.Vector3( x, y, z );
	x = this.lastContourFilletSlice[0].x;
	y = this.lastContourFilletSlice[0].y;
	z = this.lastContourFilletSlice[0].z;
	this.junctionContourPoint_D = new THREE.Vector3( x, y, z );
	x = this.junctionContourPoint_D.x;
	y = this.junctionContourPoint_D.y;//no matter
	z = this.junctionContourPoint_B.z;
	this.junctionContourPoint_C = new THREE.Vector3( x, y, z );
	
	this.junctionContourPoint_E = new THREE.Vector3();
	this.junctionContourPoint_E.copy( this.junctionContourPoint_D );
	var mirrorMatrix = new THREE.Matrix4();
	mirrorMatrix.makeScale(1, 1, -1);

	var translateMatrix = new THREE.Matrix4();
	translateMatrix.makeTranslation(0, 0, -this.thickness);

	var combinedMatrix = new THREE.Matrix4();
	combinedMatrix.multiplyMatrices( mirrorMatrix, translateMatrix );
	this.junctionContourPoint_E.applyMatrix4( combinedMatrix );
	
	var a = new THREE.Vector3();
	a.subVectors( this.junctionContourPoint_B, this.junctionContourPoint_A );
	var l_a = a.length();
	
	var b = new THREE.Vector3();
	b.subVectors( this.junctionContourPoint_C, this.junctionContourPoint_B );
	var c = new THREE.Vector3();
	c.subVectors( this.junctionContourPoint_D, this.junctionContourPoint_C );
	var l_b_plus_c = b.length() + c.length();

	var d = new THREE.Vector3();
	d.subVectors( this.junctionContourPoint_E, this.junctionContourPoint_D );
	var l_d = d.length();

	var aPointsNumber = Math.floor(
		( l_a * this.pointsInContourForJunctionNumber ) / ( 2 * ( l_a + 2 * l_b_plus_c + l_d ) ) );
	var b_plus_cPointsNumber = Math.floor( ( this.pointsInContourForJunctionNumber * l_b_plus_c ) / ( 2 * ( l_a + 2 * l_b_plus_c + l_d ) ) );
	var dPointsNumber = this.pointsInContourForJunctionNumber / 2 - aPointsNumber - 2 * b_plus_cPointsNumber;

	this.aPointsNumber = aPointsNumber;
	this.dPointsNumber = dPointsNumber;
	this.contourFilletSlicesNumber = b_plus_cPointsNumber - 1;
};

Plate.prototype.generatePointsForJunction = function () {
	this.pointsForJunction = new Array();
	var i;
	for( i = 0; i < this.contourFilletSlices.length - 1; i++) {
		var newPoint = new THREE.Vector3();
		newPoint.copy( this.contourFilletSlices[i][0] );
		this.pointsForJunction.push( newPoint );
	}

	var line_DE = new THREE.LineCurve3( this.junctionContourPoint_D, this.junctionContourPoint_E );
	var pointsOnLine_DE = new Array();
	pointsOnLine_DE = line_DE.getPoints( this.dPointsNumber );
	pointsOnLine_DE.pop();
	this.pointsForJunction = this.pointsForJunction.concat( pointsOnLine_DE );

	for( i = this.contourFilletSlicesNumber + 1; i >= 0 ; i-- ) {
		var newPoint = new THREE.Vector3();
		newPoint.copy( this.plateMirroredMesh.geometry.vertices[ i * this.firstContourFilletSlice.length ] );
		this.pointsForJunction.push( newPoint );
	}

	this.junctionContourPoint_F = new THREE.Vector3();
	this.junctionContourPoint_F.copy( this.pointsForJunction.pop() );
	this.junctionContourPoint_G = new THREE.Vector3();
	this.junctionContourPoint_G.copy(
		this.plateMirroredMesh.geometry.vertices[1] );
	var line_FG = new THREE.LineCurve3( this.junctionContourPoint_F, this.junctionContourPoint_G );
	var pointsOnLine_FG = new Array();
	pointsOnLine_FG = line_FG.getPoints( this.aPointsNumber );
	pointsOnLine_FG.pop();
	this.pointsForJunction = this.pointsForJunction.concat( pointsOnLine_FG );

	for( i = 0; i < this.contourFilletSlicesNumber + 2 ; i++ ) {
		var newPoint = new THREE.Vector3();
		newPoint.copy( this.plateMirroredMesh.geometry.vertices[ i * this.firstContourFilletSlice.length + 1 ] );
		this.pointsForJunction.push( newPoint );
	}

	this.junctionContourPoint_H = new THREE.Vector3();
	this.junctionContourPoint_H.copy( this.pointsForJunction.pop() );
	this.junctionContourPoint_I = new THREE.Vector3();
	this.junctionContourPoint_I.copy( this.lastContourFilletSlice[1] );
	var line_HI = new THREE.LineCurve3( this.junctionContourPoint_H, this.junctionContourPoint_I );
	var pointsOnLine_HI = new Array();
	pointsOnLine_HI = line_HI.getPoints( this.dPointsNumber );
	pointsOnLine_HI.pop();
	this.pointsForJunction = this.pointsForJunction.concat( pointsOnLine_HI );

	for( i = this.contourFilletSlices.length - 1; i >= 1; i--) {
		var newPoint = new THREE.Vector3();
		newPoint.copy( this.contourFilletSlices[i][1] );
		this.pointsForJunction.push( newPoint );
	}

	var line_AB = new THREE.LineCurve3( this.junctionContourPoint_A, this.junctionContourPoint_B );
	var pointsOnLine_AB = new Array();
	pointsOnLine_AB = line_AB.getPoints( this.aPointsNumber );
	pointsOnLine_AB.pop();
	this.pointsForJunction = this.pointsForJunction.concat( pointsOnLine_AB );
	console.log(this.pointsForJunction.length);
};

exports.PlateParameters = PlateParameters;
exports.Plate = Plate;