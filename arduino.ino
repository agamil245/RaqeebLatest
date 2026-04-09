#include <TinyGsmClient.h>

#define TINY_GSM_MODEM_SIM7670
#define TINY_GSM_RX_BUFFER 1024

// ===== عدل هذه القيم =====
const char APN[]      = "etisalat";              // أو du / etisalat حسب الشريحة
const char GPRS_USER[] = "";
const char GPRS_PASS[] = "";

const char SERVER[]   = "raqeeb.thetalenter.net";
const int  PORT       = 5055;
const char DEVICE_ID[] = "ESP32_RAQUEEB_001";    // نفس الـ Unique ID في Traccar

// ===== عدل الـ pins حسب لوحتك =====
#define MODEM_RX 18   // ESP32 RX  <- TX المودم
#define MODEM_TX 17   // ESP32 TX  -> RX المودم
#define MODEM_PWRKEY 4
#define MODEM_RST 5
#define MODEM_POWER_ON 12

HardwareSerial SerialAT(1);
TinyGsm modem(SerialAT);
TinyGsmClient client(modem);

struct GpsData {
  bool valid = false;
  float lat = 0.0;
  float lon = 0.0;
  float speed = 0.0;     // km/h
  float altitude = 0.0;  // meter
  int satellites = 0;
  String utc = "";
};

void modemPowerOn() {
  pinMode(MODEM_PWRKEY, OUTPUT);
  pinMode(MODEM_RST, OUTPUT);
  pinMode(MODEM_POWER_ON, OUTPUT);

  digitalWrite(MODEM_RST, HIGH);
  digitalWrite(MODEM_POWER_ON, HIGH);

  digitalWrite(MODEM_PWRKEY, LOW);
  delay(100);
  digitalWrite(MODEM_PWRKEY, HIGH);
  delay(1000);
  digitalWrite(MODEM_PWRKEY, LOW);

  delay(5000);
}

String sendAT(String cmd, uint32_t timeout = 3000) {
  while (SerialAT.available()) SerialAT.read();
  SerialAT.println(cmd);

  String resp;
  uint32_t start = millis();
  while (millis() - start < timeout) {
    while (SerialAT.available()) {
      char c = SerialAT.read();
      resp += c;
    }
  }
  return resp;
}

bool waitForNetwork() {
  Serial.println("Waiting for network...");
  for (int i = 0; i < 30; i++) {
    if (modem.isNetworkConnected()) {
      Serial.println("Network connected");
      return true;
    }
    delay(1000);
  }
  return false;
}

bool startGprs() {
  Serial.println("Connecting GPRS...");
  if (!modem.gprsConnect(APN, GPRS_USER, GPRS_PASS)) {
    Serial.println("GPRS failed");
    return false;
  }
  Serial.println("GPRS connected");
  return true;
}

bool enableGNSS() {
  Serial.println("Enabling GNSS...");
  sendAT("AT+CGNSSPWR=0", 1000);
  delay(500);
  String r = sendAT("AT+CGNSSPWR=1", 3000);
  Serial.println(r);

  // بعض النسخ تحتاج تفعيل NMEA output
  sendAT("AT+CGNSSMODE=1", 2000);
  delay(1000);
  return true;
}

