import React, { useMemo } from "react";
import { useApp } from "../context/AppContext";
import { getBank } from "../data/banks";
import { regionOpportunities } from "../lib/engine";
import { CHART } from "../lib/theme";
import { SectionTitle, MethodologyNote, ChartCard } from "../components/shared/Section";
import { DataBadge } from "../components/shared/Badges";
import { OpportunityHeatmap } from "../components/shared/OpportunityHeatmap";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, LabelList,
} from "recharts";

export default function OpportunityMap() {
  const { selectedBank } = useApp();
  const bank = getBank(selectedBank);
  const data = useMemo(() => regionOpportunities(selectedBank), [selectedBank]);
  const chart = data.map((r) => ({ name: r.state, value: r.score }));

  return (
    <div className="space-y-8" data-testid="page-opportunity-map">
      <SectionTitle
        eyebrow="Regional Intelligence"
        title="Regional Banking Opportunity"
        subtitle={`Where should ${bank.short} expand next? Colour intensity reflects the BranchIQ opportunity score across markets.`}
        right={<DataBadge type="analytical" />}
        testid="section-opportunity-map"
      />

      <div className="bq-card bq-shadow p-5">
        <OpportunityHeatmap bankName={selectedBank} />
      </div>

      <ChartCard title={`Opportunity Score by Region — ${bank.short}`} eyebrow="Ranking" badge={<DataBadge type="analytical" />} testid="chart-region-ranking">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chart} margin={{ top: 18, right: 8, left: -12, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#64748b" }} interval={0} angle={-25} textAnchor="end" height={64} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#64748b" }} />
            <Tooltip cursor={{ fill: "#F8FAFC" }} />
            <Bar dataKey="value" name="Opportunity" radius={[4, 4, 0, 0]}>
              <LabelList dataKey="value" position="top" style={{ fontSize: 10, fill: "#0F172A", fontWeight: 600 }} />
              {chart.map((d, i) => <Cell key={i} fill={d.value >= 80 ? CHART.dark : d.value >= 72 ? CHART.primary : d.value >= 64 ? CHART.accent : CHART.soft} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <MethodologyNote />
    </div>
  );
}
