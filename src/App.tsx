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

import {
  TelemetryData,
  HandshakeState,
  DeviceConfig,
  AlertLog,
} from './types';

import {
  getLatestTelemetry,
  getTelemetryHistory,
} from './safenodeService';


export default function App() {

  const [activeView, setActiveView] =
    useState<'dashboard' | 'arduino'>('dashboard');


  // --------------------------------------------------
  // HANDSHAKE
  // --------------------------------------------------

  const [handshake, setHandshake] = useState<HandshakeState>({
    verified: true,
    ssid: 'SafeNode WiFi',
    identity: 'safenode-01',
    eapMethod: 'PEAP-MSCHAPv2',
    macAddress: 'ESP32',
    ipAddress: 'Connected',
    rssi: 0,
    cipher: 'WiFi',
    connectedAt: Date.now(),
    handshakeLogs: [
      '[SYSTEM] SafeNode ESP32 connected.',
      '[SYSTEM] Supabase telemetry link active.',
    ],
  });


  // --------------------------------------------------
  // CONFIG
  // --------------------------------------------------

  const [config, setConfig] = useState<DeviceConfig>({
    heartRateThreshold: {
      high: 110,
      low: 50,
    },

    oxygenThreshold: {
      low: 92,
    },

    tempThreshold: {
      high: 39.0,
    },

    gasThresholds: {
      co: 30,
      co2: 1000,
      methane: 50,
      voc: 200,
    },

    mqttBroker: 'Supabase',

    mqttPort: 443,

    pushNotificationsEnabled: true,
  });


  // --------------------------------------------------
  // TELEMETRY
  // --------------------------------------------------

  const [telemetry, setTelemetry] =
    useState<TelemetryData>({
      timestamp: Date.now(),

      heartRate: 0,

      oxygenLevel: 0,

      temperature: 0,

      gasLevels: {
        co: 0,
        co2: 0,
        methane: 0,
        voc: 0,
      },

      gps: {
        latitude: 0,
        longitude: 0,
        altitude: 0,
        speed: 0,
        satellites: 0,
        fixStatus: 'STANDBY',
      },
    });


  const [history, setHistory] =
    useState<TelemetryData[]>([]);


  const [alerts, setAlerts] =
    useState<AlertLog[]>([]);


  const [isHandshakeOpen, setIsHandshakeOpen] =
    useState(false);


  const [isConfigOpen, setIsConfigOpen] =
    useState(false);


  const [notificationsEnabled, setNotificationsEnabled] =
    useState(true);


  // --------------------------------------------------
  // CONVERT SUPABASE DATA → OLD DASHBOARD FORMAT
  // --------------------------------------------------

  const convertTelemetry = (data: any): TelemetryData => {

    const latitude =
      data.latitude ?? 0;

    const longitude =
      data.longitude ?? 0;

    const temperature =
      data.temperature ?? 0;

    const gas =
      data.gas_raw ?? 0;


    return {

      timestamp: data.created_at
        ? new Date(data.created_at).getTime()
        : Date.now(),

      // MAX30102 is not currently connected
      heartRate: 0,

      oxygenLevel: 0,

      temperature,

      gasLevels: {

        // MQ-2 is currently an ADC raw value,
        // not calibrated ppm.
        co: gas,

        co2: 0,

        methane: 0,

        voc: 0,
      },

      gps: {

        latitude,

        longitude,

        altitude: 0,

        speed: 0,

        satellites:
          latitude !== 0 && longitude !== 0
            ? 1
            : 0,

        fixStatus:
          latitude !== 0 && longitude !== 0
            ? '3D FIX'
            : 'STANDBY',
      },
    };
  };


  // --------------------------------------------------
  // LOAD DATA FROM SUPABASE
  // --------------------------------------------------

  const loadTelemetry = async () => {

    try {

      const latest =
        await getLatestTelemetry();


      if (latest) {

        const converted =
          convertTelemetry(latest);

        setTelemetry(converted);


        // Create SOS alert when button is pressed
        if (latest.sos) {

          const sosAlert: AlertLog = {

            id: String(latest.id),

            timestamp:
              new Date(latest.created_at).getTime(),

            sensor: 'SOS',

            value: 1,

            threshold: 0,

            severity: 'CRITICAL',

            message:
              'Emergency SOS button activated.',

            acknowledged: false,
          };

          setAlerts([sosAlert]);
        }

      }


      const historyData =
        await getTelemetryHistory(30);


      if (historyData.length > 0) {

        const convertedHistory =
          historyData.map(convertTelemetry);

        setHistory(convertedHistory);
      }

    } catch (error) {

      console.error(
        'Failed to load SafeNode telemetry:',
        error
      );

    }

  };


  // --------------------------------------------------
  // POLL SUPABASE
  // --------------------------------------------------

  useEffect(() => {

    loadTelemetry();

    const interval =
      setInterval(loadTelemetry, 5000);

    return () =>
      clearInterval(interval);

  }, []);


  // --------------------------------------------------
  // HANDSHAKE
  // --------------------------------------------------

  const handleVerifyHandshake = async () => {

    setHandshake({

      ...handshake,

      verified: true,

      connectedAt: Date.now(),

      handshakeLogs: [

        ...handshake.handshakeLogs,

        '[SYSTEM] SafeNode connection verified.',

      ],

    });

  };


  const handleDisconnect = async () => {

    setHandshake({

      ...handshake,

      verified: false,

      connectedAt: null,

      handshakeLogs: [

        ...handshake.handshakeLogs,

        '[SYSTEM] SafeNode connection disconnected.',

      ],

    });

  };


  // --------------------------------------------------
  // ALERT
  // --------------------------------------------------

  const handleAcknowledgeAlert =
    (alertId: string) => {

      setAlerts(previousAlerts =>

        previousAlerts.map(alert =>

          alert.id === alertId

            ? {
                ...alert,
                acknowledged: true,
              }

            : alert

        )

      );

    };


  // --------------------------------------------------
  // CONFIG
  // --------------------------------------------------

  const handleSaveConfig =
    (newConfig: DeviceConfig) => {

      setConfig(newConfig);

    };


  // --------------------------------------------------
  // ACTIVE ALERT COUNT
  // --------------------------------------------------

  const activeAlertsCount =
    alerts.filter(
      alert => !alert.acknowledged
    ).length;


  // --------------------------------------------------
  // DASHBOARD
  // --------------------------------------------------

  return (

    <div className="
      min-h-screen
      bg-zinc-950
      text-zinc-100
      flex
      flex-col
      font-sans
      antialiased
    ">

      <Header

        handshake={handshake}

        config={config}

        activeAlertsCount={
          activeAlertsCount
        }

        onOpenHandshake={() =>
          setIsHandshakeOpen(true)
        }

        onDisconnect={
          handleDisconnect
        }

        onOpenConfig={() =>
          setIsConfigOpen(true)
        }

        onToggleNotifications={() =>
          setNotificationsEnabled(
            !notificationsEnabled
          )
        }

        notificationsEnabled={
          notificationsEnabled
        }

        activeView={activeView}

        onViewChange={setActiveView}

      />


      <main className="
        flex-1
        max-w-7xl
        w-full
        mx-auto
        p-6
        space-y-6
      ">


        {activeView === 'arduino' ? (

          <ArduinoIde

            handshake={handshake}

            onVerifyHandshake={
              handleVerifyHandshake
            }

          />

        ) : (

          <>

            {/* OVERVIEW */}

            <OverviewCards

              telemetry={telemetry}

              isVerified={
                handshake.verified
              }

              config={config}

              onOpenHandshake={() =>
                setIsHandshakeOpen(true)
              }

            />


            {/* CHART + GPS */}

            <div className="
              grid
              grid-cols-1
              lg:grid-cols-3
              gap-6
            ">

              <div className="
                lg:col-span-2
              ">

                <RealtimeCharts

                  history={history}

                  isVerified={
                    handshake.verified
                  }

                />

              </div>


              <div>

                <GpsTracker

                  telemetry={telemetry}

                  isVerified={
                    handshake.verified
                  }

                />

              </div>

            </div>


            {/* SERIAL + ALERTS */}

            <div className="
              grid
              grid-cols-1
              lg:grid-cols-2
              gap-6
            ">

              <SerialMonitor

                handshake={handshake}

              />


              <GasLogTable

                alerts={alerts}

                onAcknowledge={
                  handleAcknowledgeAlert
                }

              />

            </div>

          </>

        )}

      </main>


      {/* HANDSHAKE MODAL */}

      <HandshakeModal

        isOpen={isHandshakeOpen}

        onClose={() =>
          setIsHandshakeOpen(false)
        }

        handshake={handshake}

        onVerify={
          handleVerifyHandshake
        }

      />


      {/* CONFIG MODAL */}

      <ConfigModal

        isOpen={isConfigOpen}

        onClose={() =>
          setIsConfigOpen(false)
        }

        config={config}

        onSave={
          handleSaveConfig
        }

      />

    </div>

  );

}