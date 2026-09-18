import React, { useState } from 'react';
import { Settings, X, Save, Sliders } from 'lucide-react';
import { DeviceConfig } from '../types';

interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: DeviceConfig;
  onSave: (newConfig: DeviceConfig) => void;
}

export const ConfigModal: React.FC<ConfigModalProps> = ({
  isOpen,
  onClose,
  config,
  onSave,
}) => {
  const [formData, setFormData] = useState<DeviceConfig>(config);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950/50">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-zinc-800 text-zinc-300">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-100 font-mono">SENSOR THRESHOLDS & MQTT CONFIG</h2>
              <p className="text-xs text-zinc-400">Configure alarm limits and MQTT broker endpoints</p>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-100 p-1.5 rounded-lg hover:bg-zinc-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-1">Max Heart Rate (BPM)</label>
              <input
                type="number"
                value={formData.heartRateThreshold.high}
                onChange={e => setFormData({ ...formData, heartRateThreshold: { ...formData.heartRateThreshold, high: Number(e.target.value) } })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm font-mono text-zinc-200"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-1">Min Oxygen SpO2 (%)</label>
              <input
                type="number"
                value={formData.oxygenThreshold.low}
                onChange={e => setFormData({ ...formData, oxygenThreshold: { ...formData.oxygenThreshold, low: Number(e.target.value) } })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm font-mono text-zinc-200"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-1">Max Temperature (°C)</label>
              <input
                type="number"
                step="0.1"
                value={formData.tempThreshold.high}
                onChange={e => setFormData({ ...formData, tempThreshold: { ...formData.tempThreshold, high: Number(e.target.value) } })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm font-mono text-zinc-200"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-1">Max CO Gas Limit (ppm)</label>
              <input
                type="number"
                value={formData.gasThresholds.co}
                onChange={e => setFormData({ ...formData, gasThresholds: { ...formData.gasThresholds, co: Number(e.target.value) } })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm font-mono text-zinc-200"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-zinc-400 mb-1">MQTT Broker URL</label>
            <input
              type="text"
              value={formData.mqttBroker}
              onChange={e => setFormData({ ...formData, mqttBroker: e.target.value })}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm font-mono text-zinc-200"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-mono text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-zinc-100 font-mono text-xs font-semibold flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Configuration</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
