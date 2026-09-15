import React, { useMemo, useState } from "react";
import { useApp } from "../context/AppContext";
import { BANKS } from "../data/banks";
import { STATE_NAMES } from "../data/regions";
import {
  formatCrore, formatNumber, comparisonRows, regionOpportunities, indiaOpportunityIndex,
  indiaScoreComponents, portfolioStats, decisionForScore, SCORE_WEIGHTS,
} from "../lib/engine";
import { CHART } from "../lib/theme";
import { KpiCard } from "../components/shared/KpiCard";
import { SectionTitle, MethodologyNote, ChartCard } from "../components/shared/Section";
import { DataBadge, DecisionBadge } from "../components/shared/Badges";
import { ScoreRing, ScoreBar } from "../components/shared/ScoreRing";
import { OpportunityHeatmap } from "../components/shared/OpportunityHeatmap";
import {
  Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue,
} from "../components/ui/select";
import {
  Landmark, Globe2, Building2, Layers, Target, MapPin, Bot, ArrowUpRight, Sparkles, ShieldCheck, ChevronRight,
} from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell,
} from "recharts";

function TooltipBox({ active, payload, label, unit }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="rounded-md border border-[#E2E8F0] bg-white px-3 py-2 shadow-lg text-xs">
      <div className="font-semibold text-[#0F172A] mb-1">{label}</div>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2 text-slate-600">
          <span className="h-2 w-2 rounded-sm" style={{ background: p.color || p.fill }} />
          {p.name}: <span className="stat-num text-[#0F172A]">{p.value?.toLocaleString("en-IN")}{unit}</span>
        </div>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const [dbBank, setDbBank] = useState("All Banks");
  const [dbRegion, setDbRegion] = useState("All India");
  const rows = useMemo(() => comparisonRows(), []);
  const stats = useMemo(() => portfolioStats(), []);
  const ranked = useMemo(() => regionOpportunities(dbBank), [dbBank]);
  const index = indiaOpportunityIndex(dbBank);
  const components = useMemo(() => indiaScoreComponents(dbBank), [dbBank]);
  const decision = decisionForScore(index);

  const priorities = (dbRegion === "All India" ? ranked : ranked.filter((r) => r.state === dbRegion)).slice(0, 6);

  const branchData = rows.map((r) => ({ name: r.short, value: r.branches }));
  const depositData = rows.map((r) => ({ name: r.short, value: Math.round(r.deposits / 1000) }));

  const kpis = [
    { testid: "kpi-card-banks", icon: Landmark, label: "Banks Analysed", value: String(stats.banks).padStart(2, "0"), context: "Public + Private sector", variant: "dark" },
    { testid: "kpi-card-regions", icon: Globe2, label: "Regions Evaluated", value: `${stats.regions}+`, context: "States & metro clusters" },
    { testid: "kpi-card-branches", icon: Building2, label: "Branches Covered", value: formatNumber(stats.totalBranches), context: "Aggregate reported network", badge: <DataBadge type="official" /> },
    { testid: "kpi-card-deposits", icon: Layers, label: "Deposits Analysed", value: formatCrore(stats.totalDeposits), context: "FY2025 reported", variant: "tint", badge: <DataBadge type="official" /> },
    { testid: "kpi-card-opportunities", icon: Target, label: "Strategic Opportunities", value: stats.opportunities, context: "Markets scoring 80+", variant: "accent", badge: <DataBadge type="analytical" /> },
  ];

  return (
    <div className="space-y-8" data-testid="page-dashboard">
      {/* Executive hero */}
      <section className="bq-fade">
        <div className="bq-hero bq-hero-grid rounded-[24px] p-6 lg:p-7 text-white shadow-xl shadow-slate-900/10">
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 items-center">
            <div>
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-cyan-300">
                <span className="h-2 w-2 rounded-full bg-cyan-300 bq-live-dot" /> BranchIQ Intelligence Layer
              </div>
              <h1 className="font-display text-3xl sm:text-4xl lg:text-[44px] font-extrabold tracking-tight mt-3 max-w-3xl leading-[1.06]">
                Turn branch network data into <span className="text-cyan-300">strategic decisions.</span>
              </h1>
              <p className="text-slate-300 text-sm lg:text-[15px] mt-4 max-w-2xl leading-relaxed">
                A consulting-grade command centre for branch expansion, network optimisation and market whitespace across India.
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Bank</span>
                  <Select value={dbBank} onValueChange={setDbBank}>
                    <SelectTrigger data-testid="dashboard-bank-filter" className="h-9 w-[200px] rounded-xl bg-white/10 border-white/15 text-white text-sm font-semibold backdrop-blur [&>svg]:text-slate-300"><SelectValue /></SelectTrigger>
                    <SelectContent className="max-h-[340px]">
                      <SelectItem value="All Banks">All Banks</SelectItem>
                      <SelectGroup><SelectLabel className="text-[10px] uppercase tracking-wider text-slate-400">Banks</SelectLabel>{BANKS.map((b) => <SelectItem key={b.name} value={b.name}>{b.short}</SelectItem>)}</SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Region</span>
                  <Select value={dbRegion} onValueChange={setDbRegion}>
                    <SelectTrigger data-testid="dashboard-region-filter" className="h-9 w-[190px] rounded-xl bg-white/10 border-white/15 text-white text-sm font-semibold backdrop-blur [&>svg]:text-slate-300"><SelectValue /></SelectTrigger>
                    <SelectContent className="max-h-[340px]"><SelectItem value="All India">All India</SelectItem>{STATE_NAMES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="relative z-10 rounded-2xl border border-white/10 bg-white/[.07] backdrop-blur-xl p-5 bq-ai-glow">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5"><span className="h-9 w-9 rounded-xl bg-blue-500/20 flex items-center justify-center"><Bot size={18} className="text-cyan-300" /></span><div><div className="font-semibold text-sm">BranchIQ AI</div><div className="text-[10px] text-emerald-300 flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-emerald-300" /> Online</div></div></div>
                <Sparkles size={16} className="text-cyan-300" />
              </div>
              <div className="mt-5 text-sm text-slate-200 leading-relaxed">
                <span className="font-semibold text-white">Executive signal:</span> {decision.label}. The current opportunity index is <span className="font-bold text-cyan-300">{index}/100</span>.
              </div>
              <div className="mt-4 rounded-xl bg-black/15 border border-white/10 px-3 py-2.5 text-xs text-slate-300 flex items-center justify-between">
                <span>Top action: {priorities[0]?.recommendation || "Review priority markets"}</span><ArrowUpRight size={15} className="shrink-0 text-cyan-300" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* KPI cards */}
      <section>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
          {kpis.map((k) => <KpiCard key={k.testid} {...k} />)}
        </div>
      </section>

      {/* Opportunity index + components */}
      <section className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4">
        <div className="bq-card bq-shadow p-5 flex flex-col items-center justify-center text-center" data-testid="opportunity-index-card">
          <div className="eyebrow">India Banking Opportunity Index</div>
          <div className="my-3"><ScoreRing value={index} size={180} stroke={16} color={decision.color} /></div>
          <div className="text-sm text-slate-500 mb-2">{dbBank}</div>
          <DecisionBadge decision={decision} />
        </div>
        <div className="bq-card bq-shadow p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-[#0F172A] accent-line">Opportunity Score Components</h3>
            <DataBadge type="analytical" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
            {SCORE_WEIGHTS.map((w) => (
              <ScoreBar key={w.key} testid={`component-${w.key}`} label={`${w.label} · ${Math.round(w.weight * 100)}%`} value={components[w.key]} color={w.color} />
            ))}
          </div>
          <MethodologyNote className="mt-5" />
        </div>
      </section>

      {/* India opportunity map */}
      <section>
        <SectionTitle eyebrow="Regional Banking Opportunity" title="Where should banks expand next?" subtitle="Colour intensity reflects the BranchIQ opportunity score across markets." right={<DataBadge type="analytical" />} testid="section-map" />
        <div className="bq-card bq-shadow p-5">
          <OpportunityHeatmap bankName={dbBank} />
        </div>
      </section>

      {/* Charts */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Branch Network Comparison" eyebrow="Official Data" badge={<DataBadge type="official" />} testid="chart-branches">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={branchData} margin={{ top: 6, right: 8, left: -12, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#64748b" }} interval={0} angle={-30} textAnchor="end" height={54} />
              <YAxis tick={{ fontSize: 10, fill: "#64748b" }} />
              <Tooltip content={<TooltipBox />} cursor={{ fill: "#F8FAFC" }} />
              <Bar dataKey="value" name="Branches" radius={[3, 3, 0, 0]} fill={CHART.primary} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Deposits Comparison (₹ '000 Cr)" eyebrow="Official Data" badge={<DataBadge type="official" />} testid="chart-deposits">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={depositData} margin={{ top: 6, right: 8, left: -12, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#64748b" }} interval={0} angle={-30} textAnchor="end" height={54} />
              <YAxis tick={{ fontSize: 10, fill: "#64748b" }} />
              <Tooltip content={<TooltipBox unit="k Cr" />} cursor={{ fill: "#F8FAFC" }} />
              <Bar dataKey="value" name="Deposits" radius={[3, 3, 0, 0]} fill={CHART.dark} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </section>

      {/* Priority opportunities */}
      <section>
        <SectionTitle eyebrow="Priority Opportunities" title="Where Should Management Look First?" subtitle="Ranked market opportunities generated by the BranchIQ analytical framework." testid="section-priorities" />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {priorities.map((p, idx) => (
            <div key={p.state} data-testid={`priority-card-${idx}`} className="bq-card bq-shadow p-4 flex flex-col hover:-translate-y-0.5 transition-transform">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[#DBEAFE] text-xs font-bold stat-num text-[#2563EB]">{idx + 1}</span>
                  <div>
                    <div className="flex items-center gap-1.5 font-semibold text-[#0F172A]"><MapPin size={14} className="text-[#2563EB]" />{p.state}</div>
                    <div className="text-[10px] text-slate-400">{p.region} Region · {p.drivers[0]?.label}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="stat-num text-2xl text-[#0F172A]">{p.score}</div>
                  <div className="text-[10px] text-slate-400">Opportunity</div>
                </div>
              </div>
              <div className="mt-3 rounded-md bg-[#F8FAFC] px-3 py-2 text-xs text-slate-600 leading-relaxed flex-1">
                <span className="font-semibold text-slate-700">Recommended action: </span>{p.recommendation}
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Priority: <span className="text-[#0F172A]">{p.priority}</span></span>
                <DecisionBadge decision={p.decision} />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
