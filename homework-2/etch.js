#!/usr/bin/env node
var bone = require('bonescript'),
	shell = require('shelljs'),
	async = require('async');
	process = require('process');

// Inputs and outputs
var leftButton = 'P9_11';
var rightButton = 'P9_12';
var upButton = 'P9_13';
var downButton = 'P9_14';
var drawButton = 'P9_15';
var clearButton = 'P9_16';

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
			grid[i][j] = ' ';
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
			if (i === currentRow && j === currentCol) {
				process.stdout.write('+');
			} else {
				process.stdout.write(grid[i][j]);
			}
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
	if (refersh) {
		for (var i = 0; i < ROW_SIZE; i++) {
			for (var j = 0; j < COL_SIZE; j++) {
				if (i === currentRow && j === currentCol) {
					setCursor(i, j);
					grid[i][j] = '+';
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
	}

	if (button === 'left') {
		if (currentCol <= 0) {
			currentCol = 0;
		} else{
			currentCol--;
		}

		refersh = true;
	} else if (button === 'right') {
		if (currentCol >= COL_SIZE - 1) {
			currentCol = COL_SIZE - 1;
		} else{
			currentCol++;
		}

		refersh = true;
	} else if (button === 'up') {
		if (currentRow <= 0) {
			currentRow = 0;
		} else{
			currentRow--;
		}

		refersh = true;
	} else if (button === 'down') {
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

// A handy clear screen function that works on Linux
function clear () {
	console.log('\033[2J');
}

// A handy set cursor function that works on Linux
function setCursor (row, col) {
	console.log("\033[" + row + ";" + col + "H");
}