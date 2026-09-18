export interface TelemetryData {
  timestamp: number;
  heartRate: number; // BPM
  oxygenLevel: number; // SpO2 %
  temperature: number; // °C
  gasLevels: {
    co: number; // ppm
    co2: number; // ppm
    methane: number; // ppm
    voc: number; // ppm
  };
  gps: {
    latitude: number;
    longitude: number;
    altitude: number; // meters
    speed: number; // km/h
    satellites: number;
    fixStatus: '3D FIX' | 'STANDBY' | 'SEARCHING';
  };
}

export interface HandshakeState {
  verified: boolean;
  ssid: string;
  identity: string;
  eapMethod: 'PEAP-MSCHAPv2' | 'EAP-TLS' | 'EAP-TTLS';
  macAddress: string;
  ipAddress: string;
  rssi: number; // dBm
  cipher: string;
  connectedAt: number | null;
  handshakeLogs: string[];
}

export interface AlertLog {
  id: string;
  timestamp: number;
  sensor: string;
  value: number;
  threshold: number;
  severity: 'WARNING' | 'CRITICAL' | 'NORMAL';
  message: string;
  acknowledged: boolean;
}

export interface DeviceConfig {
  heartRateThreshold: { high: number; low: number };
  oxygenThreshold: { low: number };
  tempThreshold: { high: number };
  gasThresholds: {
    co: number;
    co2: number;
    methane: number;
    voc: number;
  };
  mqttBroker: string;
  mqttPort: number;
  pushNotificationsEnabled: boolean;
}
