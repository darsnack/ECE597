/*
 * gpiommap.h
 *
 * A header file to complement gpiommap.c
 *
 * Modifier: Kyle Daruwalla
 * Date: 2014-09-29
 */

// From : http://stackoverflow.com/questions/13124271/driving-beaglebone-gpio-through-dev-mem
#ifndef _BEAGLEBONE_GPIO_H_
#define _BEAGLEBONE_GPIO_H_

#define GPIO0_START_ADDR 0x44e07000
#define GPIO0_END_ADDR 0x44e09000
#define GPIO0_SIZE (GPIO0_END_ADDR - GPIO0_START_ADDR)

#define GPIO1_START_ADDR 0x4804C000
#define GPIO1_END_ADDR 0x4804e000
#define GPIO1_SIZE (GPIO1_END_ADDR - GPIO1_START_ADDR)

#define GPIO_OE 0x134
#define GPIO_DATAIN 0x138
#define GPIO_SETDATAOUT 0x194
#define GPIO_CLEARDATAOUT 0x190

#define USR0 (1 << 21)
#define USR1 (1 << 22)
#define USR2 (1 << 23)
#define USR3 (1 << 24)

#define LED0 (1 << 2) // GPIO_2
#define LED1 (1 << 3) // GPIO_3
#define SW0 (1 << 30) // GPIO_30
#define SW1 (1 << 28) // GPIO_60
#endif