import React, { useState } from 'react';
import { Shield, Key, Wifi, Server, CheckCircle2, Lock, Terminal, AlertTriangle, X } from 'lucide-react';
import { HandshakeState } from '../types';

interface HandshakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  handshake: HandshakeState;
  onVerify: (data: { ssid: string; identity: string; eapMethod: 'PEAP-MSCHAPv2' | 'EAP-TLS' | 'EAP-TTLS'; macAddress: string }) => void;
}

export const HandshakeModal: React.FC<HandshakeModalProps> = ({
  isOpen,
  onClose,
  handshake,
  onVerify,
}) => {
  const [ssid, setSsid] = useState(handshake.ssid);
  const [identity, setIdentity] = useState(handshake.identity);
  const [eapMethod, setEapMethod] = useState<'PEAP-MSCHAPv2' | 'EAP-TLS' | 'EAP-TTLS'>(handshake.eapMethod);
  const [macAddress, setMacAddress] = useState(handshake.macAddress);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [stepLog, setStepLog] = useState<string[]>([]);

  if (!isOpen) return null;

  const handleRunHandshake = () => {
    setIsAuthenticating(true);
    setStepLog([
      "[1/5] Initializing Wi-Fi station mode on ESP32...",
      "[2/5] Configuring WPA2-Enterprise supplicant credentials...",
    ]);

    setTimeout(() => {
      setStepLog(prev => [...prev, "[3/5] Performing EAP Identity exchange with RADIUS server..."]);
    }, 600);

    setTimeout(() => {
      setStepLog(prev => [...prev, "[4/5] Validating server certificate chain (SHA-256 TLS Fingerprint)..."]);
    }, 1200);

    setTimeout(() => {
      setStepLog(prev => [...prev, "[5/5] Completing 4-way EAPOL handshake & GTK/PTK installation..."]);
    }, 1800);

    setTimeout(() => {
      setIsAuthenticating(false);
      onVerify({ ssid, identity, eapMethod, macAddress });
      onClose();
    }, 2400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950/50">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-indigo-950/80 border border-indigo-500/30 text-indigo-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-100 font-mono">WPA2-ENTERPRISE HARDWARE AUTHENTICATION</h2>
              <p className="text-xs text-zinc-400">Secure 802.1X EAP handshake for ESP32 microcontroller authorization</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-100 p-1.5 rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          <div className="bg-amber-950/20 border border-amber-500/30 rounded-xl p-4 flex items-start space-x-3 text-xs text-amber-200">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Security Protocol Mandate:</span> In accordance with industrial standards, sensor outputs are strictly zeroed out and in standby until the ESP32 successfully completes the cryptographic WPA2-Enterprise hardware handshake.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-1.5 flex items-center space-x-1.5">
                <Wifi className="w-3.5 h-3.5 text-indigo-400" />
                <span>Enterprise SSID</span>
              </label>
              <input
                type="text"
                value={ssid}
                onChange={e => setSsid(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-1.5 flex items-center space-x-1.5">
                <Key className="w-3.5 h-3.5 text-indigo-400" />
                <span>EAP Method</span>
              </label>
              <select
                value={eapMethod}
                onChange={e => setEapMethod(e.target.value as any)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 font-mono focus:outline-none focus:border-indigo-500"
              >
                <option value="PEAP-MSCHAPv2">PEAP with MSCHAPv2</option>
                <option value="EAP-TLS">EAP-TLS (Mutual Certificate)</option>
                <option value="EAP-TTLS">EAP-TTLS with PAP</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-1.5 flex items-center space-x-1.5">
                <Server className="w-3.5 h-3.5 text-indigo-400" />
                <span>Radius / Network Identity</span>
              </label>
              <input
                type="text"
                value={identity}
                onChange={e => setIdentity(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-1.5 flex items-center space-x-1.5">
                <Lock className="w-3.5 h-3.5 text-indigo-400" />
                <span>ESP32 Hardware MAC Address</span>
              </label>
              <input
                type="text"
                value={macAddress}
                onChange={e => setMacAddress(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Handshake Progress Log */}
          {isAuthenticating && (
            <div className="bg-black/60 border border-zinc-800 rounded-xl p-4 font-mono text-xs text-emerald-400 space-y-1.5">
              <div className="flex items-center space-x-2 text-zinc-400 mb-2">
                <Terminal className="w-4 h-4 animate-spin" />
                <span>Executing EAP-TLS / PEAP Hardware Handshake...</span>
              </div>
              {stepLog.map((log, idx) => (
                <div key={idx} className="animate-fadeIn">{log}</div>
              ))}
            </div>
          )}

          {/* Current Status Box */}
          <div className="bg-zinc-950/60 border border-zinc-800 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${handshake.verified ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              <div className="text-xs">
                <div className="font-mono text-zinc-200 font-semibold">
                  {handshake.verified ? 'Status: Authenticated & Connected' : 'Status: Standby / Awaiting Handshake'}
                </div>
                <div className="text-zinc-500">
                  {handshake.verified ? `IP: ${handshake.ipAddress} | RSSI: ${handshake.rssi} dBm` : 'No secure session established'}
                </div>
              </div>
            </div>
            {handshake.verified && (
              <div className="flex items-center space-x-1 text-emerald-400 text-xs font-mono">
                <CheckCircle2 className="w-4 h-4" />
                <span>Verified</span>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end space-x-3 px-6 py-4 border-t border-zinc-800 bg-zinc-950/50">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-mono text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          >
            Cancel
          </button>
          <button
            disabled={isAuthenticating}
            onClick={handleRunHandshake}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-zinc-100 font-mono text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50 flex items-center space-x-2"
          >
            <Shield className="w-4 h-4" />
            <span>{isAuthenticating ? 'Authenticating...' : 'Initiate Hardware Handshake'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
