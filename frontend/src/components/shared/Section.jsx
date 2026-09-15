import React from "react";
import { METHODOLOGY_NOTE } from "../../data/sources";
import { Info } from "lucide-react";

export function SectionTitle({ eyebrow, title, subtitle, right, testid }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3 mb-4" data-testid={testid}>
      <div className="accent-line">
        {eyebrow && <div className="eyebrow mb-1">{eyebrow}</div>}
        <h2 className="font-display text-xl lg:text-2xl font-bold tracking-tight text-[#0F172A]">{title}</h2>
        {subtitle && <p className="text-sm text-slate-500 mt-1 max-w-2xl">{subtitle}</p>}
      </div>
      {right}
    </div>
  );
}

export function MethodologyNote({ className = "" }) {
  return (
    <div className={`flex items-start gap-2 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2.5 ${className}`} data-testid="methodology-note">
      <Info size={15} className="mt-0.5 shrink-0 text-blue-600" />
      <p className="text-xs text-slate-600 leading-relaxed">{METHODOLOGY_NOTE}</p>
    </div>
  );
}

export function ChartCard({ title, eyebrow, badge, children, className = "", testid }) {
  return (
    <div className={`bq-card bq-shadow p-4 ${className}`} data-testid={testid}>
      <div className="flex items-start justify-between mb-3">
        <div>
          {eyebrow && <div className="eyebrow mb-0.5">{eyebrow}</div>}
          <h3 className="text-sm font-bold text-[#0F172A]">{title}</h3>
        </div>
        {badge}
      </div>
      {children}
    </div>
  );
}
