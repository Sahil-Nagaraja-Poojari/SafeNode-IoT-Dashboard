import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { HandshakeModal } from './components/HandshakeModal';
import { OverviewCards } from './components/OverviewCards';
import { RealtimeCharts } from './components/RealtimeCharts';
import { GpsTracker } from './components/GpsTracker';
import { SerialMonitor } from './components/SerialMonitor';
import { GasLogTable } from './components/GasLogTable';
import { ConfigModal } from './components/ConfigModal';
import { ArduinoIde } from './components/ArduinoIde';
import { TelemetryData, HandshakeState, DeviceConfig, AlertLog } from './types';

export default function App() {
  const [activeView, setActiveView] = useState<'dashboard' | 'arduino'>('dashboard');

  const [handshake, setHandshake] = useState<HandshakeState>({
    verified: false,
    ssid: "ENTERPRISE-SECURE-INDUS",
    identity: "esp32-node-77a4@factory.net",
    eapMethod: "PEAP-MSCHAPv2",
    macAddress: "24:6F:28:B4:77:A4",
    ipAddress: "192.168.10.142",
    rssi: -64,
    cipher: "WPA2-Enterprise / CCMP (AES)",
    connectedAt: null,
    handshakeLogs: [
      "[SYSTEM] ESP32 Gateway initialized. Waiting for WPA2-Enterprise handshake...",
    ],
  });

  const [config, setConfig] = useState<DeviceConfig>({
    heartRateThreshold: { high: 110, low: 50 },
    oxygenThreshold: { low: 92 },
    tempThreshold: { high: 39.0 },
    gasThresholds: { co: 30, co2: 1000, methane: 50, voc: 200 },
    mqttBroker: "mqtt://industrial-broker.local:1883",
    mqttPort: 1883,
    pushNotificationsEnabled: true,
  });

  const [telemetry, setTelemetry] = useState<TelemetryData>({
    timestamp: Date.now(),
    heartRate: 0,
    oxygenLevel: 0,
    temperature: 0.0,
    gasLevels: { co: 0, co2: 0, methane: 0, voc: 0 },
    gps: { latitude: 0, longitude: 0, altitude: 0, speed: 0, satellites: 0, fixStatus: "STANDBY" },
  });

  const [history, setHistory] = useState<TelemetryData[]>([]);
  const [alerts, setAlerts] = useState<AlertLog[]>([]);
  const [isHandshakeOpen, setIsHandshakeOpen] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // Poll backend status
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch('/api/status');
        if (res.ok) {
          const data = await res.json();
          setHandshake(data.handshake);
          setConfig(data.config);
          setTelemetry(data.telemetry);
          if (data.history) setHistory(data.history);
          if (data.alerts) setAlerts(data.alerts);
        }
      } catch (err) {
        // Silent fallback during cold start or network transition
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 1500);
    return () => clearInterval(interval);
  }, []);

  const handleVerifyHandshake = async (data?: { ssid: string; identity: string; eapMethod: any; macAddress: string }) => {
    try {
      const payload = data || {
        ssid: handshake.ssid,
        identity: handshake.identity,
        eapMethod: handshake.eapMethod,
        macAddress: handshake.macAddress,
      };
      const res = await fetch('/api/handshake/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.success) {
        setHandshake(json.handshake);
      }
    } catch (err) {
      console.error("Handshake verification error:", err);
    }
  };

  const handleDisconnect = async () => {
    try {
      const res = await fetch('/api/handshake/disconnect', { method: 'POST' });
      const json = await res.json();
      if (json.success) {
        setHandshake(json.handshake);
      }
    } catch (err) {
      console.error("Disconnect error:", err);
    }
  };

  const handleAcknowledgeAlert = async (alertId: string) => {
    try {
      const res = await fetch('/api/alerts/acknowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertId }),
      });
      const json = await res.json();
      if (json.success) {
        setAlerts(json.alerts);
      }
    } catch (err) {
      console.error("Acknowledge alert error:", err);
    }
  };

  const handleSaveConfig = async (newConfig: DeviceConfig) => {
    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig),
      });
      const json = await res.json();
      if (json.success) {
        setConfig(json.config);
      }
    } catch (err) {
      console.error("Config save error:", err);
    }
  };

  const activeAlertsCount = alerts.filter(a => !a.acknowledged).length;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans antialiased">
      <Header
        handshake={handshake}
        config={config}
        activeAlertsCount={activeAlertsCount}
        onOpenHandshake={() => setIsHandshakeOpen(true)}
        onDisconnect={handleDisconnect}
        onOpenConfig={() => setIsConfigOpen(true)}
        onToggleNotifications={() => setNotificationsEnabled(!notificationsEnabled)}
        notificationsEnabled={notificationsEnabled}
        activeView={activeView}
        onViewChange={setActiveView}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        {activeView === 'arduino' ? (
          <ArduinoIde
            handshake={handshake}
            onVerifyHandshake={() => handleVerifyHandshake()}
          />
        ) : (
          <>
            {/* Top Overview Cards (Heart Rate, SpO2, Temp, Gas) */}
            <OverviewCards
              telemetry={telemetry}
              isVerified={handshake.verified}
              config={config}
              onOpenHandshake={() => setIsHandshakeOpen(true)}
            />

            {/* Real-time Charts & Satellite GPS Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <RealtimeCharts history={history} isVerified={handshake.verified} />
              </div>
              <div>
                <GpsTracker telemetry={telemetry} isVerified={handshake.verified} />
              </div>
            </div>

            {/* Bottom Row: Serial Monitor & Threshold Alert Log */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SerialMonitor handshake={handshake} />
              <GasLogTable alerts={alerts} onAcknowledge={handleAcknowledgeAlert} />
            </div>
          </>
        )}
      </main>

      {/* Modals */}
      <HandshakeModal
        isOpen={isHandshakeOpen}
        onClose={() => setIsHandshakeOpen(false)}
        handshake={handshake}
        onVerify={handleVerifyHandshake}
      />

      <ConfigModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        config={config}
        onSave={handleSaveConfig}
      />
    </div>
  );
}
