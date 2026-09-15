import React, { useMemo } from "react";
import { useApp } from "../context/AppContext";
import { getBank } from "../data/banks";
import {
  formatCrore, formatNumber, rankedOpportunities, bankOpportunityScore, bankDimensions, decisionForScore, comparisonRows,
} from "../lib/engine";
import { Dialog, DialogContent, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { TRANSPARENCY_NOTES, SOURCES } from "../data/sources";
import { Printer, FileDown, X, Network } from "lucide-react";

export default function ExecutiveReport() {
  const { reportOpen, setReportOpen, selectedBank } = useApp();
  const bank = getBank(selectedBank);
  const ranked = useMemo(() => rankedOpportunities(selectedBank), [selectedBank]);
  const dims = bankDimensions(selectedBank);
  const oppScore = bankOpportunityScore(selectedBank);
  const decision = decisionForScore(oppScore);
  const rows = useMemo(() => comparisonRows(), []);
  const rank = [...rows].sort((a, b) => b.opportunityScore - a.opportunityScore).findIndex((r) => r.name === selectedBank) + 1;
  const top5 = ranked.slice(0, 5);
  const today = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

  const insights = [
    `${bank.short} ranks #${rank} of ${rows.length} banks on the BranchIQ national opportunity index (${oppScore}/100).`,
    `The strongest market opportunity is ${top5[0].state} with a score of ${top5[0].score}/100 (${top5[0].decision.label}).`,
    `Digital readiness is assessed at ${bank.digitalReadiness}/100, ${bank.digitalReadiness >= 82 ? "supporting digital-first distribution plays" : "indicating room to strengthen digital channels"}.`,
    `Network strength scores ${dims.networkStrength}/100 with geographic coverage at ${bank.geographicCoverage}/100.`,
    `${top5.filter((o) => o.score >= 80).length} markets qualify for an EXPAND stance; ${top5.filter((o) => o.score >= 60 && o.score < 80).length} for SELECTIVE EXPANSION among the top five.`,
  ];

  return (
    <Dialog open={reportOpen} onOpenChange={setReportOpen}>
      <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto bq-scroll p-0" data-testid="executive-report-dialog">
        <DialogTitle className="sr-only">BranchIQ Executive Report — {bank.name}</DialogTitle>
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-3 bg-[#071426] text-white no-print">
          <span className="font-display font-bold">Executive Report Preview</span>
          <div className="flex items-center gap-2">
            <Button data-testid="btn-print-report" onClick={() => window.print()} size="sm" className="bg-[#2563EB] hover:bg-[#1075db] gap-1.5"><Printer size={14} />Print</Button>
            <Button data-testid="btn-download-pdf" onClick={() => window.print()} size="sm" variant="secondary" className="gap-1.5"><FileDown size={14} />Download PDF</Button>
            <button onClick={() => setReportOpen(false)} className="p-1 hover:bg-white/10 rounded"><X size={18} /></button>
          </div>
        </div>

        <div id="executive-report" className="p-8 bg-white text-[#0C1D33]">
          {/* Cover */}
          <div className="border-b-2 border-[#071426] pb-5 mb-6">
            <div className="flex items-center gap-3 mb-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: "linear-gradient(135deg,#2563EB,#27C3E8)" }}><Network size={22} color="#fff" /></span>
              <div>
                <div className="font-display text-2xl font-extrabold tracking-tight">BRANCHIQ</div>
                <div className="text-xs text-slate-500">AI Banking Network Strategy Consultant</div>
              </div>
            </div>
            <h1 className="font-display text-xl font-bold mt-4">Strategic Network Assessment — {bank.name}</h1>
            <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-slate-600 mt-2">
              <span><b>Bank Selected:</b> {bank.name}</span>
              <span><b>Sector:</b> {bank.sector}</span>
              <span><b>Reporting Period:</b> {bank.reportingPeriod}</span>
              <span><b>Generated:</b> {today}</span>
            </div>
          </div>

          <Section n="1" title="Executive Summary">
            <p className="text-sm leading-relaxed">
              {bank.name} operates {formatNumber(bank.branches)} branches with deposits of {formatCrore(bank.deposits)} and advances of {formatCrore(bank.advances)} ({bank.reportingPeriod}, source: {bank.source}). BranchIQ assigns a national opportunity score of <b>{oppScore}/100</b>, mapping to a <b>{decision.label}</b> strategic posture. The bank ranks #{rank} of {rows.length} assessed banks on the analytical opportunity index.
            </p>
          </Section>

          <Section n="2" title="Network Overview">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[["Branch Network", formatNumber(bank.branches)], ["Deposits", formatCrore(bank.deposits)], ["Advances", formatCrore(bank.advances)], ["Coverage Index", `${bank.geographicCoverage}/100`]].map(([l, v]) => (
                <div key={l} className="border border-[#DFE7F0] rounded-lg p-3"><div className="text-[10px] uppercase tracking-wide text-slate-400">{l}</div><div className="font-display text-lg font-bold">{v}</div></div>
              ))}
            </div>
          </Section>

          <Section n="3" title="Top 5 Market Opportunities">
            <table className="w-full text-sm border border-[#DFE7F0]">
              <thead><tr className="bg-[#F4F7FB] text-left text-[11px] uppercase text-slate-500"><th className="px-3 py-2">Market</th><th className="px-3 py-2">Score</th><th className="px-3 py-2">Priority</th><th className="px-3 py-2">Stance</th></tr></thead>
              <tbody>
                {top5.map((o) => (
                  <tr key={o.state} className="border-t border-[#EEF2F8]"><td className="px-3 py-2 font-medium">{o.state}</td><td className="px-3 py-2 font-mono">{o.score}/100</td><td className="px-3 py-2">{o.priority}</td><td className="px-3 py-2 font-semibold" style={{ color: o.decision.color }}>{o.decision.label}</td></tr>
                ))}
              </tbody>
            </table>
          </Section>

          <Section n="4" title="Top 5 Strategic Insights">
            <ol className="list-decimal pl-5 space-y-1.5 text-sm">{insights.map((x, i) => <li key={i}>{x}</li>)}</ol>
          </Section>

          <div className="report-page-break" />

          <Section n="5" title="Opportunity Scores (Analytical Dimensions)">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {[["Network Strength", dims.networkStrength], ["Growth Opportunity", dims.growthOpportunity], ["Market Reach", dims.marketReach], ["Digital Readiness", dims.digitalReadiness], ["Expansion Opportunity", dims.expansionOpportunity]].map(([l, v]) => (
                <div key={l} className="border border-[#DFE7F0] rounded-lg p-3 text-center"><div className="font-display text-xl font-bold">{v}</div><div className="text-[10px] text-slate-500">{l}</div></div>
              ))}
            </div>
          </Section>

          <Section n="6" title="Competitive Position">
            <p className="text-sm leading-relaxed">Against peers, {bank.short} shows {dims.networkStrength >= 70 ? "a strong" : "a moderate"} network footprint and {dims.growthOpportunity >= 70 ? "high" : "steady"} growth momentum (deposit growth {bank.depositGrowth}%, credit growth {bank.creditGrowth}%). The {bank.sector.toLowerCase()} sector positioning suggests {bank.sector === "Private" ? "an emphasis on high-value urban and digital segments" : "broad-based reach with rural and semi-urban depth"}.</p>
          </Section>

          <Section n="7" title="Recommended Actions">
            <ul className="space-y-2 text-sm">
              {top5.map((o) => (
                <li key={o.state} className="border-l-2 pl-3" style={{ borderColor: o.decision.color }}><b>{o.state} ({o.decision.label}):</b> {o.recommendation}</li>
              ))}
            </ul>
          </Section>

          <Section n="8" title="Data Sources">
            <ul className="list-disc pl-5 text-sm space-y-1">{SOURCES.map((s) => <li key={s.id}><b>{s.name}</b> — {s.usedFor.join(", ")}.</li>)}</ul>
            <p className="text-sm mt-2"><b>Primary bank source:</b> <a href={bank.sourceUrl} target="_blank" rel="noreferrer" className="text-[#2563EB] underline">{bank.source}</a></p>
          </Section>

          <Section n="9" title="Methodology">
            <p className="text-sm leading-relaxed">Opportunity Score = 0.30·Market Growth + 0.20·Credit Opportunity + 0.15·Deposit Opportunity + 0.15·Customer Potential + 0.10·Competitive Opportunity + 0.10·Digital Readiness. Each component is a 0–100 model-generated estimate derived from public economic, credit, deposit and demographic indicators. Competitive opportunity is adjusted for the selected bank's relative network presence.</p>
          </Section>

          <Section n="10" title="Disclaimer">
            <p className="text-xs text-slate-500 leading-relaxed">BranchIQ provides analytical decision support based on publicly available information. It does not represent official recommendations from the banks or regulatory authorities.</p>
            <ul className="mt-2 space-y-1">{TRANSPARENCY_NOTES.map((t, i) => <li key={i} className="text-xs text-slate-500">• {t}</li>)}</ul>
          </Section>

          <div className="mt-8 pt-4 border-t border-[#DFE7F0] text-center text-[10px] text-slate-400">BRANCHIQ · AI Banking Network Strategy Consultant · Generated {today} · Public-data analytical estimate</div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Section({ n, title, children }) {
  return (
    <div className="mb-5">
      <h2 className="font-display text-base font-bold text-[#071426] mb-2 flex items-center gap-2"><span className="flex h-6 w-6 items-center justify-center rounded bg-[#071426] text-white text-xs font-mono">{n}</span>{title}</h2>
      {children}
    </div>
  );
}
