// Program to exercise the MD_Parola library
//
// Demonstrates an un-flpped sprite.
// a demo solution of question : https://github.com/MajicDesigns/MD_Parola/issues/102
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
const uint8_t F_ROCKET = 2;
const uint8_t W_ROCKET = 11;
const uint8_t PROGMEM rocket_launch[F_ROCKET * W_ROCKET] =  // rocket
{
  0x18, 0x24, 0x42, 0x81, 0x99, 0x18, 0x99, 0x18, 0xa5, 0x5a, 0x81,
  0x18, 0x24, 0x42, 0x81, 0x18, 0x99, 0x18, 0x99, 0x24, 0x42, 0x99,
};

const uint8_t PROGMEM rocket_depart[F_ROCKET * W_ROCKET] =  // rocket flipped no-flip
{
  0x81, 0x5a, 0xa5, 0x18, 0x99, 0x18, 0x99, 0x81, 0x42, 0x24, 0x18,
  0x99, 0x42, 0x24, 0x99, 0x18, 0x99, 0x18, 0x81, 0x42, 0x24, 0x18,
};

void setup(void)
{
  P.begin();
  P.displayText(msg, PA_CENTER, P.getSpeed(), 1000, PA_SPRITE, PA_SPRITE);
  P.setSpriteData(rocket_launch, W_ROCKET, F_ROCKET, rocket_depart, W_ROCKET, F_ROCKET);
}

void loop(void)
{
  if (P.displayAnimate())
    P.displayReset();
}


