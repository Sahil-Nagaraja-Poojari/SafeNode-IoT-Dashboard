import React, { useState } from 'react';
import { Terminal, Send, Trash2, Cpu, Wifi } from 'lucide-react';
import { HandshakeState } from '../types';

interface SerialMonitorProps {
  handshake: HandshakeState;
}

export const SerialMonitor: React.FC<SerialMonitorProps> = ({ handshake }) => {
  const [commandInput, setCommandInput] = useState('');
  const [localLogs, setLocalLogs] = useState<string[]>([
    "[MQTT] Subscribed to topic: indus/telemetry/sensors",
    "[MQTT] Subscribed to topic: indus/alerts/push",
    "[SYSTEM] Ready for ESP32 hardware telemetry stream...",
  ]);

  const handleSendCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commandInput.trim()) return;
    setLocalLogs(prev => [...prev, `> ${commandInput}`, `[ACK] Command dispatched to ESP32 queue: ${commandInput}`]);
    setCommandInput('');
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Terminal className="w-4 h-4 text-amber-400" />
          <h2 className="text-sm font-bold font-mono text-zinc-100">ESP32 HARDWARE SERIAL & MQTT MONITOR</h2>
        </div>
        <button
          onClick={() => setLocalLogs([])}
          className="text-zinc-500 hover:text-zinc-300 p-1 rounded transition-colors"
          title="Clear Console"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Terminal Screen */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 font-mono text-xs text-zinc-300 h-64 overflow-y-auto space-y-1.5 mb-4 shadow-inner">
        {handshake.handshakeLogs.map((log, idx) => (
          <div key={`hs-${idx}`} className="text-indigo-300">{log}</div>
        ))}
        {localLogs.map((log, idx) => (
          <div key={`loc-${idx}`} className={log.startsWith('>') ? 'text-amber-300 font-semibold' : 'text-zinc-400'}>
            {log}
          </div>
        ))}
        {handshake.verified && (
          <div className="text-emerald-400 animate-pulse">
            [MQTT] Telemetry packet received: HR={72 + Math.floor(Math.random()*5)}, SpO2=98%, Temp=37.1°C
          </div>
        )}
      </div>

      {/* Command Input */}
      <form onSubmit={handleSendCommand} className="flex gap-2">
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-500 font-mono text-xs">&gt;</span>
          <input
            type="text"
            value={commandInput}
            onChange={e => setCommandInput(e.target.value)}
            placeholder="Send AT command or MQTT topic payload..."
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-7 pr-3 py-2 text-xs font-mono text-zinc-200 focus:outline-none focus:border-indigo-500"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-zinc-100 font-mono text-xs font-semibold flex items-center space-x-1 shadow transition-colors"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Send</span>
        </button>
      </form>
    </div>
  );
};
