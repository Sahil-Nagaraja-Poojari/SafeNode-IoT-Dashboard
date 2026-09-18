import React from 'react';
import { Navigation, Globe, Compass, Satellite, MapPin, Gauge } from 'lucide-react';
import { TelemetryData } from '../types';

interface GpsTrackerProps {
  telemetry: TelemetryData;
  isVerified: boolean;
}

export const GpsTracker: React.FC<GpsTrackerProps> = ({ telemetry, isVerified }) => {
  const gps = telemetry.gps;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold font-mono text-zinc-100 flex items-center space-x-2">
            <Navigation className="w-4 h-4 text-emerald-400" />
            <span>SATELLITE GPS & LOCATION TRACKING</span>
          </h2>
          <span className={`text-xs px-2 py-0.5 rounded font-mono ${
            isVerified && gps.fixStatus === '3D FIX' ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40' : 'bg-zinc-800 text-zinc-400'
          }`}>
            {isVerified ? gps.fixStatus : 'STANDBY'}
          </span>
        </div>

        {/* Visual Map Simulator box */}
        <div className="relative h-44 bg-zinc-950 rounded-xl border border-zinc-800 overflow-hidden mb-4 flex items-center justify-center">
          {/* Grid pattern background */}
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#3f3f46_1px,transparent_1px)] [background-size:16px_16px]" />
          
          {!isVerified ? (
            <div className="text-center z-10 px-4">
              <Satellite className="w-8 h-8 text-zinc-700 mx-auto mb-2 animate-pulse" />
              <p className="text-xs font-mono text-zinc-500">GPS Receivers Standby — Awaiting ESP32 Handshake</p>
            </div>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
              <div className="relative flex items-center justify-center">
                <div className="absolute w-16 h-16 rounded-full bg-emerald-500/10 animate-ping" />
                <div className="absolute w-10 h-10 rounded-full bg-emerald-500/20 animate-pulse" />
                <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/50">
                  <MapPin className="w-3.5 h-3.5 text-zinc-950" />
                </div>
              </div>
              <div className="mt-3 px-3 py-1 rounded-full bg-zinc-900/90 border border-zinc-700 text-[11px] font-mono text-emerald-400 shadow">
                LAT: {gps.latitude.toFixed(4)}° N, LNG: {gps.longitude.toFixed(4)}° W
              </div>
            </div>
          )}
        </div>

        {/* GPS Metrics Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-3">
            <div className="flex items-center space-x-1.5 text-zinc-500 text-[11px] font-mono mb-1">
              <Compass className="w-3.5 h-3.5 text-indigo-400" />
              <span>ALTITUDE</span>
            </div>
            <div className="text-sm font-bold font-mono text-zinc-200">
              {isVerified ? `${gps.altitude} m` : '---'}
            </div>
          </div>

          <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-3">
            <div className="flex items-center space-x-1.5 text-zinc-500 text-[11px] font-mono mb-1">
              <Gauge className="w-3.5 h-3.5 text-emerald-400" />
              <span>SPEED</span>
            </div>
            <div className="text-sm font-bold font-mono text-zinc-200">
              {isVerified ? `${gps.speed} km/h` : '---'}
            </div>
          </div>

          <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-3">
            <div className="flex items-center space-x-1.5 text-zinc-500 text-[11px] font-mono mb-1">
              <Satellite className="w-3.5 h-3.5 text-sky-400" />
              <span>SATELLITES</span>
            </div>
            <div className="text-sm font-bold font-mono text-zinc-200">
              {isVerified ? `${gps.satellites} Locked` : '0'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
