CC=gcc
CFLAGS=-g -c

gpiommap.out: gpiommap.o
	$(CC) $^ -o $@

gpiommap.o: gpiommap.c gpiommap.h
	$(CC) $(CFLAGS) $< -o $@
