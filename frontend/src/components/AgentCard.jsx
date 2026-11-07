import React from 'react';
import { Cpu, Play, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';

const AgentCard = ({ agent, onRun, isRunning }) => {
  const isOnline = agent.status === 'ONLINE' || agent.status === 'success';

  return (
    <div className="bg-surface border border-surface-border hover:border-slate-700 rounded-xl p-4 transition-all hover:shadow-xl hover:shadow-black/50 group flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-surface-elevated text-primary border border-primary/20 group-hover:scale-105 transition-transform">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100 font-mono tracking-tight">{agent.name}</h3>
              <span className="text-[10px] text-muted font-mono">{agent.code_name || 'Agent'}</span>
            </div>
          </div>

          {/* Status Badge */}
          <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
            isOnline ? 'bg-bullish/10 text-bullish border border-bullish/20' : 'bg-bearish/10 text-bearish border border-bearish/20'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-bullish animate-pulse' : 'bg-bearish'}`}></span>
            {agent.status || 'ONLINE'}
          </span>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-300 leading-relaxed mb-4 line-clamp-2">
          {agent.description}
        </p>

        {/* Confidence & Accuracy Metrics (Matching AI Agent Dashboard Screenshot) */}
        <div className="grid grid-cols-2 gap-2 p-2.5 bg-surface-elevated rounded-lg border border-surface-border/60 text-xs font-mono mb-4">
          <div>
            <span className="text-[10px] text-muted block">Confidence</span>
            <span className="text-slate-100 font-bold">
              {agent.confidence ? `${(agent.confidence * 100).toFixed(0)}%` : '85%'}
            </span>
            <div className="w-full bg-slate-800 h-1 rounded-full mt-1 overflow-hidden">
              <div
                className="bg-primary h-full rounded-full"
                style={{ width: `${(agent.confidence || 0.85) * 100}%` }}
              ></div>
            </div>
          </div>

          <div>
            <span className="text-[10px] text-muted block">Success Rate</span>
            <span className="text-bullish font-bold">
              {agent.success_rate ? `${agent.success_rate}%` : '99.4%'}
            </span>
            <div className="w-full bg-slate-800 h-1 rounded-full mt-1 overflow-hidden">
              <div className="bg-bullish h-full rounded-full" style={{ width: '99%' }}></div>
            </div>
          </div>
        </div>

        {/* Evidence preview if present */}
        {agent.evidence && agent.evidence.length > 0 && (
          <div className="space-y-1 mb-4">
            <span className="text-[10px] text-muted uppercase font-mono tracking-wider block">Recent Findings:</span>
            {agent.evidence.slice(0, 2).map((ev, i) => (
              <div key={i} className="text-[11px] text-slate-300 flex items-start gap-1.5 leading-snug">
                <CheckCircle2 className="w-3 h-3 text-primary shrink-0 mt-0.5" />
                <span className="line-clamp-1">{ev}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Controls */}
      <div className="pt-3 border-t border-surface-border/60 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[10px] font-mono text-muted">
          <Clock className="w-3 h-3" />
          <span>{agent.latency || `${agent.execution_time_ms || 45}ms`}</span>
        </div>

        <button
          onClick={() => onRun && onRun(agent.code_name)}
          disabled={isRunning}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-elevated hover:bg-primary hover:text-slate-950 text-slate-200 text-xs font-mono font-medium border border-surface-border transition-all disabled:opacity-50"
        >
          <Play className="w-3 h-3" />
          <span>{isRunning ? 'Running...' : 'Run Agent'}</span>
        </button>
      </div>
    </div>
  );
};

export default AgentCard;
