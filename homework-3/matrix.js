#!/usr/bin/env node
/***************************LEDMatrix.js***************************************
* Created on: 7-8-2013
* Revised on: 7-9-2013
* Author: Juan Cortez
* 8x8 Bi-Color LED Matrix (http://www.adafruit.com/products/902)
* Input: None
* Output: Outputs values to the 8x8 Bi-Color LED Matrix and displays an image
* Note: i2c-dev Library can be found in the following website: https://github.com/korevec/node-i2c
*******************************************************************************/ 
// Library used to configure i2c commands
var i2c = require('i2c');
var address = 0x70;                                  // Address of 8x8 Matrix is found in 0x70
var matrix = new i2c(address, {device: '/dev/i2c-1'}); // Points to the i2c address

// Global Variables used throughout program
var a=0;
var b=0;
var brightnessArray = [0xE0, 0xE1, 0xE2, 0xE3, 0xE4, 0xE5, 0xE6, 0xE7]; // E0(dimmest), E7(brightest) 

/* Insert the hexadecimal values of your bitmap picture, as well as brightness level from 0(dimmest)-7(brightest)*/
var green = [0x01,0x00,0x00,0x00,0x00,0x00,0x00,0x00];  // Green Pixels
var red = [0x01,0x00,0x00,0x00,0x00,0x00,0x00,0x00];    // Red Pixels
var brightness = brightnessArray[7];                    // Brightness level from 0(dimmest)-7(brightest)

//Setup and turn on the 8x8 Bi-Color LED Matrix
matrix.writeBytes(0x21, 0x00);            // 8x8 Bi-Color LED Matrix Set-up
matrix.writeBytes(0x81, 0x00);            // Display on and no blinking
matrix.writeBytes(brightness, 0x00);      // Configures the brightness

setColor(0, 0, 'green');
setColor(1, 1, 'red');
setColor(2, 2, 'yellow');
setTimeout(setColor, 2000, [0, 0, 'off']);

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