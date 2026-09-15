import React, { useMemo } from "react";
import { useApp } from "../context/AppContext";
import { STATE_NAMES, REGIONS, TIERS } from "../data/regions";
import { getBank } from "../data/banks";
import { stateScores, decisionForScore, priorityForScore, topDrivers, recommendationText, SCORE_WEIGHTS, formatNumber } from "../lib/engine";
import { SectionTitle, MethodologyNote } from "../components/shared/Section";
import { DataBadge, DecisionBadge, ConfidenceBadge } from "../components/shared/Badges";
import { ScoreRing, ScoreBar } from "../components/shared/ScoreRing";
import BankSelector from "../components/layout/BankSelector";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "../components/ui/select";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "../components/ui/accordion";
import { Users, TrendingUp, PiggyBank, HandCoins, Swords, Smartphone, MapPin, AlertTriangle } from "lucide-react";

const SUB_META = {
  marketGrowth: { icon: TrendingUp, label: "Market Growth Score", color: "#2563EB" },
  creditOpportunity: { icon: HandCoins, label: "Credit Opportunity Score", color: "#0891B2" },
  depositOpportunity: { icon: PiggyBank, label: "Deposit Opportunity Score", color: "#16A36A" },
  customerPotential: { icon: Users, label: "Customer Potential Score", color: "#1D4ED8" },
  competitiveOpportunity: { icon: Swords, label: "Competitive Opportunity Score", color: "#E79B24" },
  digitalReadiness: { icon: Smartphone, label: "Digital Readiness Score", color: "#0C1D33" },
};

function IntelPanel({ icon: Icon, label, value, sub, badge, accent = "#2563EB", testid }) {
  return (
    <div className="bq-card bq-shadow p-4" data-testid={testid}>
      <div className="flex items-center gap-2 mb-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-md" style={{ background: `${accent}14`, color: accent }}><Icon size={16} /></span>
        <span className="eyebrow">{label}</span>
      </div>
      <div className="font-display text-xl font-bold text-[#071426]">{value}</div>
      {sub && <div className="text-xs text-slate-500 mt-0.5">{sub}</div>}
      {badge && <div className="mt-2">{badge}</div>}
    </div>
  );
}

