#include "esp_camera.h"
#include <WiFi.h>
#include <WebServer.h>

#define CAMERA_MODEL_AI_THINKER
#include "camera_pins.h"

// Cria servidor HTTP na porta 80
WebServer server(80);

// Função para capturar e enviar frame JPEG
void handleJPGStream() {
  camera_fb_t * fb = esp_camera_fb_get();
  if (!fb) {
    server.send(503, "text/plain", "Camera capture failed");
    return;
  }

  server.sendHeader("Content-Type", "image/jpeg");
  server.sendHeader("Content-Length", String(fb->len));
  server.send(200);
  WiFiClient client = server.client();
  client.write(fb->buf, fb->len);
  esp_camera_fb_return(fb);
}

// Página principal
void handleRoot() {
  String html = "<html><body><h1>ESP32-CAM sem PSRAM</h1>";
  html += "<img src=\"/jpg\" width=\"320\" height=\"240\">";
  html += "<p>Resolucao: QVGA, 1 buffer</p></body></html>";
  server.send(200, "text/html", html);
}

void startCameraServer() {
  server.on("/", HTTP_GET, handleRoot);
  server.on("/jpg", HTTP_GET, handleJPGStream);
  server.begin();
  Serial.println("HTTP server started");
}

void setup() {
  Serial.begin(115200);

  // Modo Access Point
  WiFi.softAP("ESP32-CAM", "12345678");
  Serial.println("Access Point iniciado");
  Serial.println(WiFi.softAPIP()); // normalmente 192.168.4.1

  // Configuração da câmera
  camera_config_t config;
  config.ledc_channel = LEDC_CHANNEL_0;
  config.ledc_timer = LEDC_TIMER_0;
  config.pin_d0 = Y2_GPIO_NUM;
  config.pin_d1 = Y3_GPIO_NUM;
  config.pin_d2 = Y4_GPIO_NUM;
  config.pin_d3 = Y5_GPIO_NUM;
  config.pin_d4 = Y6_GPIO_NUM;
  config.pin_d5 = Y7_GPIO_NUM;
  config.pin_d6 = Y8_GPIO_NUM;
  config.pin_d7 = Y9_GPIO_NUM;
  config.pin_xclk = XCLK_GPIO_NUM;
  config.pin_pclk = PCLK_GPIO_NUM;
  config.pin_vsync = VSYNC_GPIO_NUM;
  config.pin_href = HREF_GPIO_NUM;
  config.pin_sscb_sda = SIOD_GPIO_NUM;
  config.pin_sscb_scl = SIOC_GPIO_NUM;
  config.pin_pwdn = PWDN_GPIO_NUM;
  config.pin_reset = RESET_GPIO_NUM;
  config.xclk_freq_hz = 20000000;
  config.pixel_format = PIXFORMAT_JPEG;
  config.frame_size = FRAMESIZE_QVGA;  // resolucao segura sem PSRAM
  config.jpeg_quality = 12;
  config.fb_count = 1;                 // apenas 1 buffer

  if (esp_camera_init(&config) != ESP_OK) {
    Serial.println("Erro ao iniciar a câmera");
    return;
  }

  startCameraServer();
  Serial.println("Servidor iniciado");
}

void loop() {
  server.handleClient(); // necessário para processar requests HTTP
}
