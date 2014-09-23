#!/usr/bin/env node

var bone = require('bonescript'),
	shell = require('shelljs');

var TEMP_REG = "0x00",
	CNTL_REG = "0x01",
	TLOW_REG = "0x10",
	THIGH_REG = "0x11";

var SENSOR1 = "0x48",
	SENSOR2 = "0x4a";

var alertPin1 = 'P9_25';
var alertPin2 = 'P9_30';

setControlReg(SENSOR1, 0xa0); // 10-bit resolution
setTLow(SENSOR1, "0x13");
setTHigh(SENSOR2, "0x1a");
bone.pinMode(alertPin1, bone.INPUT, 7, 'pullup');
bone.pinMode(alertPin2, bone.INPUT, 7, 'pullup');
bone.attachInterrupt(alertPin1, true, bone.CHANGE, function (x) {
	var temperature = parseInt(getTemp(SENSOR1), 16) * (9/5) + 32;
	console.log("Alert 1 temp: " + temperature + " F");
});
bone.attachInterrupt(alertPin2, true, bone.CHANGE, function (x) {
	var temperature = parseInt(getTemp(SENSOR1), 16) * (9/5) + 32;
	console.log("Alert 2 temp: " + temperature + " F");
});

function getTemp (address) {
	return readByte(address, TEMP_REG);
}

function setControlReg (address, value) {
	writeByte(address, CNTL_REG, value);
}

function setTLow (address, value) {
	writeByte(address, TLOW_REG, value);
}

function setTHigh (address, value) {
	writeByte(address, THIGH_REG, value);
}

function writeByte (address, register, value) {
	shell.exec("i2cset -y 1 " + address + " " + register + " " + value, {'silent': true});
}

function readByte (address, register) {
	return shell.exec("i2cget -y 1 " + address + " " + register, {'silent': true}).output;
}