import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory state for ESP32 & Sensors
let handshakeState = {
  verified: false,
  ssid: "ENTERPRISE-SECURE-INDUS",
  identity: "esp32-node-77a4@factory.net",
  eapMethod: "PEAP-MSCHAPv2" as const,
  macAddress: "24:6F:28:B4:77:A4",
  ipAddress: "192.168.10.142",
  rssi: -64, // dBm
  cipher: "WPA2-Enterprise / CCMP (AES)",
  connectedAt: null as number | null,
  handshakeLogs: [
    "[SYSTEM] ESP32 Gateway initialized. Waiting for WPA2-Enterprise handshake...",
  ],
};

let deviceConfig = {
  heartRateThreshold: { high: 110, low: 50 },
  oxygenThreshold: { low: 92 },
  tempThreshold: { high: 39.0 },
  gasThresholds: {
    co: 30, // ppm
    co2: 1000, // ppm
    methane: 50, // ppm
    voc: 200, // ppm
  },
  mqttBroker: "mqtt://industrial-broker.local:1883",
  mqttPort: 1883,
  pushNotificationsEnabled: true,
};

let historicalLogs: any[] = [];
let activeAlerts: any[] = [];
let telemetryHistory: any[] = [];

// Helper to generate a baseline telemetry sample
function generateTelemetry() {
  const now = Date.now();
  const hr = Math.floor(68 + Math.sin(now / 2000) * 8 + Math.random() * 4);
  const spo2 = Math.floor(97 + Math.random() * 2);
  const temp = Number((36.8 + Math.sin(now / 5000) * 0.4 + Math.random() * 0.3).toFixed(1));
  
  const gas = {
    co: Number((2.4 + Math.random() * 1.5).toFixed(1)),
    co2: Math.floor(420 + Math.random() * 45),
    methane: Number((1.1 + Math.random() * 0.4).toFixed(2)),
    voc: Math.floor(45 + Math.random() * 12),
  };

  // GPS coordinates around an industrial facility (Austin TX / Munich example)
  const baseLat = 30.2672;
  const baseLng = -97.7431;
  const gps = {
    latitude: Number((baseLat + Math.sin(now / 10000) * 0.0015).toFixed(6)),
    longitude: Number((baseLng + Math.cos(now / 10000) * 0.0015).toFixed(6)),
    altitude: 184.5,
    speed: Number((1.2 + Math.random() * 0.5).toFixed(1)),
    satellites: 11,
    fixStatus: "3D FIX" as const,
  };

  return {
    timestamp: now,
    heartRate: hr,
    oxygenLevel: spo2,
    temperature: temp,
    gasLevels: gas,
    gps,
  };
}

// API Routes
app.get("/api/status", (req, res) => {
  if (!handshakeState.verified) {
    res.json({
      handshake: handshakeState,
      config: deviceConfig,
      telemetry: {
        timestamp: Date.now(),
        heartRate: 0,
        oxygenLevel: 0,
        temperature: 0.0,
        gasLevels: { co: 0, co2: 0, methane: 0, voc: 0 },
        gps: { latitude: 0, longitude: 0, altitude: 0, speed: 0, satellites: 0, fixStatus: "STANDBY" },
      },
      alerts: activeAlerts,
    });
  } else {
    const telemetry = generateTelemetry();
    
    // Check threshold alerts
    if (telemetry.heartRate > deviceConfig.heartRateThreshold.high) {
      triggerAlert("Heart Rate High", telemetry.heartRate, deviceConfig.heartRateThreshold.high, "CRITICAL", "Heart Rate exceeded maximum threshold!");
    }
    if (telemetry.oxygenLevel < deviceConfig.oxygenThreshold.low) {
      triggerAlert("Oxygen Level Low", telemetry.oxygenLevel, deviceConfig.oxygenThreshold.low, "CRITICAL", "SpO2 dropped below critical limit!");
    }
    if (telemetry.gasLevels.co > deviceConfig.gasThresholds.co) {
      triggerAlert("CO Gas Warning", telemetry.gasLevels.co, deviceConfig.gasThresholds.co, "WARNING", "Carbon Monoxide concentration elevated!");
    }

    telemetryHistory.push(telemetry);
    if (telemetryHistory.length > 100) telemetryHistory.shift();

    res.json({
      handshake: handshakeState,
      config: deviceConfig,
      telemetry,
      alerts: activeAlerts,
      history: telemetryHistory,
    });
  }
});

function triggerAlert(sensor: string, value: number, threshold: number, severity: 'WARNING' | 'CRITICAL', message: string) {
  // Check if unacknowledged alert already exists for this sensor
  const exists = activeAlerts.find(a => a.sensor === sensor && !a.acknowledged);
  if (!exists) {
    const alert = {
      id: "alt-" + Math.random().toString(36).substring(2, 9),
      timestamp: Date.now(),
      sensor,
      value,
      threshold,
      severity,
      message,
      acknowledged: false,
    };
    activeAlerts.unshift(alert);
    if (activeAlerts.length > 50) activeAlerts.pop();
  }
}

// Handshake verification endpoint (WPA2-Enterprise)
app.post("/api/handshake/verify", (req, res) => {
  const { ssid, identity, eapMethod, macAddress } = req.body;
  
  const timestamp = Date.now();
  handshakeState.verified = true;
  handshakeState.ssid = ssid || handshakeState.ssid;
  handshakeState.identity = identity || handshakeState.identity;
  handshakeState.eapMethod = eapMethod || handshakeState.eapMethod;
  handshakeState.macAddress = macAddress || handshakeState.macAddress;
  handshakeState.connectedAt = timestamp;

  handshakeState.handshakeLogs.push(
    `[${new Date(timestamp).toLocaleTimeString()}] EAPOL: Starting WPA2-Enterprise 4-way handshake...`,
    `[${new Date(timestamp).toLocaleTimeString()}] RADIUS: Verifying credentials for identity '${handshakeState.identity}' via ${handshakeState.eapMethod}`,
    `[${new Date(timestamp).toLocaleTimeString()}] RADIUS: Certificate chain verified successfully (SHA-256 fingerprint OK)`,
    `[${new Date(timestamp).toLocaleTimeString()}] EAPOL: Key exchange completed (Group GTK & Pairwise PTK installed)`,
    `[${new Date(timestamp).toLocaleTimeString()}] DHCP: Assigned IP ${handshakeState.ipAddress} to MAC ${handshakeState.macAddress}`,
    `[${new Date(timestamp).toLocaleTimeString()}] MQTT: Connected securely to broker at ${deviceConfig.mqttBroker} (TLS v1.3)`
  );

  res.json({ success: true, handshake: handshakeState });
});

app.post("/api/handshake/disconnect", (req, res) => {
  const timestamp = Date.now();
  handshakeState.verified = false;
  handshakeState.connectedAt = null;
  handshakeState.handshakeLogs.push(
    `[${new Date(timestamp).toLocaleTimeString()}] DISCONNECT: ESP32 client disconnected or authentication terminated.`
  );
  res.json({ success: true, handshake: handshakeState });
});

app.post("/api/alerts/acknowledge", (req, res) => {
  const { alertId } = req.body;
  activeAlerts = activeAlerts.map(a => a.id === alertId ? { ...a, acknowledged: true } : a);
  res.json({ success: true, alerts: activeAlerts });
});

app.post("/api/config", (req, res) => {
  deviceConfig = { ...deviceConfig, ...req.body };
  res.json({ success: true, config: deviceConfig });
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
