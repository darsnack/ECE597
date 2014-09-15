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
var grid = new Array(ROW_SIZE);
var currentRow = (ROW_SIZE - 1) / 2,
	currentCol = (COL_SIZE - 1) / 2;

init();
clearScreen();
initInterrupts();
setInterval(drawScreen, 10);


function init () {
	for (var i = 0; i < ROW_SIZE; i++) {
		grid[i] = new Array(COL_SIZE);
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
}

function clearScreen () {
	for (var i = 0; i < ROW_SIZE; i++) {
		for (var j = 0; j < COL_SIZE; j++) {
			grid[i][j] = ' ';
		};
	};

	refersh = true;
}

function drawScreen () {
	if (refersh) {
		clear();

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

		refersh = false;
	}
}

function processButton (button) {
	if (draw) {
		grid[currentRow][currentCol] = 'x';
	}

	if (button === 'left') {
		console.log('left');
		if (currentCol <= 0) {
			currentCol = 0;
		} else{
			currentCol--;
		}

		refersh = true;
	} else if (button === 'right') {
		console.log('right');
		if (currentCol >= COL_SIZE - 1) {
			currentCol = COL_SIZE - 1;
		} else{
			currentCol++;
		}

		refersh = true;
	} else if (button === 'up') {
		console.log('up');
		if (currentRow <= 0) {
			currentRow = 0;
		} else{
			currentRow--;
		}

		refersh = true;
	} else if (button === 'down') {
		console.log('down');
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