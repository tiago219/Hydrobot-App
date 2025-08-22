#pragma once

// ===== WiFi =====
#define WIFI_SSID        "SEU_SSID"
#define WIFI_PASS        "SUA_SENHA"

// MQTT
#define MQTT_BROKER      "broker.hivemq.com"
#define MQTT_PORT        1883
#define DEVICE_ID        "esp32cam-01"
#define MQTT_BASE        "hydrobot/" DEVICE_ID
#define MQTT_CMD_TOPIC   MQTT_BASE "/cmd"       // recebe {type: "MODE|MOVE|PUMP", ...}
#define MQTT_TEL_TOPIC   MQTT_BASE "/telemetry" // publica status periódico
#define MQTT_EVT_TOPIC   MQTT_BASE "/events"    // publica "fire", etc.

// Streams/intervalos
#define TELEMETRY_MS     2000
#define SCAN_FIRE_MS     300
#define PATROL_STEP_MS   1500

// Pinos — AJUSTE conforme seu hardware
// Ponte H (exemplo L298N com 2 boards p/ 4 motors)
#define M1_IN1 12  // roda frontal esquerda
#define M1_IN2 13
#define M2_IN1 15  // frontal direita
#define M2_IN2 14
#define M3_IN1 2   // traseira esquerda
#define M3_IN2 4
#define M4_IN1 16  // traseira direita
#define M4_IN2 17
#define PWM_CH  0  // se usar PWM para velocidade
#define PWM_FRQ 5000
#define PWM_RES 8

// Bomba d'água (MOSFET)
#define PUMP_PIN  33

// Sensores chama
#define FIRE1_PIN 34  // KY-026 (analógico)
#define FIRE2_PIN 35
#define FIRE3_PIN 32

// Nível de água FD-100 (analógico)
#define WATER_PIN 39

// LED RGB (via MOSFETs)
#define LED_R 25
#define LED_G 26
#define LED_B 27

// Bateria (divisor resistivo → ADC)
#define VBAT_ADC   36
#define VBAT_R1    200000.0  // ohms (superior)
#define VBAT_R2    100000.0  // ohms (inferior)
#define ADC_REF    3.3
#define ADC_MAX    4095.0

// Modos
enum Mode { MODE_MANUAL, MODE_AUTO, MODE_PATROL };