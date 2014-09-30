#!/usr/bin/env node

var exec = require('child_process').exec,
	bone = require('bonescript'),
	async = require('async'),
	fs = require('fs');

// Make sure the rotary encoders are setup
exec("/root/ECE597/resources/setupEQEP.sh");

var eQEP1 = "/sys/devices/ocp.3/48302000.epwmss/48302180.eqep/",
	eQEP2 = "/sys/devices/ocp.3/48304000.epwmss/48304180.eqep/";

var DRAW_LED = 'P9_26',
	DRAW_BUTTON = 'P9_15',
	CLEAR_BUTTON = 'P9_16';

var ENCODER1 = 0,
	ENCODER2 = 1,
	MAX_ROW = 8,
	MAX_COL = 8,
	PERIOD = 100; // in ms

var currentRow = 0,
	currentCol = 0,
	prevRow = 0,
	prevCol = 0,
	prevEncoder1Pos = 0,
	prevEncoder2Pos = 0,
	locked = true,
	draw = false;

setupButtons();
setupEncoders();
setupMatrix();
setInterval(pollEncoders, PERIOD);

function setupEncoders () {
	fs.writeFile(eQEP1 + 'period', PERIOD * 100000, function (error) {
		if (error) {
			console.log("Error setting up period of eQEP1: " + error);
		}
	});
	fs.writeFile(eQEP2 + 'period', PERIOD * 100000, function (error) {
		if (error) {
			console.log("Error setting up period of eQEP2: " + error);
		}
	});

	fs.writeFile(eQEP1 + 'enabled', 1, function (error) {
		if (error) {
			console.log("Error enabling eQEP1: " + error);
		}
	});
	fs.writeFile(eQEP2 + 'enabled', 1, function (error) {
		if (error) {
			console.log("Error enabling eQEP2: " + error);
		}
	});
}

function pollEncoders () {
	fs.readFile(eQEP1, {encoding: 'utf8'}, function (error, data) {
		if (error) {
			console.log("Error reading data for eQEP1: " + error);
		} else {
			processPosition(ENCODER1, data);
		}
	});
	fs.readFile(eQEP2, {encoding: 'utf8'}, function (error, data) {
		if (error) {
			console.log("Error reading data for eQEP2: " + error);
		} else{
			processPosition(ENCODER2, data);
		}
	});
}

function processPosition (encoderIndex, position, drawCallback) {
	prevRow = currentRow;
	prevCol = currentCol;

	if (encoderIndex === ENCODER1) { // Left-right encoder
		currentCol = currentCol + (position - prevEncoder1Pos);
	} else if (encoderIndex === ENCODER2) { // Up-down encoder
		currentRow = currentRow + (position - prevEncoder2Pos);
	}

	if (currentRow > MAX_ROW - 1) {
		currentRow = MAX_ROW - 1;
	} else if (currentRow < 0) {
		currentRow = 0;
	}

	if (currentCol > MAX_COL - 1) {
		currentCol = MAX_COL - 1;
	} else if (currentCol < 0) {
		currentCol = 0;
	}
}

function setupMatrix () {
	async.series([
		function (callback) {
			matrix.writeBytes(0x21, [0x00]); // 8x8 Bi-Color LED Matrix Set-up
			callback(null);
		},
		function (callback) {
			matrix.writeBytes(0x81, [0x00]); // Display on and no blinking
			callback(null);
		},
		function (callback) {
			matrix.writeBytes(0xE7, [0x00]); // Configures the brightness
			callback(null);
		},
		function (callback) {
			claerMatrix();
			callback(null);
		}
	], function (error) {
		if (error) {
			console.log(error);
		}
	});

	locked = false;
}

function clearMatrix () {
	locked = true;

	var i = 0
	async.whilst(
		function () { return i < ROW_SIZE * 2; },
		function (callback) {
			matrix.writeBytes(i, [0x00], function (error) {
				if (error) {
					callback("in writeBytes: " + error);
				} else {
					i++;
					callback(null);
				}
			});
		},
		function (error) {
			if (error) {
				console.log("Error while wiping matrix: " + error);
			}
		}
	);

	setColor(currentRow, currentCol, 'red');

	locked = false;
}

function drawMatrix (argument) {
	setColor(prevRow, prevCol, 'clearred');

	if (draw) {
		setColor(prevRow, prevCol, 'green');
	}

	setColor(currentRow, currentCol, 'red');
}

function setColor (row, column, color) {
	var green = row * 2,
		red = row * 2 + 1;

	async.waterfall([
		function (callback) {
			matrix.readBytes(green, 1, function (error, result) {
				if (error) {
					callback("in readBytes: " + error);
				} else {
					callback(null, result[0]);
				}
			});
		},
		function (greenOutput, callback) {
			matrix.readBytes(red, 1, function (error, result) {
				if (error) {
					callback("in readBytes: " + error);
				} else {
					callback(null, greenOutput, result[0]);
				}
			});
		},
		function (greenOutput, redOutput, callback) {
			if (color === 'red') {
				matrix.writeBytes(red, [redOutput | (1 << column)], function (error) {
					if (error) {
						callback("in writeBytes for red: " + error);
					}
				});
			} else if (color === 'green') {
				matrix.writeBytes(green, [greenOutput | (1 << column)], function (error) {
					if (error) {
						callback("in writeBytes for green: " + error);
					}
				});
			} else if (color === 'yellow') {
				matrix.writeBytes(green, [greenOutput | (1 << column), redOutput | (1 << column)], function (error) {
					if (error) {
						callback("in writeBytes for yellow: " + error);
					}
				});
			} else if (color === 'clearred') {
				matrix.writeBytes(red, [redOutput & ~(1 << column)], function (error) {
					if (error) {
						callback("in writeBytes for clearred: " + error);
					}
				});
			} else if (color === 'cleargreen') {
				matrix.writeBytes(green, [greenOutput & ~(1 << column)], function (error) {
					if (error) {
						callback("in writeBytes for cleargreen: " + error);
					}
				});
			} else {
				matrix.writeBytes(green, [greenOutput & ~(1 << column), redOutput & ~(1 << column)], function (error) {
					if (error) {
						callback("in writeBytes for off: " + error);
					}
				});
			}

			callback(null);
		}
	], function (error, result) {
		if (error) {
			console.log("Error with waterfall: " + error);
		}
	});
}

function setupButtons () {
	bone.pinMode(DRAW_BUTTON, bone.INPUT, 7, 'pulldown');
	bone.pinMode(CLEAR_BUTTON, bone.INPUT, 7, 'pulldown');
	bone.pinMode(DRAW_LED, bone.OUTPUT);
	bone.attachInterrupt(DRAW_BUTTON, true, bone.FALLING, function (x) {draw = !draw;});
	bone.attachInterrupt(CLEAR_BUTTON, true, bone.FALLING, function (x) {clearMatrix();});
}