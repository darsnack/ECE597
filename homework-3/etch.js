#!/usr/bin/env node
var bone = require('bonescript'),
	shell = require('shelljs'),
	process = require('process');

var MATRIX_ADDR = '0x70';

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
var ROW_SIZE = 21;
var COL_SIZE = 43;
var draw = false;
var refersh = true;
var initInt = true;
var grid = new Array(ROW_SIZE);
var prevGrid = new Array(ROW_SIZE);
var currentRow = (ROW_SIZE - 1) / 2,
	currentCol = (COL_SIZE - 1) / 2;

init();
clearScreen();
setupScreen();
initInterrupts();
setInterval(drawScreen, 10);


function init () {
	for (var i = 0; i < ROW_SIZE; i++) {
		grid[i] = new Array(COL_SIZE);
		prevGrid[i] = new Array(COL_SIZE);
	};
}

function initInterrupts () {
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

	initInt = false;
}

function clearScreen () {
	for (var i = 0; i < ROW_SIZE; i++) {
		for (var j = 0; j < COL_SIZE; j++) {
			grid[i][j] = {'green': 0x00, 'red': 0x00};
		};
	};

	refersh = true;
}

function setupScreen () {
	clear();

	setCursor(0, 0);

	for (var i = 0; i < COL_SIZE; i++) {
		process.stdout.write('_');
	};

	process.stdout.write('\n');

	for (var i = 0; i < ROW_SIZE; i++) {
		process.stdout.write('|');
		for (var j = 0; j < COL_SIZE; j++) {
			process.stdout.write(grid[i][j]);
			prevGrid[i][j] = grid[i][j];
		};
		process.stdout.write('|\n');
	};

	for (var i = 0; i < COL_SIZE; i++) {
		process.stdout.write('_');
	};

	refersh = false;
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
					setCursor(i, j);
					process.stdout.write('+');
				} else if (grid[i][j] !== prevGrid[i][j]) {
					setCursor(i, j)
					process.stdout.write(grid[i][j]);
				}
				prevGrid[i][j] = grid[i][j];
			};
		};

		refersh = false;
	}
}

function processButton (button) {
	if (initInt) {
		return;
	}

	if (draw) {
		grid[currentRow][currentCol] = 'x';
		prevGrid[currentRow][currentCol] = 'c';
	} else {
		prevGrid[currentRow][currentCol] = 'c';
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
	var cmd = row * 2;
	var status;

	matrix.readBytes(cmd, 2, function (error, result) {
		if (error) {
			console.log("Error getting matrix row info: " + error);
		} else {
			status = result;
		}
	});

	if (color === 'red') {
		matrix.writeBytes(cmd, [0x00, status.red | (1 << column)]);
	} else if (color === 'green') {
		matrix.writeBytes(cmd, [status.green | (1 << column), 0x00]);
	} else if (color === 'yellow') {
		matrix.writeBytes(cmd, [status.green | (1 << column), status.red | (1 << column)]);
	} else {
		matrix.writeBytes(cmd, [status.green & ~(1 << column), status.red & ~(1 << column)]);
	}
}

// A handy clear screen function that works on Linux
function clear () {
	process.stdout.write('\033[2J');
}

// A handy set cursor function that works on Linux
function setCursor (row, col) {
	process.stdout.write("\033[" + row + ";" + col + "H");
}