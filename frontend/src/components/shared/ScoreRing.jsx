import React from "react";

export function ScoreRing({ value = 0, size = 140, stroke = 12, color = "#2563EB", label, sublabel, testid }) {
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  const pct = Math.max(0, Math.min(100, value));
  const offset = circ - (pct / 100) * circ;
  return (
    <div className="flex flex-col items-center" data-testid={testid}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#F1F5F9" strokeWidth={stroke} />
          <circle
            cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={stroke}
            strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 0.9s cubic-bezier(0.22,1,0.36,1)" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="stat-num leading-none" style={{ fontSize: size * 0.28, color: "#0F172A" }}>{Math.round(value)}</span>
          <span className="text-[10px] font-semibold text-slate-400 mt-0.5">/ 100</span>
        </div>
      </div>
      {label && <div className="mt-2 text-sm font-semibold text-[#111827] text-center">{label}</div>}
      {sublabel && <div className="text-xs text-slate-500 text-center">{sublabel}</div>}
    </div>
  );
}

export function ScoreBar({ label, value, color = "#2563EB", testid }) {
  return (
    <div data-testid={testid}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-slate-600">{label}</span>
        <span className="text-xs font-bold stat-num text-[#0F172A]">{value}/100</span>
      </div>
      <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${value}%`, background: color, transition: "width 0.8s cubic-bezier(0.22,1,0.36,1)" }} />
      </div>
    </div>
  );
}
