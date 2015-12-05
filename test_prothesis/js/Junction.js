//constructor
function Junction(_slice1, _slice2, slicesNumber, curve) {
	var self = this;
	var isJunctionBuilt = false;
	var junction;
	var slices;
	var junctionGeometry;
	var material;
	var slice1 = _slice1;
	var slice2 = _slice2;

	this.setSlice1 = function(_slice1) {
		slice1 = _slice1;
		isJunctionBuilt = false;
		junctionGeometry.dispose();
		material.dispose();
	};

	this.setSlice2 = function(_slice2) {
		slice2 = _slice2;
		isJunctionBuilt = false;
		junctionGeometry.dispose();
		material.dispose();
	};

	var calculateSlices = function () {
		var differenceDivisor = slicesNumber + 1;
		var i, j;
		slices = new Array;
	
		slices.push(slice1);
	
		for(i = 0; i < slicesNumber; i++) {
			var newPointSet = new Array();
			slices.push( newPointSet );
		}
		
		for(i = 0; i < slice1.length; i++) {
			var dx = ( slice2[i].x - slice1[i].x ) / differenceDivisor;
			var dy = ( slice2[i].y - slice1[i].y ) / differenceDivisor;
			
			for(j = 1; j <= slicesNumber; j++) {
				var newX = slice1[i].x + dx * ( j );
				var newY = slice1[i].y + dy * ( j );	
				var newPoint = new THREE.Vector3( newX, newY, 0 );
				slices[j].push( newPoint );
			}
		}
		slices.push(slice2);
	}

	var positionSlicesAlongCurve = function () {
		var pointsOnCurve = curve.getPoints( slices.length );
		var i, j;
		for(i = 0; i < slices.length; i++) {
			for(j = 0; j < slices[i].length; j++) {
				slices[i][j].add( pointsOnCurve[i] );
			}
		}
	}

	var calculateJunctionGeometry = function () {
		junctionGeometry = new THREE.Geometry();
		var i, j;
		for(i = 0; i < slices.length; i++) {
			for(j = 0; j < slices[i].length; j++) {
				junctionGeometry.vertices.push( slices[i][j] );
			}
		}
		for(i = 0; i < slices.length - 1; i++) {
			for(j = 0; j < slices[i].length - 1; j++) {
				var firstPointOfFirstTriangleIndex = i * slices[i].length + j;
	    		var secondPointOfFirstTriangleIndex = i * slices[i].length + j + 1;
	    		var thirdPointOfFirstTriangleIndex = (i + 1) * slices[i].length + j + 1;
	    		junctionGeometry.faces.push( new THREE.Face3( firstPointOfFirstTriangleIndex, secondPointOfFirstTriangleIndex, thirdPointOfFirstTriangleIndex ) );
	    		var firstPointOfSecondTriangleIndex = i * slices[i].length + j;
	    		var secondPointOfSecondTriangleIndex = (i + 1) * slices[i].length + j + 1;
	    		var thirdPointOfSecondTriangleIndex = (i + 1) * slices[i].length + j;
	    		junctionGeometry.faces.push( new THREE.Face3( firstPointOfSecondTriangleIndex, secondPointOfSecondTriangleIndex, thirdPointOfSecondTriangleIndex ) );
			}
		}
		for(i = 0; i < slices.length - 1; i++) {
			firstPointOfFirstTriangleIndex = i * slices[i].length;
			secondPointOfFirstTriangleIndex = (i + 1) * slices[i].length;
			thirdPointOfFirstTriangleIndex = i * slices[i].length + slices[i].length - 1;
			junctionGeometry.faces.push( new THREE.Face3( firstPointOfFirstTriangleIndex, secondPointOfFirstTriangleIndex, thirdPointOfFirstTriangleIndex ) );
		}

		for(i = 0; i < slices.length - 1; i++) {
			firstPointOfSecondTriangleIndex = (i + 1) * slices[i].length;
        	secondPointOfSecondTriangleIndex = (i + 1) * slices[i].length + slices[i].length - 1;
        	thirdPointOfSecondTriangleIndex = i * slices[i].length + slices[i].length - 1;
        	junctionGeometry.faces.push( new THREE.Face3( firstPointOfSecondTriangleIndex, secondPointOfSecondTriangleIndex, thirdPointOfSecondTriangleIndex ) );
        }
		junctionGeometry.computeFaceNormals();
	}

	function buildJunction() {
		calculateSlices();
		positionSlicesAlongCurve();
		calculateJunctionGeometry();
		material = new THREE.MeshNormalMaterial();
		material.side = THREE.DoubleSide;
		junction = new THREE.Mesh( junctionGeometry, material );
		isJunctionBuilt = true;
	}

	this.getJunction = function () {
		if( !isJunctionBuilt ) buildJunction();
		return junction;
	}
}

exports.Junction = Junction;