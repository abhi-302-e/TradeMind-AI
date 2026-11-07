import React, { useState, useEffect } from 'react';
import { FileText, Download, Sparkles, Printer, CheckCircle2 } from 'lucide-react';
import { reportService } from '../services/api';

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const res = await reportService.listReports();
      setReports(res.data.reports || []);
      if (res.data.reports?.length > 0) {
        setSelectedReport(res.data.reports[0]);
      }
    } catch (err) {
      console.error('Reports error:', err);
    }
  };

  const handleGenerate = async (sym = 'RELIANCE.NS') => {
    try {
      setGenerating(true);
      const res = await reportService.generateReport(sym);
      setReports((prev) => [res.data, ...prev]);
      setSelectedReport(res.data);
    } catch (err) {
      console.error('Generate error:', err);
    } finally {
      setGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto font-mono">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Institutional Research Reports</h1>
          <p className="text-xs text-muted mt-1">Multi-agent synthesized trade theses, valuation matrices, and risk assessments</p>
        </div>

        <button
          onClick={() => handleGenerate('RELIANCE.NS')}
          disabled={generating}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-cyan-400 hover:from-primary-hover hover:to-cyan-300 text-slate-950 font-bold text-xs shadow-md shadow-primary/20 transition-all disabled:opacity-50"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{generating ? 'Synthesizing...' : 'Generate New Synthesis Report'}</span>
        </button>
      </div>

      {/* Main Grid: Reports List on Left, Preview on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 1 Col: Reports List */}
        <div className="space-y-3">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
            Archived Intelligence Reports
          </span>

          {reports.map((rpt) => (
            <div
              key={rpt.id}
              onClick={() => setSelectedReport(rpt)}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                selectedReport?.id === rpt.id
                  ? 'bg-surface-elevated border-primary/50 shadow-md shadow-primary/10'
                  : 'bg-surface border-surface-border hover:bg-surface-elevated/60'
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-bold text-slate-100">{rpt.symbol}</span>
                <span className="text-[10px] text-primary font-bold">{rpt.id}</span>
              </div>
              <h4 className="text-xs font-semibold text-slate-200 line-clamp-1">{rpt.title}</h4>
              <div className="flex items-center justify-between text-[10px] text-muted mt-2">
                <span className="text-bullish font-bold">{rpt.verdict}</span>
                <span>{new Date(rpt.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Right 2 Cols: Report Printable Document View */}
        <div className="lg:col-span-2 bg-surface border border-surface-border rounded-xl p-6 shadow-xl space-y-6">
          {selectedReport ? (
            <>
              <div className="flex items-center justify-between pb-4 border-b border-surface-border">
                <div>
                  <span className="text-[10px] text-primary uppercase tracking-widest font-bold">
                    TradeMind AI Official Research Document
                  </span>
                  <h2 className="text-lg font-bold text-slate-100 mt-1">{selectedReport.title}</h2>
                  <span className="text-xs text-muted">{selectedReport.id} · Generated {selectedReport.created_at}</span>
                </div>

                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-surface-elevated hover:bg-surface-border text-slate-200 border border-surface-border text-xs transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Export / Print PDF</span>
                </button>
              </div>

              {/* Synthesis Verdict Banner */}
              <div className="p-4 bg-surface-elevated rounded-xl border border-surface-border flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-muted uppercase">Multi-Agent Consensus Verdict</span>
                  <div className="text-xl font-extrabold text-bullish mt-0.5">{selectedReport.verdict}</div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-muted uppercase">Composite Score</span>
                  <div className="text-xl font-extrabold text-primary">{selectedReport.score} / 100</div>
                </div>
              </div>

              {/* Executive Summary */}
              <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
                <h4 className="font-bold text-slate-100 uppercase tracking-wider text-[11px]">Executive Summary</h4>
                <p className="p-3 bg-surface-elevated/60 rounded-lg border border-surface-border/50">
                  {selectedReport.summary}
                </p>
              </div>

              {/* Audit Signoff */}
              <div className="pt-4 border-t border-surface-border flex items-center justify-between text-[11px] text-muted">
                <span>Verified by 10 Autonomous Analytical Agents</span>
                <span className="text-bullish flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Orchestrator Validated
                </span>
              </div>
            </>
          ) : (
            <div className="py-20 text-center text-muted text-xs">
              Select a report from the archive to view details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;
