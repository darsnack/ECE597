CC=gcc
CFLAGS=-g -c

gpiommap.out: gpiommap.o
	$(CC) $^ -o $@

gpiommap.o: gpiommap.c gpiommap.h
	$(CC) $(CFLAGS) $< -o $@

gpioThru.out: gpioThru.o
	$(CC) $^ -o $@

gpioThru.o: gpioThru.c beaglebone_gpio.h
	$(CC) $(CFLAGS) $< -o $@