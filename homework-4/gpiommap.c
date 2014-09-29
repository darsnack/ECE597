/*
 * gpiommap.c
 * 
 * A simple C program that uses mmap() to control to LEDs via two switches
 * 
 * Author: Kyle Daruwalla
 * Date: 2014-09-29
 */

#include <stdio.h>
#include <stdlib.h>
#include <sys/mman.h>
#include <sys/stat.h>
#include <fcntl.h> 
#include <signal.h>    // Defines signal-handling functions (i.e. trap Ctrl-C)
#include "gpiommap.h"

int main(int argc, char const *argv[]) {

	volatile void *gpio_addr;
	volatile unsigned int *gpio_setdataout_addr;
	volatile unsigned int *gpio_cleardataout_addr;
	int fd = open("/dev/mem", O_RDWR);
	gpio_addr = mmap(0, GPIO0_SIZE, PROT_READ | PROT_WRITE, MAP_SHARED, fd, GPIO0_START_ADDR);

	gpio_datain = gpio_addr + GPIO_DATAIN;
	gpio_setdataout_addr = gpio_addr + GPIO_SETDATAOUT;
	gpio_cleardataout_addr = gpio_addr + GPIO_CLEARDATAOUT;

	while(1) {
		if (*gpio_datain & SW0)
			*gpio_setdataout_addr = *gpio_setdataout_addr | LED0;
		else if (*gpio_datain & SW1)
			*gpio_setdataout_addr = *gpio_setdataout_addr | LED1;
		else if (*gpio_datain & (SW0 | SW1))
			*gpio_setdataout_addr = *gpio_setdataout_addr | LED0 | LED1;
		else
			*gpio_setdataout_addr = *gpio_setdataout_addr & ~(LED0 | LED1);
	}

	return 0;

}