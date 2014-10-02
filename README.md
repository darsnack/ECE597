ECE597
======

A repo to contain my work for ECE597 (Embedded 32-Bit Linux) at Rose-Hulman

## Etch-a-Sketch
The goal of this project is to create a console-based etch-a-sketch. This code will transition into a physical etch-a-sketch on a LED matrix.

Run with ./etch.js

## Homework 2
This is the same etch-a-sketch code, but written in JS. Additionally, it utilizes buttons to move the cursor around.

Run with ./etch.js

## Homework 3
This is a re-written version of homework 2. There is no longer any screen refresh, the output display only redraws individual pixels after button presses. Additionally, the output display is now an 8x8 bi-color LED matrix.

Run with ./etch.js

## Homework 4
This homework has several parts. First it has gpiommap.c and gpioThru.c. The first program controls two LEDs using two switchs. The latter toggles and LED using a switch via GPIO_07 (switch) and GPIO_03 (LED). Additionally, it contains etch.js which controls an LED matrix via two rotary encoders to create an etch-a-sketch program. Finally, under the realtime folder, one can start a HTTP server at 192.168.7.2:9090 to play with some demos.

To make gpiommap, type "make gpiommap.out". Run with ./gpiommap.out.

To make gpioThru, type "make gpioThru.out". Run with ./gpioThru.out.

To set up npm for the etch-a-sketch, type "npm install". Run with ./etch.js.

To run the HTTP server, change directories into realtime. Then run ./install.sh. Finally, run ./boneServer.js.