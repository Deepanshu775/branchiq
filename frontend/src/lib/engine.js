import { BANKS } from "../data/banks";
import { REGIONS } from "../data/regions";

// -------------------- Scoring weights --------------------
export const SCORE_WEIGHTS = [
  { key: "marketGrowth", label: "Market Growth", weight: 0.3, color: "#2563EB" },
  { key: "creditOpportunity", label: "Credit Opportunity", weight: 0.2, color: "#0891B2" },
  { key: "depositOpportunity", label: "Deposit Opportunity", weight: 0.15, color: "#1D4ED8" },
  { key: "customerPotential", label: "Customer Potential", weight: 0.15, color: "#EF4444" },
  { key: "competitiveOpportunity", label: "Competitive Opportunity", weight: 0.1, color: "#D97706" },
  { key: "digitalReadiness", label: "Digital Readiness", weight: 0.1, color: "#64748B" },
];

const clamp = (v, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, v));
const round = (v) => Math.round(v);

// -------------------- Formatting --------------------
export function formatCrore(cr) {
  if (cr === null || cr === undefined) return "Public figure unavailable";
  if (cr >= 100000) return `₹${(cr / 100000).toFixed(2)} L Cr`;
  return `₹${cr.toLocaleString("en-IN")} Cr`;
}

export function formatNumber(n) {
  if (n === null || n === undefined) return "Public figure unavailable";
  return n.toLocaleString("en-IN");
}

// -------------------- Bank lookups --------------------
export function getBank(name) {
  return BANKS.find((b) => b.name === name) || BANKS[0];
}

const branchVals = BANKS.map((b) => b.branches);
const MIN_BR = Math.min(...branchVals);
const MAX_BR = Math.max(...branchVals);
const norm = (v, min, max) => (max === min ? 50 : ((v - min) / (max - min)) * 100);

// -------------------- Bank presence in a state (model estimate) --------------------
const URBAN_STATES = ["Maharashtra", "Delhi NCR", "Karnataka", "Telangana", "Goa", "Kerala"];
const RURAL_HEAVY = ["Uttar Pradesh", "West Bengal", "Madhya Pradesh", "Rajasthan"];

export function bankPresence(bank, region) {
  const sizeScore = 30 + 0.6 * norm(bank.branches, MIN_BR, MAX_BR); // 30..90
  let bias = 0;
  if (bank.sector === "Private") {
    if (URBAN_STATES.includes(region.state)) bias += 10;
    if (RURAL_HEAVY.includes(region.state)) bias -= 8;
  } else {
    if (RURAL_HEAVY.includes(region.state)) bias += 10;
    if (region.state === "Goa") bias -= 4;
  }
  const digitalTilt = bank.sector === "Private" ? (region.digitalReadiness - 70) * 0.15 : 0;
  return round(clamp(sizeScore * 0.72 + bias + digitalTilt, 10, 96));
}

// -------------------- Sub-scores for a bank in a state --------------------
export function stateScores(bankName, stateName) {
  const bank = getBank(bankName);
  const region = REGIONS.find((r) => r.state === stateName) || REGIONS[0];
  const presence = bankPresence(bank, region);
  const competitiveOpportunity = round(
    clamp(0.55 * (100 - presence) + 0.4 * region.marketGrowth - 0.15 * region.marketConcentration + 18)
  );
  const sub = {
    marketGrowth: region.marketGrowth,
    creditOpportunity: region.creditOpportunity,
    depositOpportunity: region.depositOpportunity,
    customerPotential: region.customerPotential,
    competitiveOpportunity,
    digitalReadiness: region.digitalReadiness,
  };
  const overall = round(
    sub.marketGrowth * 0.3 +
      sub.creditOpportunity * 0.2 +
      sub.depositOpportunity * 0.15 +
      sub.customerPotential * 0.15 +
      sub.competitiveOpportunity * 0.1 +
      sub.digitalReadiness * 0.1
  );
  return { ...sub, overall, presence, region, bank, dataConfidence: region.dataConfidence };
}

// -------------------- Decision engine --------------------
export function decisionForScore(score) {
  if (score >= 80) return { label: "EXPAND", color: "#1D4ED8", cls: "bg-blue-100 text-blue-800 border-blue-300" };
  if (score >= 60) return { label: "SELECTIVE EXPANSION", color: "#2563EB", cls: "bg-blue-50 text-blue-700 border-blue-200" };
  if (score >= 40) return { label: "MAINTAIN / OPTIMIZE", color: "#D97706", cls: "bg-amber-50 text-amber-700 border-amber-300" };
  if (score >= 20) return { label: "DIGITAL-FIRST / COST OPTIMIZATION", color: "#334155", cls: "bg-slate-100 text-slate-700 border-slate-300" };
  return { label: "REVIEW NETWORK STRATEGY", color: "#64748B", cls: "bg-slate-200 text-slate-800 border-slate-400" };
}

