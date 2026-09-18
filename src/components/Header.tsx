import React from 'react';
import { Shield, ShieldAlert, Cpu, Wifi, Bell, BellOff, Terminal, Settings, RefreshCw, Power, FileCode, LayoutDashboard } from 'lucide-react';
import { HandshakeState, DeviceConfig } from '../types';

interface HeaderProps {
  handshake: HandshakeState;
  config: DeviceConfig;
  activeAlertsCount: number;
  onOpenHandshake: () => void;
  onDisconnect: () => void;
  onOpenConfig: () => void;
  onToggleNotifications: () => void;
  notificationsEnabled: boolean;
  activeView: 'dashboard' | 'arduino';
  onViewChange: (view: 'dashboard' | 'arduino') => void;
}

export const Header: React.FC<HeaderProps> = ({
  handshake,
  config,
  activeAlertsCount,
  onOpenHandshake,
  onDisconnect,
  onOpenConfig,
  onToggleNotifications,
  notificationsEnabled,
  activeView,
  onViewChange,
}) => {
  return (
    <header className="bg-zinc-900 border-b border-zinc-800 text-zinc-100 px-6 py-4 sticky top-0 z-50 backdrop-blur-md bg-zinc-900/95">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand & Title */}
        <div className="flex items-center space-x-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-800 shadow-lg shadow-indigo-900/40 border border-indigo-500/30">
            <Cpu className="w-5 h-5 text-indigo-100 animate-pulse" />
            <div className={`absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-zinc-900 ${
              handshake.verified ? 'bg-emerald-500 animate-ping' : 'bg-amber-500'
            }`} />
            <div className={`absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-zinc-900 ${
              handshake.verified ? 'bg-emerald-500' : 'bg-amber-500'
            }`} />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold tracking-wide font-mono text-zinc-100">INDUSLINK // ESP32 TELEMETRY</h1>
              <span className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono border border-zinc-700">v2.4</span>
            </div>
            <p className="text-xs text-zinc-400">Industrial Sensor Monitoring & WPA2-Enterprise MQTT Gateway</p>
          </div>
        </div>

        {/* View Tabs & Status Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Dashboard / Arduino IDE Switcher */}
          <div className="flex items-center space-x-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-xs font-mono">
            <button
              onClick={() => onViewChange('dashboard')}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg transition-all ${
                activeView === 'dashboard' ? 'bg-indigo-600 text-zinc-100 font-semibold shadow' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </button>
            <button
              onClick={() => onViewChange('arduino')}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg transition-all ${
                activeView === 'arduino' ? 'bg-indigo-600 text-zinc-100 font-semibold shadow' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>In-Build Arduino IDE</span>
            </button>
          </div>

          {/* WPA2 Enterprise Badge */}
          <button
            onClick={onOpenHandshake}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all duration-200 border ${
              handshake.verified
                ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/50 shadow-sm'
                : 'bg-amber-950/40 border-amber-500/40 text-amber-300 hover:bg-amber-900/40 animate-pulse'
            }`}
            title="Click to manage WPA2-Enterprise Handshake"
          >
            {handshake.verified ? <Shield className="w-4 h-4 text-emerald-400" /> : <ShieldAlert className="w-4 h-4 text-amber-400" />}
            <span className="hidden sm:inline">{handshake.verified ? 'WPA2-Enterprise: SECURE' : 'STANDBY'}</span>
          </button>

          {/* Settings Button */}
          <button
            onClick={onOpenConfig}
            className="p-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-300 hover:bg-zinc-700 transition-colors"
            title="Configure Thresholds & MQTT"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Disconnect */}
          {handshake.verified && (
            <button
              onClick={onDisconnect}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-red-900/30 border border-red-700/40 text-red-300 hover:bg-red-900/50 text-xs font-mono transition-colors"
              title="Disconnect ESP32 & Reset to Standby"
            >
              <Power className="w-3.5 h-3.5" />
              <span>DISCONNECT</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
