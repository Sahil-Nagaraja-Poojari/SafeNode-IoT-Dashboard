import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line } from 'recharts';
import { Activity, BarChart2, TrendingUp } from 'lucide-react';
import { TelemetryData } from '../types';

interface RealtimeChartsProps {
  history: TelemetryData[];
  isVerified: boolean;
}

export const RealtimeCharts: React.FC<RealtimeChartsProps> = ({ history, isVerified }) => {
  const [activeTab, setActiveTab] = useState<'vitals' | 'temp' | 'gas'>('vitals');

  const formattedData = history.map(h => ({
    time: new Date(h.timestamp).toLocaleTimeString(),
    heartRate: h.heartRate,
    oxygenLevel: h.oxygenLevel,
    temperature: h.temperature,
    co: h.gasLevels.co,
    co2: h.gasLevels.co2,
    methane: h.gasLevels.methane,
  }));

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl mb-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-sm font-bold font-mono text-zinc-100 flex items-center space-x-2">
            <Activity className="w-4 h-4 text-indigo-400" />
            <span>REAL-TIME TELEMETRY STREAM & GRAPH VISUALIZATIONS</span>
          </h2>
          <p className="text-xs text-zinc-400">Instantaneous hardware updates streaming from ESP32 MQTT broker</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center space-x-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-xs font-mono">
          <button
            onClick={() => setActiveTab('vitals')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'vitals' ? 'bg-indigo-600 text-zinc-100 font-semibold shadow' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Vitals (HR & SpO2)
          </button>
          <button
            onClick={() => setActiveTab('temp')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'temp' ? 'bg-indigo-600 text-zinc-100 font-semibold shadow' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Temperature
          </button>
          <button
            onClick={() => setActiveTab('gas')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'gas' ? 'bg-indigo-600 text-zinc-100 font-semibold shadow' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Gas Array (CO/CO₂)
          </button>
        </div>
      </div>

      {/* Chart container */}
      <div className="h-72 w-full">
        {!isVerified || formattedData.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center bg-zinc-950/40 rounded-xl border border-dashed border-zinc-800 text-zinc-500 font-mono text-xs">
            <Activity className="w-8 h-8 text-zinc-700 mb-2 animate-pulse" />
            <span>Telemetry Stream Standby — Awaiting WPA2-Enterprise Handshake</span>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            {activeTab === 'vitals' ? (
              <AreaChart data={formattedData}>
                <defs>
                  <linearGradient id="hrColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="spo2Color" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="time" stroke="#71717a" fontSize={11} tickLine={false} />
                <YAxis stroke="#71717a" fontSize={11} tickLine={false} domain={[50, 120]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px', fontSize: '12px', fontFamily: 'monospace' }}
                  itemStyle={{ color: '#f43f5e' }}
                />
                <Area type="monotone" dataKey="heartRate" name="Heart Rate (BPM)" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#hrColor)" />
                <Area type="monotone" dataKey="oxygenLevel" name="Oxygen SpO2 (%)" stroke="#0ea5e9" strokeWidth={2} fillOpacity={1} fill="url(#spo2Color)" />
              </AreaChart>
            ) : activeTab === 'temp' ? (
              <AreaChart data={formattedData}>
                <defs>
                  <linearGradient id="tempColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="time" stroke="#71717a" fontSize={11} tickLine={false} />
                <YAxis stroke="#71717a" fontSize={11} tickLine={false} domain={[35, 42]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px', fontSize: '12px', fontFamily: 'monospace' }}
                />
                <Area type="monotone" dataKey="temperature" name="Core Temp (°C)" stroke="#f97316" strokeWidth={2} fillOpacity={1} fill="url(#tempColor)" />
              </AreaChart>
            ) : (
              <AreaChart data={formattedData}>
                <defs>
                  <linearGradient id="coColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="time" stroke="#71717a" fontSize={11} tickLine={false} />
                <YAxis stroke="#71717a" fontSize={11} tickLine={false} domain={[0, 50]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px', fontSize: '12px', fontFamily: 'monospace' }}
                />
                <Area type="monotone" dataKey="co" name="CO Gas (ppm)" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#coColor)" />
                <Area type="monotone" dataKey="methane" name="Methane (ppm)" stroke="#eab308" strokeWidth={2} fillOpacity={0.2} fill="#eab308" />
              </AreaChart>
            )}
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
