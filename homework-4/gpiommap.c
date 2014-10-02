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

	volatile void *gpio0_addr;
	volatile void *gpio1_addr;
	volatile unsigned int *gpio0_datain;
	volatile unsigned int *gpio1_datain;
	volatile unsigned int *gpio0_setdataout_addr;
	volatile unsigned int *gpio0_cleardataout_addr;
	int fd = open("/dev/mem", O_RDWR);
	gpio0_addr = mmap(0, GPIO0_SIZE, PROT_READ | PROT_WRITE, MAP_SHARED, fd, GPIO0_START_ADDR);
	gpio1_addr = mmap(0, GPIO1_SIZE, PROT_READ | PROT_WRITE, MAP_SHARED, fd, GPIO0_START_ADDR);

	gpio0_datain = gpio0_addr + GPIO_DATAIN;
	gpio1_datain = gpio1_addr + GPIO_DATAIN;
	gpio0_setdataout_addr = gpio0_addr + GPIO_SETDATAOUT;
	gpio0_cleardataout_addr = gpio0_addr + GPIO_CLEARDATAOUT;

	*gpio0_cleardataout_addr = LED0 | LED1;

	while(1) {
		if (*gpio0_datain & SW0)
			*gpio0_setdataout_addr = LED0;
		else if (*gpio1_datain & SW1)
			*gpio0_setdataout_addr = LED1;
		else if ((*gpio0_datain & SW0) | (*gpio1_datain & SW1))
			*gpio0_setdataout_addr = LED0 | LED1;
		else
			*gpio0_cleardataout_addr = LED0 | LED1;
	}

	munmap((void *)gpio0_addr, GPIO0_SIZE);
	munmap((void *)gpio1_addr, GPIO1_SIZE);
    close(fd);

	return 0;

}