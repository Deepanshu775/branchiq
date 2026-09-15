import React from "react";
import { DATA_LABEL_BADGES } from "../../data/sources";

// Data-source / label badge (official, analytical, market, model)
export function DataBadge({ type, className = "" }) {
  const b = DATA_LABEL_BADGES[type] || DATA_LABEL_BADGES.model;
  return (
    <span
      data-testid={`data-badge-${type}`}
      className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-semibold tracking-wide border ${b.cls} ${className}`}
    >
      {b.label}
    </span>
  );
}

const CONF = {
  HIGH: { cls: "bg-emerald-50 text-emerald-700 border-emerald-300", dot: "#16A36A" },
  MEDIUM: { cls: "bg-amber-50 text-amber-700 border-amber-300", dot: "#E79B24" },
  LIMITED: { cls: "bg-rose-50 text-rose-700 border-rose-300", dot: "#D9534F" },
};

export function ConfidenceBadge({ level = "MEDIUM", className = "" }) {
  const c = CONF[level] || CONF.MEDIUM;
  return (
    <span
      data-testid={`confidence-badge-${level.toLowerCase()}`}
      className={`inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-[10px] font-semibold border ${c.cls} ${className}`}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: c.dot }} />
      DATA CONFIDENCE: {level}
    </span>
  );
}

export function DecisionBadge({ decision, className = "" }) {
  return (
    <span
      data-testid="decision-badge"
      className={`inline-flex items-center rounded px-2.5 py-1 text-xs font-bold tracking-wide border ${decision.cls} ${className}`}
    >
      {decision.label}
    </span>
  );
}
