"use client";

import { useState, useEffect } from "react";
import {
  ShieldCheck,
  Crown,
  Scale,
  UserCheck,
  UserPlus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Search,
  Users,
} from "lucide-react";
import { AdminRole } from "@/lib/admin/admin-auth";

interface AdminUser {
  id: string;
  email: string;
  role: AdminRole;
  created_at: string;
}

interface PlayerProfile {
  id: string;
  display_name: string;
  created_at: string;
}

interface RolesManagementTabProps {
  currentUserRole?: string | null;
  currentUserEmail?: string | null;
}

export default function RolesManagementTab({
  currentUserRole = "admin",
  currentUserEmail = "",
}: RolesManagementTabProps) {
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [recentPlayers, setRecentPlayers] = useState<PlayerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // New admin form
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState<AdminRole>("admin");
  const [submitting, setSubmitting] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchRolesData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/roles");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load roles");
      setAdminUsers(data.adminUsers || []);
      setRecentPlayers(data.recentPlayers || []);
    } catch (err: any) {
      setError(err.message || "Failed to load roles data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRolesData();
  }, []);

  const handleAddOrUpdate = async (emailToSet: string, roleToSet: AdminRole) => {
    if (!emailToSet.trim()) {
      setMessage({ text: "Please provide a valid email address", type: "error" });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch("/api/admin/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailToSet.trim(), role: roleToSet }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update role");

      setMessage({ text: data.message, type: "success" });
      setNewEmail("");
      fetchRolesData();
    } catch (err: any) {
      setMessage({ text: err.message || "Failed to update role", type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRoleChange = async (user: AdminUser, updatedRole: AdminRole) => {
    setActionLoadingId(user.id);
    setMessage(null);

    try {
      const res = await fetch("/api/admin/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, role: updatedRole }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update role");

      setMessage({ text: `Updated ${user.email} role to ${updatedRole}`, type: "success" });
      fetchRolesData();
    } catch (err: any) {
      setMessage({ text: err.message || "Failed to update role", type: "error" });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRevoke = async (user: AdminUser) => {
    const confirmed = window.confirm(
      `Revoke administrator access for ${user.email}?\n\nThey will no longer be able to access Mission Control.`
    );
    if (!confirmed) return;

    setActionLoadingId(user.id);
    setMessage(null);

    try {
      const res = await fetch(`/api/admin/roles?email=${encodeURIComponent(user.email)}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to revoke access");

      setMessage({ text: data.message, type: "success" });
      fetchRolesData();
    } catch (err: any) {
      setMessage({ text: err.message || "Failed to revoke access", type: "error" });
    } finally {
      setActionLoadingId(null);
    }
  };

  const roleBadgeStyles: Record<AdminRole, string> = {
    superadmin: "bg-purple-500/20 text-purple-300 border-purple-500/40",
    admin: "bg-[#fec01f]/20 text-[#fec01f] border-[#fec01f]/40",
    arbiter: "bg-teal-500/20 text-teal-300 border-teal-500/40",
    booth_staff: "bg-blue-500/20 text-blue-300 border-blue-500/40",
  };

  const roleIcons: Record<AdminRole, any> = {
    superadmin: Crown,
    admin: ShieldCheck,
    arbiter: Scale,
    booth_staff: UserCheck,
  };

  const isSuperadmin = currentUserRole === "superadmin";

  return (
    <div className="space-y-8">
      {/* Overview & Permission Notice */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-950/40 via-[#06061f] to-[#125252]/30 border border-white/10 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Crown size={20} className="text-[#fec01f]" />
              <h3 className="text-base font-bold text-white">
                Festival Access &amp; Role Management
              </h3>
            </div>
            <p className="text-xs text-white/70 max-w-2xl leading-relaxed">
              Administrative privileges are stored directly in PostgreSQL (<code className="text-[#fec01f]">admin_users</code> table).
              Assign fine-grained access for technical administrators, tournament arbiters, and physical festival booth attendants.
            </p>
          </div>

          <div className="shrink-0 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-mono">
            <span className="text-white/50 block text-[10px] uppercase">Your Permission Level</span>
            <span className="text-[#fec01f] font-bold capitalize">{currentUserRole}</span>
          </div>
        </div>
      </div>

      {/* Alert Banners */}
      {message && (
        <div
          className={`p-3.5 rounded-xl border text-xs font-mono flex items-center justify-between ${
            message.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
              : "bg-rose-500/10 border-rose-500/30 text-rose-400"
          }`}
        >
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="underline text-[10px]">
            Dismiss
          </button>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono">
          {error}
        </div>
      )}

      {/* Role Hierarchy Reference Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            role: "superadmin" as AdminRole,
            title: "Superadmin",
            desc: "Full root access. Can manage admin accounts, grant roles, edit festival settings, and delete runs.",
          },
          {
            role: "admin" as AdminRole,
            title: "Administrator",
            desc: "Operational access. Can reset player runs, audit leaderboard, review questions, and broadcast announcements.",
          },
          {
            role: "arbiter" as AdminRole,
            title: "Tournament Arbiter",
            desc: "Referees fair play. Can inspect turn telemetry, flag/disqualify suspicious runs, and export winners CSV.",
          },
          {
            role: "booth_staff" as AdminRole,
            title: "Booth Staff",
            desc: "On-site festival support. Quick access to search attendees and reset game runs after booth connection drops.",
          },
        ].map((card) => {
          const Icon = roleIcons[card.role];

          return (
            <div
              key={card.role}
              className="p-4 rounded-xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition-all"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className={`p-1.5 rounded-lg border text-xs ${roleBadgeStyles[card.role]}`}>
                  <Icon size={14} />
                </span>
                <span className="font-bold text-white text-xs font-mono">{card.title}</span>
              </div>
              <p className="text-[11px] text-white/60 leading-relaxed">{card.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Add New Staff Account Form */}
      <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10">
        <h4 className="text-xs font-mono uppercase tracking-wider text-[#fec01f] font-bold mb-3 flex items-center gap-2">
          <UserPlus size={16} />
          <span>Grant Access to New Staff Member</span>
        </h4>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAddOrUpdate(newEmail, newRole);
          }}
          className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
        >
          <div className="relative flex-1">
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="e.g. staff.member@gmail.com"
              className="w-full px-4 py-2.5 bg-white/5 border border-white/15 rounded-xl text-white text-xs font-mono placeholder:text-white/40 focus:outline-none focus:border-[#fec01f]"
              required
            />
          </div>

          <select
            value={newRole}
            onChange={(e) => setNewRole(e.target.value as AdminRole)}
            className="px-3 py-2.5 bg-[#0a0a28] border border-white/15 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-[#fec01f]"
          >
            {isSuperadmin && <option value="superadmin">Superadmin</option>}
            <option value="admin">Administrator</option>
            <option value="arbiter">Tournament Arbiter</option>
            <option value="booth_staff">Booth Staff</option>
          </select>

          <button
            type="submit"
            disabled={submitting}
            className="py-2.5 px-4 rounded-xl bg-[#fec01f] hover:bg-[#e5ac1b] text-black font-bold text-xs uppercase font-mono tracking-wider transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-md shrink-0"
          >
            <UserPlus size={14} />
            <span>{submitting ? "Adding..." : "Add to Team"}</span>
          </button>
        </form>
      </div>

      {/* Active Team Directory Table */}
      <div className="bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-white/10 bg-white/[0.01] flex items-center justify-between">
          <span className="text-xs font-mono uppercase tracking-wider text-white font-bold flex items-center gap-2">
            <Users size={15} className="text-[#fec01f]" />
            <span>Active Administrators &amp; Staff ({adminUsers.length})</span>
          </span>
          <span className="text-[11px] font-mono text-white/50">
            Source: PostgreSQL <code className="text-[#fec01f]">admin_users</code>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-white/5 border-b border-white/10 text-white/50 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Authorized Email</th>
                <th className="py-3 px-3">Current Role</th>
                <th className="py-3 px-3">Role Selection Dropdown</th>
                <th className="py-3 px-3">Granted At</th>
                <th className="py-3 px-4 text-right">Revoke Access</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-white/50">
                    Loading team privileges...
                  </td>
                </tr>
              ) : adminUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-white/40 italic">
                    No administrators found in database.
                  </td>
                </tr>
              ) : (
                adminUsers.map((user) => {
                  const isCurrentUser = Boolean(currentUserEmail && user.email.toLowerCase() === currentUserEmail.toLowerCase());
                  const isBusy = actionLoadingId === user.id;
                  const Icon = roleIcons[user.role] || ShieldCheck;

                  return (
                    <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                      {/* Email */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm font-sans">
                            {user.email}
                          </span>
                          {isCurrentUser && (
                            <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-mono">
                              You
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Current Role */}
                      <td className="py-3.5 px-3">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-bold uppercase ${
                            roleBadgeStyles[user.role]
                          }`}
                        >
                          <Icon size={12} />
                          <span>{user.role}</span>
                        </span>
                      </td>

                      {/* Role Selector Dropdown */}
                      <td className="py-3.5 px-3">
                        <select
                          value={user.role}
                          disabled={isBusy || (!isSuperadmin && user.role === "superadmin")}
                          onChange={(e) => handleRoleChange(user, e.target.value as AdminRole)}
                          className="px-2.5 py-1 rounded-lg bg-[#080822] border border-white/15 text-xs text-white focus:outline-none focus:border-[#fec01f] disabled:opacity-40"
                        >
                          {isSuperadmin && <option value="superadmin">Superadmin</option>}
                          <option value="admin">Administrator</option>
                          <option value="arbiter">Tournament Arbiter</option>
                          <option value="booth_staff">Booth Staff</option>
                        </select>
                      </td>

                      {/* Granted At */}
                      <td className="py-3.5 px-3 text-white/50 text-[11px]">
                        {new Date(user.created_at).toLocaleDateString([], {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>

                      {/* Revoke */}
                      <td className="py-3.5 px-4 text-right">
                        {isSuperadmin && !isCurrentUser ? (
                          <button
                            onClick={() => handleRevoke(user)}
                            disabled={isBusy}
                            title="Revoke Access"
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors disabled:opacity-40"
                          >
                            <Trash2 size={14} />
                          </button>
                        ) : (
                          <span className="text-[10px] text-white/30 italic">Protected</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
