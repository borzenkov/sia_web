function Junction( plate, head ) {
	this.plate = plate;
	this.head = head;
	this.plateTopContour = this.plate.getContourForJunction();
	this.headContour = this.head.pointsForJunction;
	this.build();
}

Junction.prototype.build = function() {
	console.log('шейка - стройся!');
};

exports.Junction = Junction;