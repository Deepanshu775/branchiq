import React, { useMemo, useState } from "react";
import { useApp } from "../context/AppContext";
import { comparisonRows, formatCrore, formatNumber } from "../lib/engine";
import { SectionTitle, MethodologyNote, ChartCard } from "../components/shared/Section";
import { DataBadge } from "../components/shared/Badges";
import { ArrowUpDown, Trophy } from "lucide-react";
import {
  ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, Cell,
  BarChart, Bar, Legend, ReferenceLine, LabelList,
} from "recharts";

const DIMENSIONS = [
  { key: "networkStrength", label: "Network Strength" },
  { key: "growthOpportunity", label: "Growth Opportunity" },
  { key: "marketReach", label: "Market Reach" },
  { key: "digitalReadiness", label: "Digital Readiness" },
  { key: "expansionOpportunity", label: "Expansion Opportunity" },
];

const COLUMNS = [
  { key: "name", label: "Bank", align: "left" },
  { key: "sector", label: "Sector", align: "left" },
  { key: "branches", label: "Branch Network", align: "right", fmt: (v) => formatNumber(v) },
  { key: "deposits", label: "Deposits", align: "right", fmt: (v) => formatCrore(v) },
  { key: "advances", label: "Advances", align: "right", fmt: (v) => formatCrore(v) },
  { key: "depositGrowth", label: "Dep. Growth", align: "right", fmt: (v) => `${v}%` },
  { key: "creditGrowth", label: "Credit Growth", align: "right", fmt: (v) => `${v}%` },
  { key: "digitalReadiness", label: "Digital", align: "right", fmt: (v) => `${v}/100` },
  { key: "geographicCoverage", label: "Coverage", align: "right", fmt: (v) => `${v}/100` },
  { key: "opportunityScore", label: "Opportunity", align: "right", fmt: (v) => `${v}/100` },
];

function ScatterTip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-md border border-[#DFE7F0] bg-white px-3 py-2 shadow-lg text-xs">
      <div className="font-semibold text-[#071426]">{d.name}</div>
      <div className="text-slate-600">Network Strength: <b>{d.x}</b></div>
      <div className="text-slate-600">Growth Opportunity: <b>{d.y}</b></div>
    </div>
  );
}

