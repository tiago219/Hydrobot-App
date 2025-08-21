#include "config.h"
#include <WiFi.h>
#include <WebServer.h>
#include <PubSubClient.h>
#include "esp_camera.h"
#include <ArduinoJson.h>

// ===== CAM (ajuste p/ seu módulo) =====
#define PWDN_GPIO_NUM     32
#define RESET_GPIO_NUM    -1
#define XCLK_GPIO_NUM      0
#define SIOD_GPIO_NUM     26
#define SIOC_GPIO_NUM     27
#define Y9_GPIO_NUM       35
#define Y8_GPIO_NUM       34
#define Y7_GPIO_NUM       39
#define Y6_GPIO_NUM       36
#define Y5_GPIO_NUM       21
#define Y4_GPIO_NUM       19
#define Y3_GPIO_NUM       18
#define Y2_GPIO_NUM        5
#define VSYNC_GPIO_NUM    25
#define HREF_GPIO_NUM     23
#define PCLK_GPIO_NUM     22

WebServer server(80);
WiFiClient espClient;
PubSubClient mqtt(espClient);

Mode currentMode = MODE_MANUAL;
unsigned long lastTel = 0, lastScan = 0, lastPatrol = 0;

// ===== Helpers =====
float readVbat() {
  int raw = analogRead(VBAT_ADC);
  float v = (raw / ADC_MAX) * ADC_REF;
  return v * (VBAT_R1 + VBAT_R2) / VBAT_R2; // corrige divisor
}
int readWater() { return analogRead(WATER_PIN); }
int readFire(int pin){ return analogRead(pin); }

void setRGB(uint8_t r, uint8_t g, uint8_t b){
  analogWrite(LED_R, r); analogWrite(LED_G, g); analogWrite(LED_B, b);
}

// Motores
void motorStop(){
  int pins[] = {M1_IN1,M1_IN2,M2_IN1,M2_IN2,M3_IN1,M3_IN2,M4_IN1,M4_IN2};
  for(int p: pins) digitalWrite(p, LOW);
}
void motorTankLeft(){ // gira esquerda — só lado esquerdo
  digitalWrite(M1_IN1, LOW); digitalWrite(M1_IN2, HIGH);
  digitalWrite(M3_IN1, LOW); digitalWrite(M3_IN2, HIGH);
  digitalWrite(M2_IN1, LOW); digitalWrite(M2_IN2, LOW);
  digitalWrite(M4_IN1, LOW); digitalWrite(M4_IN2, LOW);
}
void motorTankRight(){ // gira direita — só lado direito
  digitalWrite(M2_IN1, HIGH); digitalWrite(M2_IN2, LOW);
  digitalWrite(M4_IN1, HIGH); digitalWrite(M4_IN2, LOW);
  digitalWrite(M1_IN1, LOW);  digitalWrite(M1_IN2, LOW);
  digitalWrite(M3_IN1, LOW);  digitalWrite(M3_IN2, LOW);
}
void motorForward(){
  digitalWrite(M1_IN1,HIGH); digitalWrite(M1_IN2,LOW);
  digitalWrite(M2_IN1,HIGH); digitalWrite(M2_IN2,LOW);
  digitalWrite(M3_IN1,HIGH); digitalWrite(M3_IN2,LOW);
  digitalWrite(M4_IN1,HIGH); digitalWrite(M4_IN2,LOW);
}
void motorBackward(){
  digitalWrite(M1_IN1,LOW); digitalWrite(M1_IN2,HIGH);
  digitalWrite(M2_IN1,LOW); digitalWrite(M2_IN2,HIGH);
  digitalWrite(M3_IN1,LOW); digitalWrite(M3_IN2,HIGH);
  digitalWrite(M4_IN1,LOW); digitalWrite(M4_IN2,HIGH);
}

void pumpOn(bool on){ digitalWrite(PUMP_PIN, on?HIGH:LOW); }

