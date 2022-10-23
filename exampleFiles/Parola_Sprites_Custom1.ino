// Program to exercise the MD_Parola library
//
// Demonstrates minimum required for sprite animated text.
//
// MD_MAX72XX library can be found at https://github.com/MajicDesigns/MD_MAX72XX
//

#include <MD_Parola.h>
#include <MD_MAX72xx.h>
#include <SPI.h>

// Define the number of devices we have in the chain and the hardware interface
// NOTE: These pin numbers will probably not work with your hardware and may
// need to be adapted
#define HARDWARE_TYPE MD_MAX72XX::PAROLA_HW
#define MAX_DEVICES 11

#define CLK_PIN   13
#define DATA_PIN  11
#define CS_PIN    10

// HARDWARE SPI
MD_Parola P = MD_Parola(HARDWARE_TYPE, CS_PIN, MAX_DEVICES);
// SOFTWARE SPI
//MD_Parola P = MD_Parola(HARDWARE_TYPE, DATA_PIN, CLK_PIN, CS_PIN, MAX_DEVICES);

// Global variables
const char msg[] = "Parola Sprites";

// Sprite Definition
const uint8_t F_ROCKET = 3;
const uint8_t W_ROCKET = 11;
const uint8_t PROGMEM rocket[F_ROCKET * W_ROCKET] =  // rocket
{
  0x81, 0x5a, 0xa5, 0x18, 0x99, 0x18, 0x99, 0x81, 0x42, 0x24, 0x18,
  0x18, 0x24, 0x42, 0x81, 0x18, 0x99, 0x18, 0x99, 0x24, 0x42, 0x99,
  0xc0, 0xe0, 0x50, 0x28, 0x15, 0x0a, 0x06, 0x09, 0x00, 0x00, 0x00,
};

const uint8_t F_URAA = 3;
const uint8_t W_URAA = 8;
const uint8_t PROGMEM uraa[F_URAA * W_URAA] =  // uraa
{
 0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80,
 0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80,
 0x81, 0x42, 0x24, 0x18, 0x18, 0x24, 0x42, 0x99,
};

void setup(void)
{
  P.begin();
  P.displayText(msg, PA_CENTER, P.getSpeed(), 1000, PA_SPRITE, PA_SPRITE);
  P.setSpriteData(rocket, W_ROCKET, F_ROCKET, rocket, W_ROCKET, F_ROCKET);
}

void loop(void)
{
  if (P.displayAnimate())
    P.displayReset();
}


