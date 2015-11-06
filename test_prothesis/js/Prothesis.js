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

function PlateParameters() {
	//Plate parameters
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
	this.thickness = 10;
	this.contourFilletSlicesNumber = 100;
	this.angleBetaPartitionNumber = 10;
}

function Plate(parameters, scene) {
	this.scene = scene;
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
	this.contourFilletSliceRotationAngle = Math.PI / (2 * (this.contourFilletSlicesNumber + 1));
	//Build plate
	this.build();
}

Plate.prototype.build = function() {
	this.buildScaledContour();
	this.buildContourFillet();
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
	
	var i, j;
	for(i = 0; i < this.contourFilletSlicesNumber + 2; i++) {
		this.contourFilletSlices[i] = new Array();
	}

	this.buildFirstContourFilletSlice();
	this.buildLastContourFilletSlice();

	////Show first contour fillet slice
	//var firstContourFilletSliceGeometry = new THREE.Geometry();
	//for(i = 0; i < this.firstContourFilletSlice.length; i++) {
	//	firstContourFilletSliceGeometry.vertices.push(this.firstContourFilletSlice[i]);
	//}
	//var firstContourFilletSliceMaterial = new THREE.PointsMaterial( { size: 3, color: 0x000000, sizeAttenuation: false } );
	//var firstContourFilletSliceCloud = new THREE.Points( firstContourFilletSliceGeometry, firstContourFilletSliceMaterial );
	//scene.add( firstContourFilletSliceCloud );
//
	////Show last contour fillet slice
	//var lastContourFilletSliceGeometry = new THREE.Geometry();
	//for(i = 0; i < this.lastContourFilletSlice.length; i++) {
	//	lastContourFilletSliceGeometry.vertices.push(this.lastContourFilletSlice[i]);
	//}
	//var lastContourFilletSliceMaterial = new THREE.PointsMaterial( { size: 3, color: 0xB20000, sizeAttenuation: false } );
	//var lastContourFilletSliceCloud = new THREE.Points( lastContourFilletSliceGeometry, lastContourFilletSliceMaterial );
	//scene.add( lastContourFilletSliceCloud );
	
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

	var dotGeometry = new THREE.Geometry();
	for(i = 0; i < this.contourFilletSlicesNumber + 2; i++) {
		for(j = 0; j < this.contourFilletSlices[i].length; j++) {
			dotGeometry.vertices.push(this.contourFilletSlices[i][j]);
		}
	}
	
	for(i = 0; i < this.contourFilletSlices.length - 1; i++) {
		for(j = 0; j < this.contourFilletSlices[i].length - 1; j++) {
			var firstPointOfFirstTriangleIndex = i * this.contourFilletSlices[i].length + j;
	    	var secondPointOfFirstTriangleIndex = i * this.contourFilletSlices[i].length + j + 1;
	    	var thirdPointOfFirstTriangleIndex = (i + 1) * this.contourFilletSlices[i].length + j + 1;
	    	dotGeometry.faces.push( new THREE.Face3( firstPointOfFirstTriangleIndex, secondPointOfFirstTriangleIndex, thirdPointOfFirstTriangleIndex ) );
	    	var firstPointOfSecondTriangleIndex = i * this.contourFilletSlices[i].length + j;
	    	var secondPointOfSecondTriangleIndex = (i + 1) * this.contourFilletSlices[i].length + j + 1;
	    	var thirdPointOfSecondTriangleIndex = (i + 1) * this.contourFilletSlices[i].length + j;
	    	dotGeometry.faces.push( new THREE.Face3( firstPointOfSecondTriangleIndex, secondPointOfSecondTriangleIndex, thirdPointOfSecondTriangleIndex ) );
		}
	}

	for(i = 0; i < this.contourFilletSlices.length - 1; i++) {
		var firstPointOfFirstTriangleIndex = i * this.contourFilletSlices[i].length;
		var secondPointOfFirstTriangleIndex = (i + 1) * this.contourFilletSlices[i].length;
		var thirdPointOfFirstTriangleIndex = i * this.contourFilletSlices[i].length + this.contourFilletSlices[i].length - 1;
		dotGeometry.faces.push( new THREE.Face3( firstPointOfFirstTriangleIndex, secondPointOfFirstTriangleIndex, thirdPointOfFirstTriangleIndex ) );

		firstPointOfSecondTriangleIndex = (i + 1) * this.contourFilletSlices[i].length;
        secondPointOfSecondTriangleIndex = (i + 1) * this.contourFilletSlices[i].length + this.contourFilletSlices[i].length - 1;
        thirdPointOfSecondTriangleIndex = i * this.contourFilletSlices[i].length + this.contourFilletSlices[i].length - 1;
        dotGeometry.faces.push( new THREE.Face3( firstPointOfSecondTriangleIndex, secondPointOfSecondTriangleIndex, thirdPointOfSecondTriangleIndex ) );
	}

	//var dotMaterial = new THREE.PointsMaterial( { size: 3, color: 0x25BCCA, sizeAttenuation: false } );
	//var dot = new THREE.Points( dotGeometry, dotMaterial );
	//scene.add( dot );
	var material = new THREE.MeshNormalMaterial();
	material.side = THREE.DoubleSide;
	dotGeometry.computeFaceNormals();
	var dot = new THREE.Mesh( dotGeometry, material );
	scene.add( dot );
};

Plate.prototype.buildFirstContourFilletSlice = function() {
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

function Prothesis(parameters, scene) {
	this.plate = new Plate(parameters, scene);
}