// ===== MQTT =====
void mqttCallback(char* topic, byte* payload, unsigned int len){
  StaticJsonDocument<256> doc;
  DeserializationError e = deserializeJson(doc, payload, len);
  if(e) return;

  const char* type = doc["type"] | "";
  if(strcmp(type,"MODE")==0){
    const char* m = doc["value"] | "MANUAL";
    if(strcmp(m,"MANUAL")==0) currentMode = MODE_MANUAL;
    else if(strcmp(m,"AUTO")==0) currentMode = MODE_AUTO;
    else if(strcmp(m,"PATROL")==0) currentMode = MODE_PATROL;
  } else if(strcmp(type,"MOVE")==0 && currentMode==MODE_MANUAL){
    const char* dir = doc["dir"] | "STOP";
    if(strcmp(dir,"FWD")==0) motorForward();
    else if(strcmp(dir,"BACK")==0) motorBackward();
    else if(strcmp(dir,"LEFT")==0) motorTankLeft();
    else if(strcmp(dir,"RIGHT")==0) motorTankRight();
    else motorStop();
  } else if(strcmp(type,"PUMP")==0){
    pumpOn(doc["on"] | false);
  }
}

void mqttReconnect(){
  while(!mqtt.connected()){
    if(mqtt.connect(DEVICE_ID)){
      mqtt.subscribe(MQTT_CMD_TOPIC);
    } else { delay(1000); }
  }
}

// ===== HTTP =====
void handleStatus(){
  StaticJsonDocument<512> doc;
  doc["mode"] = (currentMode==MODE_MANUAL?"MANUAL":currentMode==MODE_AUTO?"AUTO":"PATROL");
  doc["vbat"] = readVbat();
  doc["water"] = readWater();
  doc["fire"] = (readFire(FIRE1_PIN)<1500)||(readFire(FIRE2_PIN)<1500)||(readFire(FIRE3_PIN)<1500);
  String out; serializeJson(doc,out);
  server.send(200,"application/json",out);
}

void handleMove(){
  String dir = server.arg("dir"); // FWD|BACK|LEFT|RIGHT|STOP
  if(dir=="FWD") motorForward();
  else if(dir=="BACK") motorBackward();
  else if(dir=="LEFT") motorTankLeft();
  else if(dir=="RIGHT") motorTankRight();
  else motorStop();
  server.send(200,"text/plain","OK");
}

void handleMode(){
  String m = server.arg("m"); // MANUAL|AUTO|PATROL
  if(m=="MANUAL") currentMode=MODE_MANUAL;
  else if(m=="AUTO") currentMode=MODE_AUTO;
  else if(m=="PATROL") currentMode=MODE_PATROL;
  server.send(200,"text/plain","OK");
}

// Snapshot JPEG
void handleCapture(){
  camera_fb_t* fb = esp_camera_fb_get();
  if(!fb){ server.send(500,"text/plain","CAM_ERR"); return; }
  server.sendHeader("Access-Control-Allow-Origin","*");
  server.setContentLength(fb->len);
  server.send(200,"image/jpeg");
  WiFiClient client = server.client();
  client.write(fb->buf, fb->len);
  esp_camera_fb_return(fb);
}

// Simple MJPEG stream
void handleStream(){
  WiFiClient client = server.client();
  String resp = "HTTP/1.1 200 OK\r\n"
                "Content-Type: multipart/x-mixed-replace; boundary=frame\r\n\r\n";
  client.print(resp);
  while(client.connected()){
    camera_fb_t* fb = esp_camera_fb_get();
    if(!fb) break;
    client.printf("--frame\r\nContent-Type: image/jpeg\r\nContent-Length: %u\r\n\r\n", fb->len);
    client.write(fb->buf, fb->len);
    client.print("\r\n");
    esp_camera_fb_return(fb);
    delay(50); // ~20fps
  }
}

