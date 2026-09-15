import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

const VARIANTS = {
  default: { card: "bg-white border-[#E5EAF2]", label: "text-slate-500", value: "text-[#0F172A]", sub: "text-slate-400" },
  dark: { card: "bg-[#0B1220] border-[#0B1220]", label: "text-slate-400", value: "text-white", sub: "text-slate-500" },
  accent: { card: "bg-gradient-to-br from-blue-600 to-blue-700 border-blue-600", label: "text-blue-100", value: "text-white", sub: "text-blue-100/80" },
  tint: { card: "bg-blue-50/70 border-blue-100", label: "text-blue-600", value: "text-[#0F172A]", sub: "text-slate-500" },
};

export function KpiCard({ testid, icon: Icon, accent = "#2563EB", label, value, unit, period, source, delta, badge, variant = "default", context }) {
  const v = VARIANTS[variant] || VARIANTS.default;
  const dark = variant === "dark" || variant === "accent";
  const iconTint = dark ? { background: "rgba(255,255,255,.12)", color: "#fff" } : { background: `${accent}12`, color: accent };
  return (
    <div data-testid={testid} className={`bq-shadow bq-card-hover relative overflow-hidden p-4 flex flex-col min-h-[150px] rounded-[18px] border ${v.card}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          {Icon && <span className="flex h-9 w-9 items-center justify-center rounded-xl" style={iconTint}><Icon size={17} /></span>}
          <span className={`text-[10px] font-bold tracking-[0.08em] uppercase ${v.label}`}>{label}</span>
        </div>
        {delta !== undefined && delta !== null && <span className={`inline-flex items-center gap-0.5 text-xs font-semibold ${dark ? "text-white/90" : delta >= 0 ? "text-emerald-600" : "text-rose-600"}`}>{delta >= 0 ? <TrendingUp size={13}/> : <TrendingDown size={13}/>} {Math.abs(delta)}%</span>}
      </div>
      <div className="mt-4 flex items-baseline gap-1"><span className={`stat-num text-3xl ${v.value}`}>{value}</span>{unit && <span className={`text-sm font-medium ${v.sub}`}>{unit}</span>}</div>
      {context && <div className={`mt-1 text-xs ${v.sub}`}>{context}</div>}
      <div className="mt-auto pt-3 flex items-center justify-between gap-2"><span className={`text-[10px] ${v.sub}`}>{period && <span className="font-semibold">{period}</span>}{source && <span> · {source}</span>}</span>{badge}</div>
    </div>
  );
}
