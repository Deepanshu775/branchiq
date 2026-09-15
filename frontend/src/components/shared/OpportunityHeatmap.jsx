import React, { useMemo, useState } from "react";
import { regionOpportunities } from "../../lib/engine";
import { opportunityFill, opportunityText } from "../../lib/theme";
import { DecisionBadge, ConfidenceBadge } from "./Badges";
import { MapPin } from "lucide-react";

const SCALE = [
  { label: "56–", color: "#BFDBFE" },
  { label: "56+", color: "#F87171" },
  { label: "64+", color: "#0891B2" },
  { label: "72+", color: "#2563EB" },
  { label: "80+", color: "#1D4ED8" },
];

export function OpportunityHeatmap({ bankName, testid = "opportunity-heatmap" }) {
  const data = useMemo(() => regionOpportunities(bankName), [bankName]);
  const [active, setActive] = useState(data[0]);
  const cur = data.find((d) => d.state === active?.state) || data[0];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4" data-testid={testid}>
      <div>
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2.5">
          {data.map((r) => {
            const bg = opportunityFill(r.score);
            const fg = opportunityText(r.score);
            const isActive = cur?.state === r.state;
            return (
              <button
                key={r.state}
                onMouseEnter={() => setActive(r)}
                onFocus={() => setActive(r)}
                onClick={() => setActive(r)}
                data-testid={`heat-tile-${r.state.replace(/[^a-zA-Z]+/g, "-").toLowerCase()}`}
                className={`rounded-xl p-3 text-left transition-transform hover:-translate-y-0.5 ${isActive ? "ring-2 ring-offset-2 ring-[#111827]" : ""}`}
                style={{ background: bg, color: fg }}
              >
                <div className="text-xs font-semibold leading-tight">{r.state}</div>
                <div className="stat-num text-xl mt-1">{r.score}</div>
                <div className="text-[10px] opacity-80">{r.region} Region</div>
              </button>
            );
          })}
        </div>
        <div className="mt-4 flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-wide text-slate-400">Low</span>
          {SCALE.map((s) => <span key={s.label} className="h-3 w-8 rounded-sm" style={{ background: s.color }} title={s.label} />)}
          <span className="text-[10px] uppercase tracking-wide text-slate-400">Critical</span>
        </div>
      </div>

      <div className="bq-card p-4 h-fit" data-testid="heatmap-detail">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-semibold text-[#0F172A]"><MapPin size={15} className="text-[#2563EB]" />{cur.state}</div>
          <ConfidenceBadge level={cur.dataConfidence} />
        </div>
        <div className="mt-3 flex items-end gap-2">
          <span className="stat-num text-4xl text-[#0F172A]">{cur.score}</span>
          <span className="text-xs text-slate-400 mb-1.5">Opportunity / 100</span>
        </div>
        <div className="mt-3 space-y-1.5 text-xs">
          {[["Market Growth", cur.sub.marketGrowth], ["Credit Opportunity", cur.sub.creditOpportunity], ["Deposit Opportunity", cur.sub.depositOpportunity], ["Competitive Opportunity", cur.sub.competitiveOpportunity], ["Digital Readiness", cur.sub.digitalReadiness]].map(([l, v]) => (
            <div key={l} className="flex items-center justify-between">
              <span className="text-slate-500">{l}</span>
              <span className="stat-num text-[#0F172A]">{v}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 pt-3 border-t border-[#E2E8F0]">
          <div className="eyebrow mb-1">Recommendation</div>
          <DecisionBadge decision={cur.decision} />
          <p className="text-xs text-slate-600 mt-2 leading-relaxed">{cur.recommendation}</p>
        </div>
      </div>
    </div>
  );
}