export function priorityForScore(score) {
  if (score >= 80) return "HIGH";
  if (score >= 65) return "MEDIUM-HIGH";
  if (score >= 50) return "MEDIUM";
  return "WATCH";
}

// -------------------- Drivers --------------------
const DRIVER_TEXT = {
  marketGrowth: "Attractive market growth",
  creditOpportunity: "Strong credit environment",
  depositOpportunity: "Healthy deposit environment",
  customerPotential: "Large addressable customer base",
  competitiveOpportunity: "Relative network positioning below leaders",
  digitalReadiness: "High digital readiness",
};

export function topDrivers(sub, n = 3) {
  return SCORE_WEIGHTS.map((w) => ({ key: w.key, label: DRIVER_TEXT[w.key], value: sub[w.key] }))
    .sort((a, b) => b.value - a.value)
    .slice(0, n);
}

// -------------------- Recommendation text --------------------
export function recommendationText(sub, state) {
  const drivers = topDrivers(sub, 3).map((d) => d.key);
  const highDigital = sub.digitalReadiness >= 80;
  const lowPresence = sub.competitiveOpportunity >= 70;
  const strongMarket = sub.marketGrowth >= 78 && sub.creditOpportunity >= 78;

  if (strongMarket && lowPresence) {
    return `Evaluate selective physical and digital distribution expansion across high-growth micro-markets in ${state}.`;
  }
  if (highDigital && sub.competitiveOpportunity < 55) {
    return `Prioritise digital-first distribution and productivity in ${state} rather than broad physical network expansion.`;
  }
  if (drivers.includes("customerPotential") && drivers.includes("marketGrowth")) {
    return `Assess phased expansion in ${state} to capture a large addressable customer base as the market scales.`;
  }
  return `Focus on customer penetration and network productivity in ${state}; further management validation required.`;
}

// -------------------- Ranked opportunities for a bank --------------------
export function rankedOpportunities(bankName) {
  return REGIONS.map((r) => {
    const s = stateScores(bankName, r.state);
    const decision = decisionForScore(s.overall);
    return {
      state: r.state,
      region: r.region,
      score: s.overall,
      sub: s,
      presence: s.presence,
      decision,
      priority: priorityForScore(s.overall),
      drivers: topDrivers(s, 3),
      recommendation: recommendationText(s, r.state),
      dataConfidence: r.dataConfidence,
    };
  }).sort((a, b) => b.score - a.score);
}

// -------------------- National opportunity score for a bank --------------------
export function bankOpportunityScore(bankName) {
  const all = rankedOpportunities(bankName);
  return round(all.reduce((acc, o) => acc + o.score, 0) / all.length);
}

// -------------------- Bank analytical dimensions (0-100) --------------------
const growthVals = BANKS.map((b) => b.depositGrowth + b.creditGrowth);
const MIN_G = Math.min(...growthVals);
const MAX_G = Math.max(...growthVals);

export function bankDimensions(bankName) {
  const bank = getBank(bankName);
  const networkStrength = round(clamp(40 + 0.58 * norm(bank.branches, MIN_BR, MAX_BR) + 0.2 * bank.geographicCoverage));
  const growthOpportunity = round(clamp(45 + 0.55 * norm(bank.depositGrowth + bank.creditGrowth, MIN_G, MAX_G)));
  const marketReach = bank.geographicCoverage;
  const digitalReadiness = bank.digitalReadiness;
  const expansionOpportunity = bankOpportunityScore(bankName);
  return { networkStrength, growthOpportunity, marketReach, digitalReadiness, expansionOpportunity };
}

// -------------------- Comparison table (all banks) --------------------
export function comparisonRows() {
  return BANKS.map((b) => {
    const dims = bankDimensions(b.name);
    return {
      name: b.name,
      short: b.short,
      sector: b.sector,
      branches: b.branches,
      deposits: b.deposits,
      advances: b.advances,
      depositGrowth: b.depositGrowth,
      creditGrowth: b.creditGrowth,
      digitalReadiness: b.digitalReadiness,
      geographicCoverage: b.geographicCoverage,
      opportunityScore: dims.expansionOpportunity,
      dims,
      source: b.source,
    };
  });
}

