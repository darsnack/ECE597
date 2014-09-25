#!/usr/bin/env node
"use strict";

var bone = require('bonescript'),
	shell = require('shelljs'),
	async = require('async'),
	i2c = require('i2c');

// I2C Parameters
var I2C_BUS = '/dev/i2c-1',
	MATRIX_ADDR = '0x70';

// Inputs and outputs
var leftButton = 'P9_11',
	rightButton = 'P9_12',
	upButton = 'P9_13',
	downButton = 'P9_14',
	drawButton = 'P9_15',
	clearButton = 'P9_16',
	leftLED = 'P9_21',
	rightLED = 'P9_22',
	upLED = 'P9_23',
	downLED = 'P9_24',
	drawLED = 'P9_26';

// Global variables
var ROW_SIZE = 8,
	COL_SIZE = 8,
	draw = false,
	refersh = true,
	initialized = false,
	matrix = new i2c(MATRIX_ADDR, {device: I2C_BUS, debug: false}),
	grid = new Array(ROW_SIZE),
	prevGrid = new Array(ROW_SIZE),
	currentRow = ROW_SIZE / 2,
	currentCol = COL_SIZE / 2;

initArrays(); // Initialize grid arrays
clearScreen(); // Set grid to all 'off'
initDevices(); // Initialize interrupts and matrix
wipeMatrix(); // Clear matrix screen
processButton('poop');
//setInterval(drawScreen, 10); // Start drawing

function initArrays () {
	for (var i = 0; i < ROW_SIZE; i++) {
		grid[i] = new Array(COL_SIZE);
		prevGrid[i] = new Array(COL_SIZE);
	}
}

function initDevices () {
	// Set up pins
	bone.pinMode(leftButton, bone.INPUT, 7, 'pulldown');
	bone.pinMode(rightButton, bone.INPUT, 7, 'pulldown');
	bone.pinMode(upButton, bone.INPUT, 7, 'pulldown');
	bone.pinMode(downButton, bone.INPUT, 7, 'pulldown');
	bone.pinMode(drawButton, bone.INPUT, 7, 'pulldown');
	bone.pinMode(clearButton, bone.INPUT, 7, 'pulldown');
	bone.pinMode(leftLED, bone.OUTPUT);
	bone.pinMode(rightLED, bone.OUTPUT);
	bone.pinMode(upLED, bone.OUTPUT);
	bone.pinMode(downLED, bone.OUTPUT);
	bone.pinMode(drawLED, bone.OUTPUT);

	// Set up asynchronous function calls
	bone.attachInterrupt(leftButton, true, bone.FALLING, function (x) {processButton('left');});
	bone.attachInterrupt(rightButton, true, bone.FALLING, function (x) {processButton('right');});
	bone.attachInterrupt(upButton, true, bone.FALLING, function (x) {processButton('up');});
	bone.attachInterrupt(downButton, true, bone.FALLING, function (x) {processButton('down');});
	bone.attachInterrupt(clearButton, true, bone.FALLING, function (x) {processButton('clear');});
	bone.attachInterrupt(drawButton, true, bone.FALLING, function (x) {processButton('draw');});

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
		}
	], function (error) {
		if (error) {
			console.log(error);
		}
	});
}

function clearScreen () {
	for (var i = 0; i < ROW_SIZE; i++) {
		for (var j = 0; j < COL_SIZE; j++) {
			grid[i][j] = 'off';
			prevGrid[i][j] = 'yellow';
		}
	}

	refersh = true;
}

function drawScreen () {
	if (draw) {
		bone.digitalWrite(drawLED, bone.HIGH);
	} else {
		bone.digitalWrite(drawLED, bone.LOW);
	}

	bone.digitalWrite(leftLED, bone.LOW);
	bone.digitalWrite(rightLED, bone.LOW);
	bone.digitalWrite(upLED, bone.LOW);
	bone.digitalWrite(downLED, bone.LOW);

	if (refersh) {
		for (var i = 0; i < ROW_SIZE; i++) {
			for (var j = 0; j < COL_SIZE; j++) {
				if (i === currentRow && j === currentCol) {
					setColor(i, j, 'red');
				} else if (grid[i][j] !== prevGrid[i][j]) {
					setColor(i, j, grid[i][j]);
				}
				prevGrid[i][j] = grid[i][j];
			}
		}

		refersh = false;
	}
}

