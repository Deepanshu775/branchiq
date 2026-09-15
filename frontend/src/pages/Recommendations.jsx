import React, { useMemo, useState } from "react";
import { useApp } from "../context/AppContext";
import { getBank } from "../data/banks";
import { rankedOpportunities } from "../lib/engine";
import { SectionTitle, MethodologyNote } from "../components/shared/Section";
import { DataBadge, DecisionBadge, ConfidenceBadge } from "../components/shared/Badges";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { ScoreBar } from "../components/shared/ScoreRing";
import { MapPin, ArrowRight, TrendingUp, Rocket, Wrench, Smartphone, Search } from "lucide-react";
import {
  ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, Cell, ReferenceLine, LabelList,
} from "recharts";

const CATEGORIES = [
  { id: "expand", num: "01", title: "Expansion Opportunities", icon: Rocket, accent: "#1D4ED8", match: (o) => o.score >= 80 },
  { id: "selective", num: "02", title: "Selective Expansion", icon: TrendingUp, accent: "#2563EB", match: (o) => o.score >= 60 && o.score < 80 },
  { id: "optimize", num: "03", title: "Network Optimization", icon: Wrench, accent: "#E79B24", match: (o) => o.score >= 40 && o.score < 60 },
  { id: "digital", num: "04", title: "Digital-First Opportunities", icon: Smartphone, accent: "#1D4ED8", match: (o) => o.sub.digitalReadiness >= 82 },
  { id: "review", num: "05", title: "Markets Requiring Further Review", icon: Search, accent: "#64748B", match: (o) => o.dataConfidence === "LIMITED" || o.score < 40 },
];

function ScatterTip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-md border border-[#DFE7F0] bg-white px-3 py-2 shadow-lg text-xs">
      <div className="font-semibold text-[#071426]">{d.name}</div>
      <div className="text-slate-600">Presence: <b>{d.x}</b> · Opportunity: <b>{d.y}</b></div>
    </div>
  );
}