export default function Network() {
  const { selectedBank, selectedState, setSelectedState } = useApp();
  const [tier, setTier] = React.useState("all");
  const bank = getBank(selectedBank);
  const region = REGIONS.find((r) => r.state === selectedState) || REGIONS[0];
  const scores = useMemo(() => stateScores(selectedBank, selectedState), [selectedBank, selectedState]);
  const decision = decisionForScore(scores.overall);
  const drivers = topDrivers(scores, 3);
  const rec = recommendationText(scores, selectedState);
  const lowConfidence = region.dataConfidence === "LIMITED";

  return (
    <div className="space-y-8" data-testid="page-network">
      <SectionTitle eyebrow="Market Intelligence" title="Network Analysis" subtitle="Evaluate a bank's positioning and the market opportunity within a selected state." testid="section-network" />

      {/* Filters */}
      <div className="bq-card bq-shadow p-4 flex flex-wrap items-end gap-4" data-testid="network-filters">
        <div>
          <div className="eyebrow mb-1">Bank</div>
          <BankSelector testid="network-bank-select" />
        </div>
        <div>
          <div className="eyebrow mb-1">State</div>
          <Select value={selectedState} onValueChange={setSelectedState}>
            <SelectTrigger data-testid="filter-state-select" className="h-9 w-[200px] border-[#DFE7F0] bg-white text-sm font-semibold">
              <span className="flex items-center gap-2"><MapPin size={15} className="text-[#2563EB]" /><SelectValue /></span>
            </SelectTrigger>
            <SelectContent className="max-h-[340px]">
              {STATE_NAMES.map((s) => <SelectItem key={s} value={s} data-testid={`state-option-${s.replace(/[^a-zA-Z]+/g, "-").toLowerCase()}`}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <div className="eyebrow mb-1">City / Region Tier</div>
          <Select value={tier} onValueChange={setTier}>
            <SelectTrigger data-testid="filter-tier-select" className="h-9 w-[240px] border-[#DFE7F0] bg-white text-sm font-semibold">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIERS.map((t) => <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="ml-auto self-center"><ConfidenceBadge level={region.dataConfidence} /></div>
      </div>

      {lowConfidence && (
        <div className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5" data-testid="low-confidence-warning">
          <AlertTriangle size={15} className="mt-0.5 text-rose-500 shrink-0" />
          <p className="text-xs text-rose-700">Insufficient public evidence for a high-confidence recommendation in this market. Analytical estimate — management validation required.</p>
        </div>
      )}

      {/* Market intelligence panels */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        <IntelPanel testid="intel-presence" icon={MapPin} accent="#2563EB" label="Bank Presence" value={`${scores.presence}/100`} sub={`${bank.short} network intensity`} badge={<DataBadge type="model" />} />
        <IntelPanel testid="intel-market" icon={TrendingUp} accent="#0891B2" label="Market Opportunity" value={`${scores.overall}/100`} sub="Overall opportunity score" badge={<DataBadge type="analytical" />} />
        <IntelPanel testid="intel-deposit" icon={PiggyBank} accent="#16A36A" label="Deposit Environment" value={`${region.depositOpportunity}/100`} sub="Public deposit indicator" badge={<DataBadge type="market" />} />
        <IntelPanel testid="intel-credit" icon={HandCoins} accent="#E79B24" label="Credit Environment" value={`${region.creditOpportunity}/100`} sub="Public credit indicator" badge={<DataBadge type="market" />} />
        <IntelPanel testid="intel-population" icon={Users} accent="#1D4ED8" label="Population / Market" value={`${formatNumber(region.populationMn)} Mn`} sub={`${region.region} Region · Census/est.`} badge={<DataBadge type="market" />} />
        <IntelPanel testid="intel-competition" icon={Swords} accent="#D9534F" label="Competitive Intensity" value={`${region.marketConcentration}/100`} sub="Relative market concentration" badge={<DataBadge type="market" />} />
        <IntelPanel testid="intel-digital" icon={Smartphone} accent="#0C1D33" label="Digital Readiness" value={`${region.digitalReadiness}/100`} sub="Digital adoption indicator" badge={<DataBadge type="market" />} />
        <IntelPanel testid="intel-growth" icon={TrendingUp} accent="#2563EB" label="Market Growth" value={`${region.marketGrowth}/100`} sub={`GSDP growth ~${region.gsdpGrowth}%`} badge={<DataBadge type="market" />} />
      </div>

      {/* Branch opportunity score */}
      <section className="bq-card bq-shadow p-5 lg:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
          <div>
            <div className="eyebrow">Branch Opportunity Score</div>
            <h3 className="font-display text-lg font-bold text-[#071426]">{bank.short} · {selectedState}</h3>
          </div>
          <div className="flex items-center gap-2"><DataBadge type="analytical" /><DecisionBadge decision={decision} /></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-8 items-center">
          <div className="flex justify-center">
            <ScoreRing value={scores.overall} size={180} stroke={16} color={decision.color} label="Overall Opportunity" testid="score-ring-overall" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
            {Object.keys(SUB_META).map((k) => (
              <ScoreBar key={k} testid={`subscore-${k}`} label={SUB_META[k].label} value={scores[k]} color={SUB_META[k].color} />
            ))}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-lg bg-[#F4F7FB] p-4">
            <div className="eyebrow mb-2">Key Drivers</div>
            <ul className="space-y-1.5">
              {drivers.map((d) => (
                <li key={d.key} className="flex items-center gap-2 text-sm text-slate-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#2563EB]" />{d.label} <span className="font-mono text-xs text-slate-400">({d.value})</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-lg border border-[#DFE7F0] p-4">
            <div className="eyebrow mb-2">Recommended Action</div>
            <p className="text-sm text-slate-700 leading-relaxed">{rec}</p>
            <div className="mt-2 text-[11px] text-slate-500">Priority: <span className="font-semibold text-[#071426]">{priorityForScore(scores.overall)}</span></div>
          </div>
        </div>

        {/* Formula */}
        <Accordion type="single" collapsible className="mt-5">
          <AccordionItem value="formula" className="border border-[#DFE7F0] rounded-lg px-4">
            <AccordionTrigger data-testid="formula-toggle" className="text-sm font-semibold text-[#071426] hover:no-underline">How is this score calculated?</AccordionTrigger>
            <AccordionContent>
              <p className="text-xs text-slate-500 mb-3">Opportunity Score = weighted sum of six analytical components, rounded to the nearest integer.</p>
              <div className="space-y-2">
                {SCORE_WEIGHTS.map((w) => (
                  <div key={w.key} className="flex items-center gap-3">
                    <span className="w-40 text-xs text-slate-600">{w.label}</span>
                    <span className="w-14 text-xs font-mono text-slate-400">×{w.weight}</span>
                    <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${w.weight * 100}%`, background: w.color }} />
                    </div>
                    <span className="w-12 text-right text-xs font-mono font-semibold text-[#0C1D33]">{scores[w.key]}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 font-mono text-xs text-slate-600 bg-[#F4F7FB] rounded p-3 leading-relaxed">
                {SCORE_WEIGHTS.map((w) => `${scores[w.key]}×${w.weight}`).join(" + ")} = <span className="font-bold text-[#071426]">{scores.overall}</span>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>

      <MethodologyNote />
    </div>
  );
}
