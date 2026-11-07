import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BrainCircuit, Lock, Mail, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [activeTab, setActiveTab] = useState('user'); // 'user' or 'admin'
  const [email, setEmail] = useState('trader@groww.in');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    setError('');
    if (tab === 'admin') {
      setEmail('forestnation08@gmail.com');
      setPassword('Abhi@302');
    } else {
      setEmail('trader@groww.in');
      setPassword('password123');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      if (activeTab === 'admin' || email.toLowerCase() === 'forestnation08@gmail.com' || email.includes('admin')) {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } else {
      setError(res.error || 'Authentication failed. Please verify your credentials.');
    }
  };

  const handleFastLogin = async (tab) => {
    const targetEmail = tab === 'admin' ? 'forestnation08@gmail.com' : 'trader@groww.in';
    const targetPass = tab === 'admin' ? 'Abhi@302' : 'password123';
    setEmail(targetEmail);
    setPassword(targetPass);
    setLoading(true);
    const res = await login(targetEmail, targetPass);
    setLoading(false);
    if (res.success) {
      navigate(tab === 'admin' ? '/admin' : '/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center px-4 relative overflow-hidden select-none">
      {/* Background glow */}
      <div className="absolute w-[500px] h-[300px] bg-primary/10 blur-[130px] rounded-full pointer-events-none"></div>

      <div className="w-full max-w-md bg-surface border border-surface-border rounded-2xl p-8 shadow-2xl relative z-10">
        {/* Brand header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-slate-950 shadow-lg shadow-primary/20 mb-3">
            <BrainCircuit className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-100 font-mono tracking-tight">TradeMind × Groww</h2>
          <p className="text-xs text-muted mt-1">Autonomous Multi-Agent Trading & Market Platform</p>
        </div>

        {/* Role Tabs: User vs Admin */}
        <div className="flex bg-surface-elevated p-1 rounded-xl border border-surface-border mb-6">
          <button
            type="button"
            onClick={() => handleTabSwitch('user')}
            className={`flex-1 py-2 text-xs font-mono font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
              activeTab === 'user'
                ? 'bg-primary text-slate-950 shadow-md shadow-primary/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>User / Customer</span>
          </button>
          <button
            type="button"
            onClick={() => handleTabSwitch('admin')}
            className={`flex-1 py-2 text-xs font-mono font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
              activeTab === 'admin'
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Admin Portal</span>
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-bearish/10 border border-bearish/30 text-bearish text-xs font-mono mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono font-medium text-slate-300 mb-1.5">
              {activeTab === 'admin' ? 'Admin ID / Security Email' : 'Email Address / Mobile'}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-surface-elevated border border-surface-border rounded-xl text-sm text-slate-100 focus:outline-none focus:border-primary font-mono"
                placeholder={activeTab === 'admin' ? 'forestnation08@gmail.com' : 'trader@groww.in'}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono font-medium text-slate-300 mb-1.5">
              {activeTab === 'admin' ? 'Master Admin Key' : 'Trading PIN / Password'}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-surface-elevated border border-surface-border rounded-xl text-sm text-slate-100 focus:outline-none focus:border-primary font-mono"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full mt-2 py-3 rounded-xl font-bold text-xs font-mono shadow-lg transition-all flex items-center justify-center gap-2 ${
              activeTab === 'admin'
                ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-amber-400/20'
                : 'bg-primary hover:bg-primary-hover text-slate-950 shadow-primary/20'
            }`}
          >
            <span>{loading ? 'Verifying...' : activeTab === 'admin' ? 'Enter Administrator Console' : 'Sign In to Live Trading'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* 1-Click Fast Switch Buttons */}
        <div className="mt-4 pt-4 border-t border-surface-border grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleFastLogin('user')}
            className="py-2 px-3 rounded-lg bg-surface-elevated hover:bg-surface-border border border-surface-border text-[11px] font-mono text-primary font-semibold transition-all text-center"
          >
            ⚡ 1-Click User Login
          </button>
          <button
            type="button"
            onClick={() => handleFastLogin('admin')}
            className="py-2 px-3 rounded-lg bg-surface-elevated hover:bg-surface-border border border-surface-border text-[11px] font-mono text-amber-400 font-semibold transition-all text-center"
          >
            👑 1-Click Admin Login
          </button>
        </div>

        <div className="mt-4 pt-3 border-t border-surface-border text-center text-xs text-muted">
          <span>New to TradeMind AI? </span>
          <Link to="/register" className="text-primary font-semibold hover:underline">
            Open Free Demat Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