export default function Recommendations() {
  const { selectedBank } = useApp();
  const bank = getBank(selectedBank);
  const ranked = useMemo(() => rankedOpportunities(selectedBank), [selectedBank]);
  const [active, setActive] = useState(null);

  const matrix = ranked.map((o) => ({ name: o.state, x: o.presence, y: o.score, decision: o.decision }));

  return (
    <div className="space-y-8" data-testid="page-recommendations">
      <SectionTitle eyebrow="Executive Recommendation Board" title="Strategic Recommendations" subtitle={`Prioritised strategic actions for ${bank.name}, generated from BranchIQ opportunity scores.`} testid="section-recommendations" />

      {/* Priority matrix */}
      <div className="bq-card bq-shadow p-4" data-testid="strategic-matrix">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-[#0C1D33]">Strategic Priority Matrix</h3>
          <DataBadge type="analytical" />
        </div>
        <ResponsiveContainer width="100%" height={340}>
          <ScatterChart margin={{ top: 16, right: 20, left: 0, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#EEF2F8" />
            <XAxis type="number" dataKey="x" name="Presence" domain={[0, 100]} tick={{ fontSize: 10, fill: "#64748b" }} label={{ value: "Bank Network Presence →", position: "insideBottom", offset: -4, fontSize: 10, fill: "#64748b" }} />
            <YAxis type="number" dataKey="y" name="Opportunity" domain={[0, 100]} tick={{ fontSize: 10, fill: "#64748b" }} label={{ value: "Market Opportunity →", angle: -90, position: "insideLeft", fontSize: 10, fill: "#64748b" }} />
            <ZAxis range={[130, 130]} />
            <ReferenceLine x={55} stroke="#CBD5E1" strokeDasharray="4 4" />
            <ReferenceLine y={70} stroke="#CBD5E1" strokeDasharray="4 4" />
            <Tooltip content={<ScatterTip />} cursor={{ strokeDasharray: "3 3" }} />
            <Scatter data={matrix} onClick={(d) => setActive(ranked.find((o) => o.state === d.name))} className="cursor-pointer">
              {matrix.map((d, i) => <Cell key={i} fill={d.decision.color} />)}
              <LabelList dataKey="name" position="top" style={{ fontSize: 9, fill: "#0C1D33" }} />
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 mt-2 text-[10px] text-slate-500">
          <span>↖ Expand (Low presence / High opp.)</span>
          <span>↗ Selective (Coverage + High opp.)</span>
          <span>↙ Digital-First (Low presence / Low opp.)</span>
          <span>↘ Optimize (High presence / Low opp.)</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1">Click any market point to open its strategy brief.</p>
      </div>

      {/* Category boards */}
      <div className="space-y-6">
        {CATEGORIES.map((cat) => {
          const items = ranked.filter(cat.match);
          return (
            <section key={cat.id} data-testid={`rec-category-${cat.id}`}>
              <div className="flex items-center gap-2 mb-3">
                <span className="font-mono text-xs text-slate-400">{cat.num}</span>
                <span className="flex h-7 w-7 items-center justify-center rounded-md" style={{ background: `${cat.accent}18`, color: cat.accent }}><cat.icon size={15} /></span>
                <h3 className="font-display text-base font-bold text-[#071426]">{cat.title}</h3>
                <span className="text-xs text-slate-400">({items.length})</span>
              </div>
              {items.length === 0 ? (
                <div className="bq-card px-4 py-3 text-xs text-slate-400">No markets currently classified under this category for {bank.short}.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {items.map((o) => (
                    <button key={o.state} onClick={() => setActive(o)} data-testid={`rec-card-${o.state.replace(/[^a-zA-Z]+/g, "-").toLowerCase()}`} className="bq-card bq-shadow p-4 text-left hover:-translate-y-0.5 transition-transform">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-1.5 font-semibold text-[#071426]"><MapPin size={14} className="text-[#2563EB]" />{o.state}</div>
                        <div className="text-right"><div className="font-display text-xl font-bold text-[#071426]">{o.score}</div><div className="text-[10px] text-slate-400">Opportunity</div></div>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{bank.short} · {o.region} Region</div>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {o.drivers.slice(0, 2).map((d) => <span key={d.key} className="rounded bg-slate-50 border border-slate-200 px-1.5 py-0.5 text-[10px] text-slate-600">{d.label}</span>)}
                      </div>
                      <p className="mt-2 text-xs text-slate-600 line-clamp-2">{o.recommendation}</p>
                      <div className="mt-3 flex items-center justify-between">
                        <ConfidenceBadge level={o.dataConfidence} />
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#2563EB]">Brief <ArrowRight size={12} /></span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </div>

      <MethodologyNote />

      {/* Detail dialog */}
      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent className="max-w-lg" data-testid="market-detail-dialog">
          {active && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2"><DataBadge type="analytical" /><DecisionBadge decision={active.decision} /></div>
                <DialogTitle className="font-display text-xl flex items-center gap-2 mt-2"><MapPin size={18} className="text-[#2563EB]" />{active.state}</DialogTitle>
              </DialogHeader>
              <div className="flex items-center gap-4 mb-2">
                <div><div className="font-display text-3xl font-bold text-[#071426]">{active.score}</div><div className="text-[10px] text-slate-400">Opportunity / 100</div></div>
                <div className="text-sm text-slate-600">{bank.name} · {active.region} Region<br /><span className="text-xs text-slate-400">Priority: {active.priority}</span></div>
              </div>
              <div className="space-y-2.5">
                {Object.entries({ marketGrowth: "Market Growth", creditOpportunity: "Credit Opportunity", depositOpportunity: "Deposit Opportunity", customerPotential: "Customer Potential", competitiveOpportunity: "Competitive Opportunity", digitalReadiness: "Digital Readiness" }).map(([k, label]) => (
                  <ScoreBar key={k} label={label} value={active.sub[k]} color="#2563EB" />
                ))}
              </div>
              <div className="mt-3 rounded-lg bg-[#F4F7FB] p-3">
                <div className="eyebrow mb-1">Recommended Action</div>
                <p className="text-sm text-slate-700">{active.recommendation}</p>
              </div>
              <div className="mt-2"><ConfidenceBadge level={active.dataConfidence} /></div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
