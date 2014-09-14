#!/usr/bin/env node
var bone = require('bonescript'),
	spawn = require('child_process').spawn,
	process = require('process');

// Inputs and outputs
var leftButton = 'P9_11';
var rightButton = 'P9_12';
var upButton = 'P9_13';
var downButton = 'P9_14';
var drawButton = 'P9_15';
var clearButton = 'P9_16';

// Global variables
var ROW_SIZE = 9;
var COL_SIZE = 21;
var draw = false;
var grid[ROW_SIZE][COL_SIZE];
var currentRow = (ROW_SIZE - 1) / 2,
	currentCol = (COL_SIZE - 1) / 2;

// Set up pins
bone.pinMode(leftButton, bone.INPUT, 7, 'pulldown');
bone.pinMode(rightButton, bone.INPUT, 7, 'pulldown');
bone.pinMode(upButton, bone.INPUT, 7, 'pulldown');
bone.pinMode(downButton, bone.INPUT, 7, 'pulldown');
bone.pinMode(drawButton, bone.INPUT, 7, 'pulldown');
bone.pinMode(clearButton, bone.INPUT, 7, 'pulldown');

// Set up asynchronous function calls
setInterval(drawScreen, 300);
bone.attachInterrupt(leftButton, true, bone.RISING, function (x) {processButton('left');});
bone.attachInterrupt(rightButton, true, bone.RISING, function (x) {processButton('right');});
bone.attachInterrupt(upButton, true, bone.RISING, function (x) {processButton('up');});
bone.attachInterrupt(downButton, true, bone.RISING, function (x) {processButton('down');});
bone.attachInterrupt(clearButton, true, bone.RISING, function (x) {processButton('clear');});
bone.attachInterrupt(drawButton, true, bone.RISING, function (x) {processButton('draw');});

function clearScreen () {
	spawn('clear');

	for (var i = 0; i < COL_SIZE; i++) {
		process.stdout.write('_');
	};

	process.stdout.write('\n');

	for (var i = 0; i < ROW_SIZE; i++) {
		process.stdout.write('|');
		for (var j = 0; j < COL_SIZE; j++) {
			grid[i][j] = ' ';
			process.stdout.write(' ');
		};
		process.stdout.write('|\n');
	};

	for (var i = 0; i < COL_SIZE; i++) {
		process.stdout.write('_');
	};
}

function drawScreen () {
	spawn('clear');

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
		};
		process.stdout.write('|\n');
	};

	for (var i = 0; i < COL_SIZE; i++) {
		process.stdout.write('_');
	};
}

function processButton (button) {
	if (draw) {
		grid[currentRow][currentCol] = 'x';
	}

	if (button === 'left') {
		if (currentCol <= 0) {
			currentCol = 0;
		} else{
			currentCol--;
		}
	} else if (button === 'right') {
		if (currentCol >= COL_SIZE - 1) {
			currentCol = COL_SIZE - 1;
		} else{
			currentCol++;
		}
	} else if (button === 'up') {
		if (currentRow <= 0) {
			currentRow = 0;
		} else{
			currentRow--;
		}
	} else if (button === 'down') {
		if (currentRow >= ROW_SIZE - 1) {
			currentRow = ROW_SIZE - 1;
		} else{
			currentRow++;
		}
	} else if (button === 'clear') {
		clearScreen();
	} else if (button === 'draw') {
		draw = !draw;
	}
}