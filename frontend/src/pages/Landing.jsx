import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BrainCircuit,
  TrendingUp,
  ShieldCheck,
  Cpu,
  LineChart,
  Target,
  Sparkles,
  ArrowRight,
  ChevronRight,
  Layers,
  CheckCircle2,
  Lock
} from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-slate-100 flex flex-col selection:bg-primary selection:text-slate-950">
      {/* Top Navigation */}
      <nav className="h-20 border-b border-surface-border/80 bg-background/80 backdrop-blur-md sticky top-0 z-50 px-6 lg:px-12 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-slate-950 shadow-lg shadow-primary/20">
            <BrainCircuit className="w-6 h-6" />
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-primary to-cyan-200 bg-clip-text text-transparent">
              TradeMind AI
            </span>
            <span className="block text-[10px] text-muted tracking-widest uppercase font-mono">
              Autonomous Multi-Agent System
            </span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <a href="#agents" className="hover:text-primary transition-colors">10 AI Agents</a>
          <a href="#how-it-works" className="hover:text-primary transition-colors">How It Works</a>
          <a href="#features" className="hover:text-primary transition-colors">Platform Features</a>
          <a href="#risk" className="hover:text-primary transition-colors">Risk Management</a>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/login')}
            className="px-4 py-2 text-xs font-mono font-semibold text-slate-300 hover:text-white transition-colors"
          >
            Sign In
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-primary to-cyan-400 hover:from-primary-hover hover:to-cyan-300 text-slate-950 font-bold text-xs font-mono shadow-lg shadow-primary/25 transition-all transform hover:-translate-y-0.5"
          >
            Launch Terminal
          </button>
        </div>
      </nav>

      {/* Hero Section (Matching AegisIQ aesthetic with glowing particle aura) */}
      <section className="relative pt-20 pb-24 px-6 lg:px-12 overflow-hidden flex flex-col items-center text-center">
        {/* Background Glowing Ambient Orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-primary/15 via-secondary/10 to-transparent blur-[140px] pointer-events-none rounded-full"></div>

        {/* Top Tagline Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-elevated/80 border border-primary/30 text-primary text-xs font-mono font-semibold mb-6 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 animate-spin text-cyan-300" />
          <span>Next-Gen Multi-Agent Trading Intelligence · 2026 Edition</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-4xl leading-[1.1] mb-6">
          AI-Powered Insights for{' '}
          <span className="bg-gradient-to-r from-primary via-cyan-300 to-secondary bg-clip-text text-transparent">
            Smarter Trading
          </span>{' '}
          Decisions
        </h1>

        <p className="text-base sm:text-lg text-slate-400 max-w-2xl mb-10 leading-relaxed">
          Analyze financial markets, discover high-probability trading opportunities, and manage portfolio risk using ten specialized autonomous AI agents.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-primary to-cyan-400 hover:from-primary-hover hover:to-cyan-300 text-slate-950 font-extrabold text-sm font-mono shadow-xl shadow-primary/30 transition-all transform hover:-translate-y-1"
          >
            <span>Explore Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate('/login')}
            className="flex items-center gap-2 px-7 py-3.5 rounded-xl bg-surface-elevated hover:bg-surface-border text-slate-200 font-semibold text-sm font-mono border border-surface-border transition-all"
          >
            <span>Create Free Account</span>
          </button>
        </div>

        {/* Interactive Terminal Preview Card (Matching Streamlit & Quantive dark terminal screenshots) */}
        <div className="w-full max-w-5xl rounded-2xl border border-primary/25 bg-surface/90 backdrop-blur-xl p-4 sm:p-6 shadow-2xl shadow-primary/10 relative">
          <div className="flex items-center justify-between pb-4 border-b border-surface-border mb-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-bearish"></span>
              <span className="w-3 h-3 rounded-full bg-amber-400"></span>
              <span className="w-3 h-3 rounded-full bg-bullish"></span>
              <span className="ml-2 text-xs font-mono text-muted">trademind.terminal://active-feed</span>
            </div>
            <span className="text-[11px] font-mono text-primary font-bold">10 AGENTS SYNCHRONIZED</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
            <div className="p-4 rounded-xl bg-surface-elevated/70 border border-surface-border">
              <span className="text-[10px] text-muted font-mono uppercase block mb-1">Live Asset Stream</span>
              <div className="text-xl font-bold font-mono text-slate-100">RELIANCE.NS</div>
              <div className="text-sm font-mono text-bullish font-semibold mt-1">₹2,980.50 (+1.84%)</div>
              <div className="mt-3 text-xs text-slate-400">RSI 58.4 · 50 EMA Bullish Crossover</div>
            </div>

            <div className="p-4 rounded-xl bg-surface-elevated/70 border border-surface-border">
              <span className="text-[10px] text-muted font-mono uppercase block mb-1">AI Orchestrator Verdict</span>
              <div className="text-xl font-bold font-mono text-bullish">BUY CANDIDATE</div>
              <div className="text-sm font-mono text-slate-200 mt-1">Composite Score: 78.4 / 100</div>
              <div className="mt-3 text-xs text-slate-400">Target: ₹3,120.00 | Stop-Loss: ₹2,910.00</div>
            </div>

            <div className="p-4 rounded-xl bg-surface-elevated/70 border border-surface-border">
              <span className="text-[10px] text-muted font-mono uppercase block mb-1">Risk Budgeting Engine</span>
              <div className="text-xl font-bold font-mono text-primary">MODERATE RISK</div>
              <div className="text-sm font-mono text-slate-200 mt-1">Max Risk Per Trade: 1.0%</div>
              <div className="mt-3 text-xs text-slate-400">Sizing: 14 Shares (Risk: ₹1,000)</div>
            </div>
          </div>
        </div>
      </section>

      {/* Ten Specialized Agents Section */}
      <section id="agents" className="py-20 px-6 lg:px-12 bg-surface/40 border-t border-surface-border">
        <div className="max-w-6xl mx-auto text-center mb-16">
          <span className="text-xs font-mono font-bold text-primary tracking-widest uppercase block mb-2">Multi-Agent Architecture</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-100 tracking-tight">
            Ten Specialized AI Agents Working in Harmony
          </h2>
          <p className="text-sm sm:text-base text-slate-400 mt-3 max-w-2xl mx-auto">
            Instead of relying on a single fallible model, TradeMind AI distributes market reasoning across 10 specialized micro-agents orchestrated via Directed Graph logic.
          </p>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { id: 1, name: 'Market Data Agent', desc: 'Collects & verifies OHLCV data, checks gaps.' },
            { id: 2, name: 'Technical Agent', desc: 'RSI, MACD, EMAs, Bollinger Bands, VWAP.' },
            { id: 3, name: 'Fundamental Agent', desc: 'P/E, P/B, EPS growth, ROE, debt leverage.' },
            { id: 4, name: 'News Sentiment Agent', desc: 'Scans financial wire news & event polarity.' },
            { id: 5, name: 'Opportunity Agent', desc: 'Synthesizes tech & fundamental buy/sell setups.' },
            { id: 6, name: 'Prediction Agent', desc: 'Ridge & ML regression price corridors.' },
            { id: 7, name: 'Risk Agent', desc: 'Calculates position sizing & downside stops.' },
            { id: 8, name: 'Portfolio Agent', desc: 'Evaluates sector exposure & diversification.' },
            { id: 9, name: 'Trading Decision Agent', desc: 'Produces final explainable BUY/HOLD verdict.' },
            { id: 10, name: 'Monitoring Agent', desc: 'Tracks paper outcomes & Sharpe performance.' },
          ].map((ag) => (
            <div key={ag.id} className="p-4 rounded-xl bg-surface border border-surface-border hover:border-primary/50 transition-all hover:-translate-y-1 group">
              <div className="w-8 h-8 rounded-lg bg-surface-elevated text-primary border border-primary/20 flex items-center justify-center font-mono font-bold text-xs mb-3 group-hover:scale-110 transition-transform">
                0{ag.id}
              </div>
              <h3 className="text-sm font-bold text-slate-100 mb-1.5 font-mono">{ag.name}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{ag.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-6 lg:px-12 border-t border-surface-border">
        <div className="max-w-6xl mx-auto text-center mb-16">
          <span className="text-xs font-mono font-bold text-primary tracking-widest uppercase block mb-2">Automated Workflow</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-100 tracking-tight">
            From Market Input to Risk-Controlled Execution
          </h2>
        </div>

        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-surface border border-surface-border relative">
            <span className="text-4xl font-extrabold font-mono text-slate-800 absolute top-4 right-4">01</span>
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-100 mb-2">1. Ingest & Analyze</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Real-time OHLCV market feeds are validated, generating momentum indicators, balance sheet evaluations, and sentiment scores.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-surface border border-surface-border relative">
            <span className="text-4xl font-extrabold font-mono text-slate-800 absolute top-4 right-4">02</span>
            <div className="w-10 h-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center mb-4">
              <Target className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-100 mb-2">2. Opportunity & Risk</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              ML regressors forecast 5-day trajectories while the Risk Management Agent computes strict position sizing and ATR stop distances.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-surface border border-surface-border relative">
            <span className="text-4xl font-extrabold font-mono text-slate-800 absolute top-4 right-4">03</span>
            <div className="w-10 h-10 rounded-xl bg-bullish/10 text-bullish flex items-center justify-center mb-4">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-100 mb-2">3. Paper Trade & Learn</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Orders are simulated with realistic slippage and transaction fees, logging outcomes into the continuous self-learning loop.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-10 px-6 lg:px-12 border-t border-surface-border bg-surface text-center text-xs text-slate-500">
        <div className="max-w-4xl mx-auto space-y-3">
          <div className="flex items-center justify-center gap-2 font-mono text-slate-300 font-bold">
            <BrainCircuit className="w-4 h-4 text-primary" />
            <span>TradeMind AI Financial Research Platform</span>
          </div>
          <p className="text-[11px] leading-relaxed text-slate-400">
            Disclaimer: TradeMind AI is designed strictly for decision support, mathematical simulation, and educational financial analysis. It does not provide licensed investment advice or guarantee profits. Paper trading operates on simulated virtual capital.
          </p>
          <div className="pt-2 text-[10px] font-mono text-slate-500">
            © 2026 TradeMind AI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;

