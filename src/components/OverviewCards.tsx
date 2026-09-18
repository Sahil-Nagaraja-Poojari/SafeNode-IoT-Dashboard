import React from 'react';
import { Activity, Heart, Droplets, Thermometer, Wind, Navigation, Lock, AlertTriangle, ShieldCheck } from 'lucide-react';
import { TelemetryData, DeviceConfig } from '../types';

interface OverviewCardsProps {
  telemetry: TelemetryData;
  isVerified: boolean;
  config: DeviceConfig;
  onOpenHandshake: () => void;
}

export const OverviewCards: React.FC<OverviewCardsProps> = ({
  telemetry,
  isVerified,
  config,
  onOpenHandshake,
}) => {
  const isHrAlert = telemetry.heartRate > config.heartRateThreshold.high || (telemetry.heartRate > 0 && telemetry.heartRate < config.heartRateThreshold.low);
  const isSpo2Alert = telemetry.oxygenLevel > 0 && telemetry.oxygenLevel < config.oxygenThreshold.low;
  const isTempAlert = telemetry.temperature > config.tempThreshold.high;
  const isCoAlert = telemetry.gasLevels.co > config.gasThresholds.co;

  if (!isVerified) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { title: "HEART BEAT (BPM)", icon: Heart, unit: "BPM", value: "00" },
          { title: "OXYGEN LEVEL (SPO2)", icon: Droplets, unit: "%", value: "00.0" },
          { title: "CORE TEMPERATURE", icon: Thermometer, unit: "°C", value: "00.0" },
          { title: "GAS SENSOR ARRAY", icon: Wind, unit: "PPM", value: "STANDBY" },
        ].map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="relative bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 overflow-hidden shadow-md">
              <div className="absolute inset-0 bg-zinc-950/60 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center p-4 text-center">
                <Lock className="w-5 h-5 text-amber-500 mb-2" />
                <p className="text-xs font-mono text-amber-300 font-semibold mb-1">STANDBY / ZEROED</p>
                <p className="text-[10px] text-zinc-400 mb-3">Requires WPA2-Enterprise Wi-Fi Handshake</p>
                <button
                  onClick={onOpenHandshake}
                  className="px-3 py-1 rounded-lg bg-indigo-600/80 hover:bg-indigo-600 text-zinc-100 font-mono text-[11px] transition-colors"
                >
                  Connect ESP32
                </button>
              </div>
              <div className="flex items-center justify-between text-zinc-400 mb-3">
                <span className="text-xs font-mono tracking-wider">{card.title}</span>
                <Icon className="w-4 h-4 text-zinc-600" />
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-bold font-mono text-zinc-600">{card.value}</span>
                <span className="text-xs font-mono text-zinc-600">{card.unit}</span>
              </div>
              <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-[11px] font-mono text-zinc-600">
                <span>Status: Awaiting Handshake</span>
                <span className="w-2 h-2 rounded-full bg-zinc-700" />
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Heart Rate Card */}
      <div className={`bg-zinc-900 border rounded-2xl p-5 shadow-lg transition-all duration-300 ${
        isHrAlert ? 'border-red-500/80 bg-red-950/20' : 'border-zinc-800 hover:border-zinc-700'
      }`}>
        <div className="flex items-center justify-between text-zinc-400 mb-3">
          <span className="text-xs font-mono tracking-wider">HEART BEAT (BPM)</span>
          <Heart className={`w-4 h-4 ${isHrAlert ? 'text-red-400 animate-bounce' : 'text-rose-500'}`} />
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-3xl font-bold font-mono text-zinc-100">{telemetry.heartRate}</span>
          <span className="text-xs font-mono text-zinc-400">BPM</span>
          {isHrAlert && <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-900/50 text-red-300 font-mono">ALERT</span>}
        </div>
        <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between text-[11px] font-mono text-zinc-400">
          <span>Safe Range: 60-100</span>
          <span className="flex items-center space-x-1 text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            <span>LIVE</span>
          </span>
        </div>
      </div>

      {/* Oxygen Level Card */}
      <div className={`bg-zinc-900 border rounded-2xl p-5 shadow-lg transition-all duration-300 ${
        isSpo2Alert ? 'border-red-500/80 bg-red-950/20' : 'border-zinc-800 hover:border-zinc-700'
      }`}>
        <div className="flex items-center justify-between text-zinc-400 mb-3">
          <span className="text-xs font-mono tracking-wider">OXYGEN LEVEL (SPO2)</span>
          <Droplets className="w-4 h-4 text-sky-400" />
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-3xl font-bold font-mono text-zinc-100">{telemetry.oxygenLevel}</span>
          <span className="text-xs font-mono text-zinc-400">%</span>
          {isSpo2Alert && <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-900/50 text-red-300 font-mono">LOW SPO2</span>}
        </div>
        <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between text-[11px] font-mono text-zinc-400">
          <span>Normal: 95-100%</span>
          <span className="flex items-center space-x-1 text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            <span>LIVE</span>
          </span>
        </div>
      </div>

      {/* Core Temperature Card */}
      <div className={`bg-zinc-900 border rounded-2xl p-5 shadow-lg transition-all duration-300 ${
        isTempAlert ? 'border-amber-500/80 bg-amber-950/20' : 'border-zinc-800 hover:border-zinc-700'
      }`}>
        <div className="flex items-center justify-between text-zinc-400 mb-3">
          <span className="text-xs font-mono tracking-wider">CORE TEMPERATURE</span>
          <Thermometer className="w-4 h-4 text-orange-400" />
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-3xl font-bold font-mono text-zinc-100">{telemetry.temperature}</span>
          <span className="text-xs font-mono text-zinc-400">°C</span>
          {isTempAlert && <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-900/50 text-amber-300 font-mono">HIGH</span>}
        </div>
        <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between text-[11px] font-mono text-zinc-400">
          <span>Optimal: 36.0-37.5°C</span>
          <span className="flex items-center space-x-1 text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            <span>LIVE</span>
          </span>
        </div>
      </div>

      {/* Gas Sensor Array Card */}
      <div className={`bg-zinc-900 border rounded-2xl p-5 shadow-lg transition-all duration-300 ${
        isCoAlert ? 'border-red-500/80 bg-red-950/20' : 'border-zinc-800 hover:border-zinc-700'
      }`}>
        <div className="flex items-center justify-between text-zinc-400 mb-3">
          <span className="text-xs font-mono tracking-wider">GAS ARRAY (CO / CO2)</span>
          <Wind className={`w-4 h-4 ${isCoAlert ? 'text-red-400 animate-pulse' : 'text-emerald-400'}`} />
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl font-bold font-mono text-zinc-100">{telemetry.gasLevels.co}</span>
          <span className="text-xs font-mono text-zinc-400">ppm CO</span>
          <span className="text-xs font-mono text-zinc-500">| {telemetry.gasLevels.co2} CO₂</span>
        </div>
        <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between text-[11px] font-mono text-zinc-400">
          <span>Methane: {telemetry.gasLevels.methane} ppm</span>
          <span className="flex items-center space-x-1 text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            <span>SECURE</span>
          </span>
        </div>
      </div>
    </div>
  );
};