function processButton (button) {
	if (!initialized) {
		return;
	}

	if (draw) {
		setColor(currentRow, currentCol, 'green');
	} else {
		setColor(currentRow, currentCol, 'off');
	}

	if (button === 'left') {
		bone.digitalWrite(leftLED, bone.HIGH);
		if (currentCol >= COL_SIZE - 1) {
			currentCol = COL_SIZE - 1;
		} else{
			currentCol++;
		}

		refersh = true;
	} else if (button === 'right') {
		bone.digitalWrite(rightLED, bone.HIGH);
		if (currentCol <= 0) {
			currentCol = 0;
		} else{
			currentCol--;
		}

		refersh = true;
	} else if (button === 'up') {
		bone.digitalWrite(upLED, bone.HIGH);
		if (currentRow >= ROW_SIZE - 1) {
			currentRow = ROW_SIZE - 1;
		} else{
			currentRow++;
		}

		refersh = true;
	} else if (button === 'down') {
		bone.digitalWrite(downLED, bone.HIGH);
		if (currentRow <= 0) {
			currentRow = 0;
		} else{
			currentRow--;
		}

		refersh = true;
	} else if (button === 'clear') {
		clearScreen();
	} else if (button === 'draw') {
		draw = !draw;
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
				async.series([
					function (callback2) {
						matrix.writeBytes(green, [greenOutput & ~(1 << column)], function (error) {
							if (error) {
								callback("in writeBytes for red: " + error);
							}
						});
					},
					function (callback2) {
						matrix.writeBytes(red, [redOutput | (1 << column)], function (error) {
							if (error) {
								callback("in writeBytes for red: " + error);
							}
						});
					}
				], function (error) {
					if (error) {
						callback(error);
					}
				});
			} else if (color === 'green') {
				async.series([
					function (callback2) {
						matrix.writeBytes(green, [greenOutput | (1 << column)], function (error) {
							if (error) {
								callback2("in writeBytes for red: " + error);
							} else {
								callback2(null);
							}
						});
					},
					function (callback2) {
						matrix.writeBytes(red, [redOutput & ~(1 << column)], function (error) {
							if (error) {
								callback2("in writeBytes for red: " + error);
							} else {
								callback2(null);
							}
						});
					}
				], function (error) {
					if (error) {
						callback(error);
					}
				});
			} else if (color === 'yellow') {
				async.series([
					function (callback2) {
						matrix.writeBytes(green, [greenOutput | (1 << column)], function (error) {
							if (error) {
								callback2("in writeBytes for red: " + error);
							} else {
								callback2(null);
							}
						});
					},
					function (callback2) {
						matrix.writeBytes(red, [redOutput | (1 << column)], function (error) {
							if (error) {
								callback2("in writeBytes for red: " + error);
							} else {
								callback2(null);
							}
						});
					}
				], function (error) {
					if (error) {
						callback(error);
					}
				});
			} else {
				async.series([
					function (callback2) {
						matrix.writeBytes(green, [greenOutput & ~(1 << column)], function (error) {
							if (error) {
								callback2("in writeBytes for red: " + error);
							} else {
								callback2(null);
							}
						});
					},
					function (callback2) {
						matrix.writeBytes(red, [redOutput & ~(1 << column)], function (error) {
							if (error) {
								callback2("in writeBytes for red: " + error);
							} else {
								callback2(null);
							}
						});
					}
				], function (error) {
					if (error) {
						callback(error);
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

function wipeMatrix () {
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

	initialized = true;
}