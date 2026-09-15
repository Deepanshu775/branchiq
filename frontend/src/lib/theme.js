export const CHART = {
  primary: "#2563EB",
  dark: "#0F172A",
  accent: "#06B6D4",
  soft: "#60A5FA",
  light: "#DBEAFE",
  neutral: "#E2E8F0",
  muted: "#94A3B8",
  positive: "#10B981",
  warning: "#F59E0B",
  grid: "#EEF2F7",
  ink: "#0F172A",
  charcoal: "#0B1220",
};

export function opportunityFill(score) {
  if (score >= 80) return "#1D4ED8";
  if (score >= 72) return "#2563EB";
  if (score >= 64) return "#0891B2";
  if (score >= 56) return "#67E8F9";
  return "#DBEAFE";
}
export function opportunityText(score) { return score >= 64 ? "#ffffff" : "#1E3A8A"; }
