import React from 'react';
import { Download, ShieldAlert, CheckCircle, Bell } from 'lucide-react';
import { AlertLog } from '../types';

interface GasLogTableProps {
  alerts: AlertLog[];
  onAcknowledge: (id: string) => void;
}

export const GasLogTable: React.FC<GasLogTableProps> = ({ alerts, onAcknowledge }) => {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <ShieldAlert className="w-4 h-4 text-red-400" />
          <h2 className="text-sm font-bold font-mono text-zinc-100">THRESHOLD ALERTS & PUSH NOTIFICATION LOG</h2>
        </div>
        <button
          onClick={() => {
            const csv = "data:text/csv;charset=utf-8," + encodeURIComponent(
              ["ID,Timestamp,Sensor,Value,Threshold,Severity,Message"].join(",") + "\n" +
              alerts.map(a => `${a.id},${new Date(a.timestamp).toISOString()},${a.sensor},${a.value},${a.threshold},${a.severity},"${a.message}"`).join("\n")
            );
            const link = document.createElement("a");
            link.setAttribute("href", csv);
            link.setAttribute("download", `induslink_alerts_${Date.now()}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }}
          className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-mono text-xs transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export CSV</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto max-h-64 space-y-2 pr-1">
        {alerts.length === 0 ? (
          <div className="h-40 flex flex-col items-center justify-center text-zinc-500 font-mono text-xs bg-zinc-950/40 rounded-xl border border-dashed border-zinc-800">
            <CheckCircle className="w-6 h-6 text-emerald-500 mb-2" />
            <span>No active threshold alarms. All sensor parameters nominal.</span>
          </div>
        ) : (
          alerts.map(alert => (
            <div
              key={alert.id}
              className={`flex items-center justify-between p-3 rounded-xl border font-mono text-xs ${
                alert.severity === 'CRITICAL'
                  ? 'bg-red-950/30 border-red-500/40 text-red-200'
                  : 'bg-amber-950/30 border-amber-500/40 text-amber-200'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Bell className={`w-4 h-4 ${alert.severity === 'CRITICAL' ? 'text-red-400 animate-bounce' : 'text-amber-400'}`} />
                <div>
                  <div className="font-bold flex items-center space-x-2">
                    <span>{alert.sensor}</span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] bg-black/40">
                      Val: {alert.value} (Limit: {alert.threshold})
                    </span>
                  </div>
                  <div className="text-[11px] text-zinc-400">{alert.message}</div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <span className="text-[10px] text-zinc-500">{new Date(alert.timestamp).toLocaleTimeString()}</span>
                {!alert.acknowledged ? (
                  <button
                    onClick={() => onAcknowledge(alert.id)}
                    className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-[11px] transition-colors"
                  >
                    Acknowledge
                  </button>
                ) : (
                  <span className="text-emerald-400 text-[11px]">Acknowledged</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