export default function Comparison() {
  const { selectedBank, setSelectedBank } = useApp();
  const rows = useMemo(() => comparisonRows(), []);
  const [sortKey, setSortKey] = useState("opportunityScore");
  const [asc, setAsc] = useState(false);

  const sorted = useMemo(() => {
    const r = [...rows].sort((a, b) => {
      const va = a[sortKey], vb = b[sortKey];
      if (typeof va === "string") return asc ? va.localeCompare(vb) : vb.localeCompare(va);
      return asc ? va - vb : vb - va;
    });
    return r;
  }, [rows, sortKey, asc]);

  const setSort = (k) => { if (k === sortKey) setAsc(!asc); else { setSortKey(k); setAsc(false); } };

  const matrixData = rows.map((r) => ({ name: r.short, x: r.dims.networkStrength, y: r.dims.growthOpportunity, sel: r.name === selectedBank }));

  const sectorAgg = ["Public", "Private"].map((sec) => {
    const list = rows.filter((r) => r.sector === sec);
    const avg = (f) => Math.round(list.reduce((a, r) => a + f(r), 0) / list.length);
    return {
      sector: sec,
      "Network Strength": avg((r) => r.dims.networkStrength),
      "Growth Opportunity": avg((r) => r.dims.growthOpportunity),
      "Digital Readiness": avg((r) => r.dims.digitalReadiness),
      "Opportunity Score": avg((r) => r.opportunityScore),
    };
  });

  return (
    <div className="space-y-8" data-testid="page-comparison">
      <SectionTitle eyebrow="Peer Benchmarking" title="Bank Comparison" subtitle="Compare all nine banks across official metrics and five BranchIQ analytical dimensions." testid="section-comparison" />

      {/* Table */}
      <div className="bq-card bq-shadow overflow-hidden">
        <div className="overflow-x-auto bq-scroll">
          <table className="w-full text-sm" data-testid="comparison-table">
            <thead>
              <tr className="bg-[#071426] text-white">
                {COLUMNS.map((c) => (
                  <th
                    key={c.key}
                    onClick={() => setSort(c.key)}
                    className={`px-3 py-3 whitespace-nowrap cursor-pointer select-none font-semibold text-[11px] uppercase tracking-wide ${c.align === "right" ? "text-right" : "text-left"}`}
                    data-testid={`sort-${c.key}`}
                  >
                    <span className={`inline-flex items-center gap-1 ${c.align === "right" ? "flex-row-reverse" : ""}`}>
                      {c.label} <ArrowUpDown size={11} className={sortKey === c.key ? "text-cyan-300" : "text-slate-500"} />
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((r, i) => (
                <tr
                  key={r.name}
                  onClick={() => setSelectedBank(r.name)}
                  data-testid={`comparison-row-${i}`}
                  className={`cursor-pointer border-b border-[#EEF2F8] transition-colors ${r.name === selectedBank ? "bg-blue-50" : "hover:bg-[#F4F7FB]"}`}
                >
                  {COLUMNS.map((c) => {
                    const val = c.fmt ? c.fmt(r[c.key]) : r[c.key];
                    if (c.key === "name") {
                      return <td key={c.key} className="px-3 py-3 font-semibold text-[#071426] whitespace-nowrap flex items-center gap-1.5">{i === 0 && sortKey === "opportunityScore" && !asc && <Trophy size={13} className="text-[#E79B24]" />}{r.short}</td>;
                    }
                    if (c.key === "sector") {
                      return <td key={c.key} className="px-3 py-3"><span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${r.sector === "Public" ? "bg-cyan-50 text-cyan-700" : "bg-purple-50 text-purple-700"}`}>{r.sector}</span></td>;
                    }
                    if (c.key === "opportunityScore") {
                      return <td key={c.key} className="px-3 py-3 text-right"><span className="font-mono font-bold text-[#2563EB]">{r.opportunityScore}</span><span className="text-slate-400 text-xs">/100</span></td>;
                    }
                    return <td key={c.key} className={`px-3 py-3 whitespace-nowrap ${c.align === "right" ? "text-right font-mono" : ""} text-slate-700`}>{val}</td>;
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap items-center gap-2 px-3 py-2.5 bg-[#F4F7FB] border-t border-[#DFE7F0]">
          <DataBadge type="official" />
          <DataBadge type="analytical" />
          <span className="text-[10px] text-slate-500">Click any row to set the active bank · click headers to sort. Analytical dimensions are BranchIQ scores, not official ratings.</span>
        </div>
      </div>

      {/* Analytical dimensions for selected bank */}
      <section>
        <SectionTitle eyebrow="Analytical Profile" title={`Five Dimensions — ${selectedBank}`} testid="section-dimensions" />
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {DIMENSIONS.map((d) => {
            const val = rows.find((r) => r.name === selectedBank).dims[d.key];
            return (
              <div key={d.key} data-testid={`dimension-${d.key}`} className="bq-card bq-shadow p-4 text-center">
                <div className="font-display text-3xl font-bold text-[#071426]">{val}</div>
                <div className="text-[10px] text-slate-400 mb-2">/ 100</div>
                <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${val}%`, background: "#2563EB" }} />
                </div>
                <div className="text-xs font-medium text-slate-600 mt-2">{d.label}</div>
              </div>
            );
          })}
        </div>
        <MethodologyNote className="mt-4" />
      </section>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Bank Opportunity Matrix" badge={<DataBadge type="analytical" />} testid="chart-opportunity-matrix">
          <ResponsiveContainer width="100%" height={320}>
            <ScatterChart margin={{ top: 16, right: 16, left: 0, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EEF2F8" />
              <XAxis type="number" dataKey="x" name="Network Strength" domain={[0, 100]} tick={{ fontSize: 10, fill: "#64748b" }} label={{ value: "Network Strength →", position: "insideBottom", offset: -4, fontSize: 10, fill: "#64748b" }} />
              <YAxis type="number" dataKey="y" name="Growth Opportunity" domain={[0, 100]} tick={{ fontSize: 10, fill: "#64748b" }} label={{ value: "Growth Opportunity →", angle: -90, position: "insideLeft", fontSize: 10, fill: "#64748b" }} />
              <ZAxis range={[120, 120]} />
              <ReferenceLine x={65} stroke="#CBD5E1" strokeDasharray="4 4" />
              <ReferenceLine y={65} stroke="#CBD5E1" strokeDasharray="4 4" />
              <Tooltip content={<ScatterTip />} cursor={{ strokeDasharray: "3 3" }} />
              <Scatter data={matrixData}>
                {matrixData.map((d, i) => <Cell key={i} fill={d.sel ? "#2563EB" : "#1D4ED8"} />)}
                <LabelList dataKey="name" position="top" style={{ fontSize: 9, fill: "#0C1D33" }} />
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-1 mt-2 text-[10px] text-slate-500">
            <span>↗ Strong Network / High Opportunity</span>
            <span className="text-right">↖ Weak Network / High Opportunity</span>
            <span>↘ Strong Network / Low Opportunity</span>
            <span className="text-right">↙ Weak Network / Low Opportunity</span>
          </div>
        </ChartCard>

        <ChartCard title="Private vs Public Sector" badge={<DataBadge type="analytical" />} testid="chart-sector">
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={sectorAgg} margin={{ top: 16, right: 8, left: -12, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EEF2F8" vertical={false} />
              <XAxis dataKey="sector" tick={{ fontSize: 11, fill: "#64748b" }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#64748b" }} />
              <Tooltip cursor={{ fill: "#F4F7FB" }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="Network Strength" fill="#2563EB" radius={[3, 3, 0, 0]} />
              <Bar dataKey="Growth Opportunity" fill="#0891B2" radius={[3, 3, 0, 0]} />
              <Bar dataKey="Digital Readiness" fill="#1D4ED8" radius={[3, 3, 0, 0]} />
              <Bar dataKey="Opportunity Score" fill="#16A36A" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}