GpsData readRealGps() {
  GpsData gps;

  // يطلب بيانات GNSS الحقيقية من المودم
  String resp = sendAT("AT+CGNSSINFO", 3000);
  Serial.println("GNSS raw: " + resp);

  // مثال رد شائع:
  // +CGNSSINFO: 1,6,0,0,25.123456,55.123456,20260328101530.000,0.52,12.3,34.5,...
  int idx = resp.indexOf("+CGNSSINFO:");
  if (idx < 0) return gps;

  int lineEnd = resp.indexOf("\n", idx);
  String line = (lineEnd > idx) ? resp.substring(idx, lineEnd) : resp.substring(idx);
  line.trim();

  int colon = line.indexOf(':');
  if (colon < 0) return gps;

  String payload = line.substring(colon + 1);
  payload.trim();

  // تقسيم CSV
  const int MAX_FIELDS = 20;
  String fields[MAX_FIELDS];
  int fieldCount = 0;
  int start = 0;

  for (int i = 0; i <= payload.length() && fieldCount < MAX_FIELDS; i++) {
    if (i == payload.length() || payload[i] == ',') {
      fields[fieldCount++] = payload.substring(start, i);
      start = i + 1;
    }
  }

  // SIM7670 AT+CGNSSINFO field order:
  // fields[0]=mode, [1]=GPS SVs, [2]=GLONASS SVs, [3]=BEIDOU SVs
  // fields[4]=lat(DDMM.MMMM), [5]=N/S, [6]=lon(DDDMM.MMMM), [7]=E/W
  // fields[8]=date, [9]=UTC, [10]=alt, [11]=speed, [12]=course

  if (fieldCount < 13) return gps;

  int fix = fields[0].toInt();
  if (fix < 1) {
    Serial.println("No GPS fix yet");
    return gps;
  }

  if (!fields[4].length() || !fields[6].length()) return gps;

  // Convert NMEA DDMM.MMMM to decimal degrees
  float rawLat = fields[4].toFloat();
  int latDeg = (int)(rawLat / 100.0);
  float latMin = rawLat - latDeg * 100.0;
  gps.lat = latDeg + latMin / 60.0;
  if (fields[5] == "S") gps.lat = -gps.lat;

  float rawLon = fields[6].toFloat();
  int lonDeg = (int)(rawLon / 100.0);
  float lonMin = rawLon - lonDeg * 100.0;
  gps.lon = lonDeg + lonMin / 60.0;
  if (fields[7] == "W") gps.lon = -gps.lon;

  gps.satellites = fields[1].toInt();
  gps.utc = fields[9];
  gps.speed = fields[11].toFloat();
  gps.altitude = fields[10].toFloat();
  gps.valid = true;

  // فلترة بسيطة
  if (gps.lat == 0.0 || gps.lon == 0.0) gps.valid = false;
  if (gps.lat < -90 || gps.lat > 90) gps.valid = false;
  if (gps.lon < -180 || gps.lon > 180) gps.valid = false;

  return gps;
}

bool sendToTraccar(const GpsData& gps) {
  if (!gps.valid) return false;

  if (!client.connect(SERVER, PORT)) {
    Serial.println("Traccar connect failed");
    return false;
  }

  // بروتوكول OsmAnd
  // id=DEVICE_ID&lat=..&lon=..&speed=..&altitude=..
  String url = "/?id=" + String(DEVICE_ID) +
               "&lat=" + String(gps.lat, 6) +
               "&lon=" + String(gps.lon, 6) +
               "&speed=" + String(gps.speed, 2) +
               "&altitude=" + String(gps.altitude, 1) +
               "&hdop=1.0" +
               "&satellites=" + String(gps.satellites) +
               "&timestamp=" + String((unsigned long)(millis() / 1000));

  Serial.println("Sending: " + url);

  client.print(String("GET ") + url + " HTTP/1.1\r\n");
  client.print(String("Host: ") + SERVER + "\r\n");
  client.print("Connection: close\r\n\r\n");

  uint32_t start = millis();
  while (client.connected() && millis() - start < 5000) {
    while (client.available()) {
      Serial.write(client.read());
      start = millis();
    }
  }

  client.stop();
  return true;
}

void setup() {
  Serial.begin(115200);
  delay(1000);

  modemPowerOn();

  SerialAT.begin(115200, SERIAL_8N1, MODEM_RX, MODEM_TX);
  delay(3000);

  Serial.println("Initializing modem...");
  if (!modem.restart()) {
    Serial.println("Modem restart failed");
  }

  Serial.println("Modem info:");
  Serial.println(modem.getModemInfo());

  if (!waitForNetwork()) {
    Serial.println("No network");
  }

  if (!startGprs()) {
    Serial.println("GPRS connection problem");
  }

  enableGNSS();

  Serial.println("Waiting for real GPS fix...");
}

void loop() {
  GpsData gps = readRealGps();

  if (gps.valid) {
    Serial.println("REAL GPS:");
    Serial.print("LAT: "); Serial.println(gps.lat, 6);
    Serial.print("LON: "); Serial.println(gps.lon, 6);
    Serial.print("SAT: "); Serial.println(gps.satellites);
    Serial.print("SPD: "); Serial.println(gps.speed);

    sendToTraccar(gps);
  } else {
    Serial.println("GPS not fixed yet. Move antenna near window/open sky.");
  }

  delay(10000); // إرسال كل 10 ثواني
}