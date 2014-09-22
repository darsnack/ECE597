#!/usr/bin/env node

var bone = require('bonescript'),
	shell = require('shelljs');

var TEMP_REG = "0x00",
	CNTL_REG = "0x01";

var SENSOR1 = "0x48",
	SENSOR2 = "0x4a";

var temperature = parseInt(getTemp(SENSOR1), 16) * (9/5) + 32;
console.log("Current temp: " + temperature + " F");

function getTemp (address) {
	return readByte(address, TEMP_REG);
}

function setControlReg (address, value) {
	writeByte(address, CNTL_REG, value);
}

function writeByte (address, register, value) {
	shell.exec("i2cset -y 1 " + address + " " + register + " " + value, {'silent': true});
}

function readByte (address, register) {
	return shell.exec("i2cget -y 1 " + address + " " + register, {'silent': true}).output;
}