// ===== SETUP =====
void setup(){
  Serial.begin(115200);

  // GPIOs
  pinMode(M1_IN1,OUTPUT); pinMode(M1_IN2,OUTPUT);
  pinMode(M2_IN1,OUTPUT); pinMode(M2_IN2,OUTPUT);
  pinMode(M3_IN1,OUTPUT); pinMode(M3_IN2,OUTPUT);
  pinMode(M4_IN1,OUTPUT); pinMode(M4_IN2,OUTPUT);
  pinMode(PUMP_PIN,OUTPUT);
  pinMode(LED_R,OUTPUT); pinMode(LED_G,OUTPUT); pinMode(LED_B,OUTPUT);
  motorStop(); pumpOn(false);

  // CAM
  camera_config_t cfg;
  cfg.ledc_channel = LEDC_CHANNEL_0;
  cfg.ledc_timer   = LEDC_TIMER_0;
  cfg.pin_d0 = Y2_GPIO_NUM; cfg.pin_d1 = Y3_GPIO_NUM;
  cfg.pin_d2 = Y4_GPIO_NUM; cfg.pin_d3 = Y5_GPIO_NUM;
  cfg.pin_d4 = Y6_GPIO_NUM; cfg.pin_d5 = Y7_GPIO_NUM;
  cfg.pin_d6 = Y8_GPIO_NUM; cfg.pin_d7 = Y9_GPIO_NUM;
  cfg.pin_xclk = XCLK_GPIO_NUM; cfg.pin_pclk = PCLK_GPIO_NUM;
  cfg.pin_vsync = VSYNC_GPIO_NUM; cfg.pin_href = HREF_GPIO_NUM;
  cfg.pin_sscb_sda = SIOD_GPIO_NUM; cfg.pin_sscb_scl = SIOC_GPIO_NUM;
  cfg.pin_pwdn = PWDN_GPIO_NUM; cfg.pin_reset = RESET_GPIO_NUM;
  cfg.xclk_freq_hz = 20000000;
  cfg.pixel_format = PIXFORMAT_JPEG;
  cfg.frame_size = FRAMESIZE_QVGA; // baixa latência
  cfg.jpeg_quality = 12;
  cfg.fb_count = 2;
  esp_camera_init(&cfg);

  // WiFi
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  while(WiFi.status()!=WL_CONNECTED){ delay(300); }

  // HTTP
  server.on("/status", handleStatus);
  server.on("/move", handleMove);
  server.on("/mode", handleMode);
  server.on("/capture", handleCapture);
  server.on("/stream", handleStream);
  server.begin();

  // MQTT
  mqtt.setServer(MQTT_BROKER, MQTT_PORT);
  mqtt.setCallback(mqttCallback);
}

// ===== LOOP =====
void loop(){
  if(!mqtt.connected()) mqttReconnect();
  mqtt.loop();

  server.handleClient();

  unsigned long now = millis();
  if(now - lastScan > SCAN_FIRE_MS){
    lastScan = now;
    bool fire = (readFire(FIRE1_PIN)<1500)||(readFire(FIRE2_PIN)<1500)||(readFire(FIRE3_PIN)<1500);
    setRGB(fire?255:0, fire?0:16, 0);
    if(fire){
      StaticJsonDocument<128> d; d["event"]="fire";
      char out[128]; serializeJson(d,out);
      mqtt.publish(MQTT_EVT_TOPIC, out);
      if(currentMode==MODE_AUTO){ motorForward(); pumpOn(true); }
    } else {
      if(currentMode!=MODE_MANUAL){ pumpOn(false); }
    }
  }

  if(currentMode==MODE_PATROL && (now - lastPatrol > PATROL_STEP_MS)){
    lastPatrol = now;
    motorForward(); delay(600);
    motorTankLeft(); delay(300);
    motorStop();
  }

  if(now - lastTel > TELEMETRY_MS){
    lastTel = now;
    StaticJsonDocument<256> doc;
    doc["vbat"]=readVbat();
    doc["water"]=readWater();
    doc["mode"]= (currentMode==MODE_MANUAL?"MANUAL":currentMode==MODE_AUTO?"AUTO":"PATROL");
    char out[256]; serializeJson(doc,out);
    mqtt.publish(MQTT_TEL_TOPIC, out);
  }
}