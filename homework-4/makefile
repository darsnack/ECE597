CC=gcc
CFLAGS=-g -c

gpiommap: gpiommap.o
	$(CC) $^ -o $@

gpiommap.o: gpiommap.c gpiommap.h
	$(CC) $(CFLAGS) $< -o $@