// -------------------- Aggregate (All Banks) helpers --------------------
export function regionOpportunities(bankName) {
  const list = !bankName || bankName === "All Banks" ? BANKS.map((b) => b.name) : [bankName];
  const mean = (arr) => arr.reduce((a, c) => a + c, 0) / arr.length;
  return REGIONS.map((r) => {
    const subs = list.map((bn) => stateScores(bn, r.state));
    const sub = {
      marketGrowth: r.marketGrowth,
      creditOpportunity: r.creditOpportunity,
      depositOpportunity: r.depositOpportunity,
      customerPotential: r.customerPotential,
      competitiveOpportunity: round(mean(subs.map((s) => s.competitiveOpportunity))),
      digitalReadiness: r.digitalReadiness,
    };
    const overall = round(mean(subs.map((s) => s.overall)));
    const presence = round(mean(subs.map((s) => s.presence)));
    const decision = decisionForScore(overall);
    return {
      state: r.state, region: r.region, score: overall, sub, presence, decision,
      priority: priorityForScore(overall), drivers: topDrivers(sub, 3),
      recommendation: recommendationText(sub, r.state), dataConfidence: r.dataConfidence,
    };
  }).sort((a, b) => b.score - a.score);
}

export function indiaOpportunityIndex(bankName) {
  const list = regionOpportunities(bankName);
  return Math.round((list.reduce((a, o) => a + o.score, 0) / list.length) * 10) / 10;
}

export function indiaScoreComponents(bankName) {
  const list = !bankName || bankName === "All Banks" ? BANKS.map((b) => b.name) : [bankName];
  const out = {};
  SCORE_WEIGHTS.forEach((w) => {
    const vals = [];
    REGIONS.forEach((r) => list.forEach((bn) => vals.push(stateScores(bn, r.state)[w.key])));
    out[w.key] = round(vals.reduce((a, c) => a + c, 0) / vals.length);
  });
  return out;
}

export function portfolioStats() {
  let opps = 0;
  BANKS.forEach((b) => rankedOpportunities(b.name).forEach((o) => { if (o.score >= 80) opps += 1; }));
  return {
    banks: BANKS.length,
    regions: REGIONS.length,
    totalBranches: BANKS.reduce((a, b) => a + b.branches, 0),
    totalDeposits: BANKS.reduce((a, b) => a + b.deposits, 0),
    totalAdvances: BANKS.reduce((a, b) => a + b.advances, 0),
    opportunities: opps,
  };
}

// -------------------- Context payload for the AI consultant --------------------
export function buildConsultantContext(bankName) {
  const bank = getBank(bankName);
  const ranked = rankedOpportunities(bankName);
  const dims = bankDimensions(bankName);
  return {
    methodologyNote:
      "BranchIQ combines public banking, geographic and market indicators with an analytical scoring framework. Scores are model-generated estimates, not official bank forecasts.",
    bank: {
      name: bank.name,
      sector: bank.sector,
      reportingPeriod: bank.reportingPeriod,
      branches: bank.branches,
      deposits_cr: bank.deposits,
      advances_cr: bank.advances,
      depositGrowthPct: bank.depositGrowth,
      creditGrowthPct: bank.creditGrowth,
      digitalReadinessScore: bank.digitalReadiness,
      geographicCoverageScore: bank.geographicCoverage,
      nationalOpportunityScore: dims.expansionOpportunity,
      source: bank.source,
    },
    analyticalDimensions: dims,
    topOpportunities: ranked.slice(0, 6).map((o) => ({
      state: o.state,
      region: o.region,
      score: o.score,
      decision: o.decision.label,
      priority: o.priority,
      drivers: o.drivers.map((d) => d.label),
      subScores: {
        marketGrowth: o.sub.marketGrowth,
        creditOpportunity: o.sub.creditOpportunity,
        depositOpportunity: o.sub.depositOpportunity,
        customerPotential: o.sub.customerPotential,
        competitiveOpportunity: o.sub.competitiveOpportunity,
        digitalReadiness: o.sub.digitalReadiness,
      },
    })),
    allBanksSummary: comparisonRows().map((r) => ({
      name: r.name,
      sector: r.sector,
      branches: r.branches,
      deposits_cr: r.deposits,
      advances_cr: r.advances,
      opportunityScore: r.opportunityScore,
      digitalReadiness: r.digitalReadiness,
    })),
  };
}
