#!/usr/bin/env node
"use strict";

var bone = require('bonescript'),
	shell = require('child_process'),
	async = require('async'),
	i2c = require('i2c');

// I2C Parameters
var I2C_BUS = '/dev/i2c-1',
	MATRIX_ADDR = '0x70';

// Inputs and outputs
var rightButton = 'P9_11',
	leftButton = 'P9_12',
	downButton = 'P9_13',
	upButton = 'P9_14',
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
setInterval(drawScreen, 10); // Start drawing

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

	async.waterfall([
		function (callback) {
			matrix.writeByte(0x21); // 8x8 Bi-Color LED Matrix Set-up
			callback(null);
		},
		function (callback) {
			matrix.writeByte(0x81); // Display on and no blinking
			callback(null);
		},
		function (callback) {
			matrix.writeByte(0xE7); // Configures the brightness
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
		grid[currentRow][currentCol] = 'green';
		prevGrid[currentRow][currentCol] = 'yellow';
	} else {
		prevGrid[currentRow][currentCol] = 'yellow';
	}

	if (button === 'left') {
		bone.digitalWrite(leftLED, bone.HIGH);
		if (currentCol <= 0) {
			currentCol = 0;
		} else{
			currentCol--;
		}

		refersh = true;
	} else if (button === 'right') {
		bone.digitalWrite(rightLED, bone.HIGH);
		if (currentCol >= COL_SIZE - 1) {
			currentCol = COL_SIZE - 1;
		} else{
			currentCol++;
		}

		refersh = true;
	} else if (button === 'up') {
		bone.digitalWrite(upLED, bone.HIGH);
		if (currentRow <= 0) {
			currentRow = 0;
		} else{
			currentRow--;
		}

		refersh = true;
	} else if (button === 'down') {
		bone.digitalWrite(downLED, bone.HIGH);
		if (currentRow >= ROW_SIZE - 1) {
			currentRow = ROW_SIZE - 1;
		} else{
			currentRow++;
		}

		refersh = true;
	} else if (button === 'clear') {
		clearScreen();
	} else if (button === 'draw') {
		draw = !draw;
	}
}

function setColor (row, column, color) {
	var green = row * 2,
		red = row * 2 + 1;

	async.waterfall([
		function (callback) {
			shell.exec('i2cget -y 1 ' + MATRIX_ADDR + ' 0x' + green.toString(16), function (error, output) {
				if (error) {
					callback("in i2cget for green row: " + error);
				} else{
					callback(null, parseInt(output, 16));
				}
			});
		},
		function (greenOutput, callback) {
			shell.exec('i2cget -y 1 ' + MATRIX_ADDR + ' 0x' + red.toString(16), function (error, output) {
				if (error) {
					callback("in i2cget for red row: " + error);
				} else{
					callback(null, greenOutput, parseInt(output, 16));
				}
			});
		},
		function (greenOutput, redOutput, callback) {
			if (color === 'red') {
				shell.exec('i2cset -y 1 ' + MATRIX_ADDR + ' 0x' + green.toString(16) + ' 0x' + (greenOutput & ~(1 << column)).toString(16));
				shell.exec('i2cset -y 1 ' + MATRIX_ADDR + ' 0x' + red.toString(16) + ' 0x' + (redOutput | (1 << column)).toString(16));
			} else if (color === 'green') {
				shell.exec('i2cset -y 1 ' + MATRIX_ADDR + ' 0x' + green.toString(16) + ' 0x' + (greenOutput | (1 << column)).toString(16));
				shell.exec('i2cset -y 1 ' + MATRIX_ADDR + ' 0x' + red.toString(16) + ' 0x' + (redOutput & ~(1 << column)).toString(16));
			} else if (color === 'yellow') {
				shell.exec('i2cset -y 1 ' + MATRIX_ADDR + ' 0x' + green.toString(16) + ' 0x' + (greenOutput | (1 << column)).toString(16));
				shell.exec('i2cset -y 1 ' + MATRIX_ADDR + ' 0x' + red.toString(16) + ' 0x' + (redOutput | (1 << column)).toString(16));
			} else {
				shell.exec('i2cset -y 1 ' + MATRIX_ADDR + ' 0x' + green.toString(16) + ' 0x' + (greenOutput & ~(1 << column)).toString(16));
				shell.exec('i2cset -y 1 ' + MATRIX_ADDR + ' 0x' + red.toString(16) + ' 0x' + (redOutput & ~(1 << column)).toString(16));
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
			shell.exec('i2cset -y 1 ' + MATRIX_ADDR + ' 0x' + i.toString(16) + ' ' + '0x00', function (error, output) {
				if (error) {
					callback("in i2cset for wiping " + i + " row: " + error);
				} else{
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