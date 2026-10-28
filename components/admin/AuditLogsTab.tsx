"use client";

import { useState, useEffect } from "react";
import { History, Shield, RefreshCw, FileText, User, Zap } from "lucide-react";

interface AuditLogItem {
  id: string;
  actor_email: string;
  action: string;
  target_type: string;
  target_id?: string;
  details: Record<string, any>;
  created_at: string;
}

export default function AuditLogsTab() {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/audit-logs");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load audit logs");
      setLogs(data.logs || []);
    } catch (err: any) {
      setError(err.message || "Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const actionColors: Record<string, string> = {
    reset_run: "bg-[#fec01f]/15 text-[#fec01f] border-[#fec01f]/30",
    update_role: "bg-purple-500/15 text-purple-300 border-purple-500/30",
    add_admin: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    revoke_admin: "bg-rose-500/15 text-rose-300 border-rose-500/30",
    update_settings: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
    disqualify_player: "bg-rose-500/15 text-rose-300 border-rose-500/30",
    reinstate_player: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-mono uppercase tracking-wider text-white font-bold flex items-center gap-2">
            <History size={16} className="text-[#fec01f]" />
            <span>Immutable Administrative Audit Trail</span>
          </h3>
          <p className="text-xs text-white/60 mt-1">
            Chronological records of all administrative overrides, run resets, role changes, and broadcasts.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          disabled={loading}
          className="h-8 px-3 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 text-white text-xs font-mono flex items-center gap-1.5 transition-colors"
        >
          <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
          <span>Refresh</span>
        </button>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono">
          {error}
        </div>
      )}

      <div className="bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-white/5 border-b border-white/10 text-white/50 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-3">Staff Operator</th>
                <th className="py-3 px-3">Action Executed</th>
                <th className="py-3 px-3">Target Scope</th>
                <th className="py-3 px-4">Metadata Payload</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-white/50">
                    Loading audit trail...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-white/40 italic">
                    No administrative audit actions recorded yet.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                    {/* Timestamp */}
                    <td className="py-3 px-4 text-white/50 whitespace-nowrap">
                      {new Date(log.created_at).toLocaleDateString([], {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </td>

                    {/* Actor */}
                    <td className="py-3 px-3 text-white font-sans font-bold">
                      {log.actor_email}
                    </td>

                    {/* Action */}
                    <td className="py-3 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                          actionColors[log.action] || "bg-white/10 text-white border-white/20"
                        }`}
                      >
                        {log.action.replace("_", " ")}
                      </span>
                    </td>

                    {/* Target */}
                    <td className="py-3 px-3 text-white/70">
                      <span className="text-white/40 capitalize">{log.target_type}:</span>{" "}
                      <span className="font-bold text-white">
                        {log.target_id ? `${log.target_id.slice(0, 18)}` : "Global"}
                      </span>
                    </td>

                    {/* Metadata Payload */}
                    <td className="py-3 px-4 text-white/60">
                      {log.details && Object.keys(log.details).length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(log.details).map(([k, v]) => (
                            <span
                              key={k}
                              className="px-1.5 py-0.5 rounded bg-white/5 text-[10px] text-white/70"
                            >
                              {k}: <strong className="text-white">{String(v)}</strong>
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[10px] text-white/30">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
