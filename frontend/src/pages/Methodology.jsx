import React from "react";
import { SOURCES, METHODOLOGY_FLOW, TRANSPARENCY_NOTES, METHODOLOGY_NOTE } from "../data/sources";
import { BANKS } from "../data/banks";
import { SCORE_WEIGHTS } from "../lib/engine";
import { SectionTitle } from "../components/shared/Section";
import { DataBadge, ConfidenceBadge } from "../components/shared/Badges";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "../components/ui/accordion";
import * as Icons from "lucide-react";
import { ShieldCheck, ArrowDown } from "lucide-react";

export default function Methodology() {
  return (
    <div className="space-y-8" data-testid="page-methodology">
      <SectionTitle eyebrow="Transparency" title="Data Sources & Methodology" subtitle="BranchIQ uses only publicly available information and a transparent analytical scoring framework." testid="section-methodology" />

      {/* Source cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {SOURCES.map((s) => {
          const Icon = Icons[s.icon] || Icons.Database;
          return (
            <div key={s.id} data-testid={`source-card-${s.id}`} className="bq-card bq-shadow p-5">
              <div className="flex items-center gap-3 mb-2">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#071426] text-white"><Icon size={18} /></span>
                <h3 className="font-display text-base font-bold text-[#071426] leading-tight">{s.name}</h3>
              </div>
              <p className="text-xs text-slate-500 mb-3">{s.description}</p>
              <div className="eyebrow mb-1.5">Used For</div>
              <div className="flex flex-wrap gap-1.5">
                {s.usedFor.map((u) => <span key={u} className="rounded bg-slate-50 border border-slate-200 px-2 py-0.5 text-[11px] text-slate-600">{u}</span>)}
              </div>
            </div>
          );
        })}
      </div>

      {/* Official bank annual reports */}
      <section className="bq-card bq-shadow p-5" data-testid="section-annual-reports">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-display text-lg font-bold text-[#071426]">Official Bank Annual Reports</h3>
          <DataBadge type="official" />
        </div>
        <p className="text-xs text-slate-500 mb-4">Direct links to each bank's official investor-relations / annual-report page (FY2025). Reported figures are attributed to these public disclosures.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {BANKS.map((b) => (
            <a
              key={b.name}
              href={b.sourceUrl}
              target="_blank"
              rel="noreferrer"
              data-testid={`annual-report-link-${b.short.replace(/[^a-zA-Z]+/g, "-").toLowerCase()}`}
              className="group flex items-center gap-3 rounded-lg border border-[#DFE7F0] bg-white px-3 py-2.5 hover:border-[#2563EB] hover:bg-blue-50/40 transition-colors"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-500 group-hover:bg-[#2563EB] group-hover:text-white transition-colors">
                <Icons.FileText size={15} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-[#071426] truncate">{b.short}</span>
                <span className="block text-[10px] uppercase tracking-wide text-slate-400">{b.sector} Sector · {b.reportingPeriod}</span>
              </span>
              <Icons.ExternalLink size={14} className="text-slate-300 group-hover:text-[#2563EB] transition-colors" />
            </a>
          ))}
        </div>
        <p className="text-[10px] text-slate-400 mt-3">Links open the banks' official websites in a new tab. BranchIQ is not affiliated with any bank.</p>
      </section>

      {/* Methodology flow */}
      <section className="bq-card bq-shadow p-5">
        <h3 className="font-display text-lg font-bold text-[#071426] mb-4">Analytical Process Flow</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {METHODOLOGY_FLOW.map((f, i) => {
            const Icon = Icons[f.icon] || Icons.Circle;
            return (
              <div key={f.step} className="relative">
                <div className="bq-card p-4 h-full" style={{ borderTop: "3px solid #2563EB" }}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-50 text-[#2563EB]"><Icon size={15} /></span>
                    <span className="font-mono text-[10px] text-slate-400">STEP {String(i + 1).padStart(2, "0")}</span>
                  </div>
                  <div className="font-semibold text-sm text-[#071426]">{f.step}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{f.desc}</div>
                </div>
                {i < METHODOLOGY_FLOW.length - 1 && (
                  <ArrowDown size={16} className="text-slate-300 mx-auto my-1 md:hidden" />
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Scoring formula */}
      <section className="bq-card bq-shadow p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg font-bold text-[#071426]">How the Opportunity Score is Calculated</h3>
          <DataBadge type="analytical" />
        </div>
        <div className="space-y-2.5">
          {SCORE_WEIGHTS.map((w) => (
            <div key={w.key} className="flex items-center gap-3">
              <span className="w-44 text-sm text-slate-600">{w.label}</span>
              <span className="w-14 text-xs font-mono text-slate-400">×{w.weight}</span>
              <div className="flex-1 h-2.5 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${w.weight * 100}%`, background: w.color }} />
              </div>
              <span className="w-12 text-right text-xs font-mono font-semibold text-[#0C1D33]">{Math.round(w.weight * 100)}%</span>
            </div>
          ))}
        </div>
        <Accordion type="single" collapsible className="mt-4">
          <AccordionItem value="detail" className="border border-[#DFE7F0] rounded-lg px-4">
            <AccordionTrigger data-testid="methodology-formula-toggle" className="text-sm font-semibold hover:no-underline">View the full scoring definition</AccordionTrigger>
            <AccordionContent className="text-xs text-slate-600 leading-relaxed space-y-2">
              <p className="font-mono bg-[#F4F7FB] rounded p-3">Opportunity = 0.30·MarketGrowth + 0.20·CreditOpportunity + 0.15·DepositOpportunity + 0.15·CustomerPotential + 0.10·CompetitiveOpportunity + 0.10·DigitalReadiness</p>
              <p>Each component is a 0–100 model-generated estimate derived from public economic, credit, deposit and demographic indicators. Competitive opportunity is adjusted for the selected bank's relative network presence. The weighted sum is rounded to the nearest integer.</p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>

      {/* Transparency */}
      <section className="bq-card bq-shadow p-5" style={{ background: "linear-gradient(120deg,#071426,#0C1D33)" }}>
        <div className="flex items-center gap-2 mb-3 text-white">
          <ShieldCheck size={18} className="text-cyan-300" />
          <h3 className="font-display text-lg font-bold">Transparency & Data Integrity</h3>
        </div>
        <ul className="space-y-2 mb-4">
          {TRANSPARENCY_NOTES.map((t, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-slate-200"><span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-cyan-400 shrink-0" />{t}</li>
          ))}
        </ul>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400">Data confidence levels applied across recommendations:</span>
          <ConfidenceBadge level="HIGH" />
          <ConfidenceBadge level="MEDIUM" />
          <ConfidenceBadge level="LIMITED" />
        </div>
      </section>

      <div className="flex items-start gap-2 rounded-lg border border-blue-100 bg-blue-50/60 px-3 py-2.5">
        <Icons.Info size={15} className="mt-0.5 shrink-0 text-[#2563EB]" />
        <p className="text-xs text-slate-600 leading-relaxed">{METHODOLOGY_NOTE}</p>
      </div>
    </div>
  );
}
