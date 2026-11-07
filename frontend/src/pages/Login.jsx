import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BrainCircuit, Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('trader@trademind.ai');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.error || 'Authentication failed. Please verify your credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center px-4 relative overflow-hidden select-none">
      {/* Background glow */}
      <div className="absolute w-[500px] h-[300px] bg-primary/10 blur-[130px] rounded-full pointer-events-none"></div>

      <div className="w-full max-w-md bg-surface border border-surface-border rounded-2xl p-8 shadow-2xl relative z-10">
        {/* Brand header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-slate-950 shadow-lg shadow-primary/20 mb-3">
            <BrainCircuit className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-100 font-mono tracking-tight">TradeMind Terminal</h2>
          <p className="text-xs text-muted mt-1">Sign in to access your autonomous trading agents</p>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-bearish/10 border border-bearish/30 text-bearish text-xs font-mono mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono font-medium text-slate-300 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-surface-elevated border border-surface-border rounded-xl text-sm text-slate-100 focus:outline-none focus:border-primary font-mono"
                placeholder="trader@trademind.ai"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono font-medium text-slate-300 mb-1.5">Password</label>
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
            className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-primary to-cyan-400 hover:from-primary-hover hover:to-cyan-300 text-slate-950 font-bold text-xs font-mono shadow-lg shadow-primary/25 transition-all flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In to Terminal'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-surface-border text-center text-xs text-muted">
          <span>New to TradeMind AI? </span>
          <Link to="/register" className="text-primary font-semibold hover:underline">
            Create an Account
          </Link>
        </div>

        {/* Demo Credentials hint */}
        <div className="mt-4 p-2.5 rounded-lg bg-surface-elevated/70 border border-surface-border/50 text-[11px] font-mono text-slate-400 text-center">
          <span className="text-primary font-bold">Demo Quick-Access:</span> Enter any credentials or use pre-filled email.
        </div>
      </div>
    </div>
  );
};

export default Login;

