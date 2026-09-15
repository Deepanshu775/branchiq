// Regional market indicators — BranchIQ curated public-data layer.
// Population is public (Census 2011 with 2026 estimates). The market/opportunity indicators
// (0-100) are BranchIQ MODEL-GENERATED ESTIMATES derived from public economic, credit, deposit
// and demographic indicators. They are NOT official bank figures.

export const REGIONS = [
  { state: "Maharashtra", region: "West", populationMn: 126, gsdpGrowth: 8.1, marketGrowth: 84, creditOpportunity: 90, depositOpportunity: 88, customerPotential: 86, digitalReadiness: 85, marketConcentration: 82, dataConfidence: "HIGH" },
  { state: "Delhi NCR", region: "North", populationMn: 34, gsdpGrowth: 8.4, marketGrowth: 82, creditOpportunity: 88, depositOpportunity: 90, customerPotential: 80, digitalReadiness: 92, marketConcentration: 88, dataConfidence: "HIGH" },
  { state: "Karnataka", region: "South", populationMn: 68, gsdpGrowth: 8.6, marketGrowth: 86, creditOpportunity: 88, depositOpportunity: 79, customerPotential: 84, digitalReadiness: 88, marketConcentration: 74, dataConfidence: "HIGH" },
  { state: "Telangana", region: "South", populationMn: 39, gsdpGrowth: 8.9, marketGrowth: 85, creditOpportunity: 84, depositOpportunity: 78, customerPotential: 81, digitalReadiness: 86, marketConcentration: 70, dataConfidence: "HIGH" },
  { state: "Tamil Nadu", region: "South", populationMn: 77, gsdpGrowth: 8.0, marketGrowth: 80, creditOpportunity: 85, depositOpportunity: 82, customerPotential: 83, digitalReadiness: 82, marketConcentration: 76, dataConfidence: "HIGH" },
  { state: "Gujarat", region: "West", populationMn: 71, gsdpGrowth: 8.3, marketGrowth: 83, creditOpportunity: 86, depositOpportunity: 80, customerPotential: 82, digitalReadiness: 80, marketConcentration: 72, dataConfidence: "HIGH" },
  { state: "West Bengal", region: "East", populationMn: 99, gsdpGrowth: 6.4, marketGrowth: 68, creditOpportunity: 70, depositOpportunity: 74, customerPotential: 78, digitalReadiness: 66, marketConcentration: 64, dataConfidence: "MEDIUM" },
  { state: "Rajasthan", region: "North", populationMn: 81, gsdpGrowth: 7.2, marketGrowth: 72, creditOpportunity: 74, depositOpportunity: 70, customerPotential: 76, digitalReadiness: 64, marketConcentration: 56, dataConfidence: "MEDIUM" },
  { state: "Uttar Pradesh", region: "Central", populationMn: 235, gsdpGrowth: 7.6, marketGrowth: 74, creditOpportunity: 72, depositOpportunity: 71, customerPotential: 88, digitalReadiness: 62, marketConcentration: 58, dataConfidence: "MEDIUM" },
  { state: "Goa", region: "West", populationMn: 1.6, gsdpGrowth: 7.0, marketGrowth: 66, creditOpportunity: 60, depositOpportunity: 68, customerPotential: 58, digitalReadiness: 78, marketConcentration: 50, dataConfidence: "LIMITED" },
  { state: "Kerala", region: "South", populationMn: 36, gsdpGrowth: 6.8, marketGrowth: 64, creditOpportunity: 68, depositOpportunity: 80, customerPotential: 70, digitalReadiness: 84, marketConcentration: 68, dataConfidence: "MEDIUM" },
  { state: "Madhya Pradesh", region: "Central", populationMn: 87, gsdpGrowth: 7.4, marketGrowth: 73, creditOpportunity: 71, depositOpportunity: 68, customerPotential: 80, digitalReadiness: 60, marketConcentration: 52, dataConfidence: "MEDIUM" },
];

export const STATE_NAMES = REGIONS.map((r) => r.state);

// City / district tier filter options for Network Analysis
export const TIERS = [
  { id: "all", label: "All Tiers" },
  { id: "tier1", label: "Tier-1 (Metro)" },
  { id: "tier2", label: "Tier-2 (Urban)" },
  { id: "tier3", label: "Tier-3 to Tier-6 (Semi-Urban / Rural)" },
];
