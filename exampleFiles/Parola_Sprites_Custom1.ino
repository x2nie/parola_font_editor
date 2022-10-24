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
  0x03, 0x07, 0x0a, 0x14, 0xa8, 0x50, 0x60, 0x90, 0x00, 0x00, 0x00,
};

const uint8_t F_URAA = 3;
const uint8_t W_URAA = 8;
const uint8_t PROGMEM uraa[F_URAA * W_URAA] =  // uraa
{
 0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80,
 0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80,
 0x81, 0x42, 0x24, 0x18, 0x18, 0x24, 0x42, 0x99,
};

const uint8_t F_FISTS = 1;
const uint8_t W_FISTS = 8;
const uint8_t PROGMEM fists[F_FISTS * W_FISTS] =  // fists
{
 0x3c, 0x4e, 0x81, 0x89, 0x81, 0x89, 0x81, 0x7e,
};

const uint8_t F_NOTE = 1;
const uint8_t W_NOTE = 8;
const uint8_t PROGMEM note[F_NOTE * W_NOTE] =  // note
{
 0x40, 0xe0, 0xe0, 0x7f, 0x03, 0x46, 0x3c, 0x00,
};

const uint8_t F_NOTE_F = 1;
const uint8_t W_NOTE_F = 8;
const uint8_t PROGMEM note_f[F_NOTE_F * W_NOTE_F] =  // note_f
{
 0x8e, 0x8d, 0x41, 0x61, 0x3f, 0x1e, 0x00, 0x0a,
};

const uint8_t F_NOTE_C = 1;
const uint8_t W_NOTE_C = 5;
const uint8_t PROGMEM note_c[F_NOTE_C * W_NOTE_C] =  // note_c
{
 0x58, 0xa4, 0xff, 0x25, 0x12,
};

const uint8_t F_FACEBOOK = 1;
const uint8_t W_FACEBOOK = 8;
const uint8_t PROGMEM facebook[F_FACEBOOK * W_FACEBOOK] =  // facebook
{
  0x7e, 0xff, 0xf7, 0x01, 0xf5, 0xf5, 0xff, 0x7e,
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


