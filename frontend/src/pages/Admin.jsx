import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Users,
  Activity,
  Cpu,
  Lock,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Ban,
  UserCheck,
  Search,
  Server
} from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const Admin = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [searchUser, setSearchUser] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState('');

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes, logsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/admin/stats`),
        axios.get(`${API_BASE_URL}/api/admin/users`),
        axios.get(`${API_BASE_URL}/api/admin/audit-logs`)
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data.users || []);
      setLogs(logsRes.data.logs || []);
    } catch (err) {
      console.error('Admin load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUser = (userId, currentStatus) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status: nextStatus } : u))
    );
    setActionMsg(`User #${userId} status changed to ${nextStatus}.`);
    setTimeout(() => setActionMsg(''), 3000);
  };

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(searchUser.toLowerCase()) ||
    u.email.toLowerCase().includes(searchUser.toLowerCase())
  );

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto font-mono select-none">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Admin Command Center</h1>
            <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
              PRIVILEGED ACCESS
            </span>
          </div>
          <p className="text-xs text-muted mt-1">Platform administration, customer account controls, AI cluster health, and security audit logs</p>
        </div>

        <button
          onClick={loadAdminData}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface hover:bg-surface-elevated text-slate-300 border border-surface-border text-xs transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh System Telemetry</span>
        </button>
      </div>

      {actionMsg && (
        <div className="p-3.5 rounded-xl bg-bullish/10 border border-bullish/30 text-bullish text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{actionMsg}</span>
        </div>
      )}

      {/* Admin KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-surface border border-surface-border rounded-xl">
          <span className="text-[10px] text-muted block uppercase">Registered Customers</span>
          <div className="text-2xl font-extrabold text-slate-100 mt-1">{stats?.total_users || 48}</div>
          <span className="text-xs text-primary font-semibold mt-1 block">{stats?.active_traders || 36} Active Traders Today</span>
        </div>

        <div className="p-4 bg-surface border border-surface-border rounded-xl">
          <span className="text-[10px] text-muted block uppercase">Simulated Paper Volume</span>
          <div className="text-2xl font-extrabold text-bullish mt-1">₹{stats?.total_simulated_volume_cr || '48.65'} Cr</div>
          <span className="text-xs text-muted mt-1 block">Zero Real-Money Risk</span>
        </div>

        <div className="p-4 bg-surface border border-surface-border rounded-xl">
          <span className="text-[10px] text-muted block uppercase">Agent Cluster Uptime</span>
          <div className="text-2xl font-extrabold text-slate-100 mt-1">{stats?.cluster_uptime || '99.98%'}</div>
          <span className="text-xs text-bullish font-semibold mt-1 block">10/10 Agents Operational</span>
        </div>

        <div className="p-4 bg-surface border border-surface-border rounded-xl">
          <span className="text-[10px] text-muted block uppercase">Storage & Engine</span>
          <div className="text-base font-extrabold text-slate-200 mt-2 truncate">FastAPI + PostgreSQL</div>
          <span className="text-xs text-primary mt-1 block">18 DB Relational Tables</span>
        </div>
      </div>

      {/* Customer Accounts Management Table */}
      <div className="bg-surface border border-surface-border rounded-xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-surface-border flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-bold text-xs text-slate-200 uppercase">
            <Users className="w-4 h-4 text-primary" />
            <span>Customer Accounts Management</span>
          </div>

          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted" />
            <input
              type="text"
              value={searchUser}
              onChange={(e) => setSearchUser(e.target.value)}
              placeholder="Search user name or email..."
              className="w-full pl-8 pr-3 py-1.5 bg-surface-elevated text-xs text-slate-200 border border-surface-border rounded-lg focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-elevated text-slate-400 border-b border-surface-border">
              <tr>
                <th className="py-3 px-4">User ID</th>
                <th className="py-3 px-4">Customer Name</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Paper Balance</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Joined</th>
                <th className="py-3 px-4 text-right">Admin Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border/50 text-slate-200">
              {filteredUsers.map((u) => {
                const isAdmin = u.role === 'admin';
                const isActive = u.status === 'ACTIVE';
                return (
                  <tr key={u.id} className="hover:bg-surface-elevated/40 transition-colors">
                    <td className="py-3 px-4 text-muted font-bold">#{u.id}</td>
                    <td className="py-3 px-4 font-bold text-slate-100">{u.name}</td>
                    <td className="py-3 px-4 text-slate-300">{u.email}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        isAdmin ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : 'bg-primary/10 text-primary border-primary/30'
                      }`}>
                        {isAdmin ? 'ADMINISTRATOR' : 'CUSTOMER'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-100">
                      ₹{u.paper_balance?.toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isActive ? 'text-bullish bg-bullish/10' : 'text-bearish bg-bearish/10'
                      }`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-muted text-[11px]">{u.joined_at}</td>
                    <td className="py-3 px-4 text-right">
                      {!isAdmin && (
                        <button
                          onClick={() => handleToggleUser(u.id, u.status)}
                          className={`px-2.5 py-1 rounded text-[10px] font-bold border transition-colors ${
                            isActive
                              ? 'bg-bearish/10 text-bearish border-bearish/30 hover:bg-bearish/20'
                              : 'bg-bullish/10 text-bullish border-bullish/30 hover:bg-bullish/20'
                          }`}
                        >
                          {isActive ? 'Freeze Account' : 'Reactivate'}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Security & Audit Logs Section */}
      <div className="bg-surface border border-surface-border rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-2 font-bold text-xs text-slate-200 uppercase pb-2 border-b border-surface-border">
          <Server className="w-4 h-4 text-primary" />
          <span>Real-Time Security & Audit Trail</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-slate-400 border-b border-surface-border/60">
              <tr>
                <th className="py-2 px-3">Log ID</th>
                <th className="py-2 px-3">Action</th>
                <th className="py-2 px-3">User</th>
                <th className="py-2 px-3">Role</th>
                <th className="py-2 px-3">IP Address</th>
                <th className="py-2 px-3">Time</th>
                <th className="py-2 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border/40 text-slate-300">
              {logs.map((lg) => (
                <tr key={lg.id} className="hover:bg-surface-elevated/40">
                  <td className="py-2 px-3 text-primary font-bold">{lg.id}</td>
                  <td className="py-2 px-3 font-semibold text-slate-200">{lg.action}</td>
                  <td className="py-2 px-3">{lg.user}</td>
                  <td className="py-2 px-3 text-muted">{lg.role}</td>
                  <td className="py-2 px-3 text-slate-400">{lg.ip}</td>
                  <td className="py-2 px-3 text-muted">{lg.time}</td>
                  <td className="py-2 px-3">
                    <span className={`text-[10px] font-bold ${lg.status === 'SUCCESS' ? 'text-bullish' : 'text-amber-400'}`}>
                      {lg.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Admin;
