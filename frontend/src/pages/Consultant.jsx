import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useApp } from "../context/AppContext";
import { getBank } from "../data/banks";
import { buildConsultantContext, decisionForScore } from "../lib/engine";
import { SectionTitle } from "../components/shared/Section";
import { DataBadge, ConfidenceBadge, DecisionBadge } from "../components/shared/Badges";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger,
} from "../components/ui/collapsible";
import {
  TrendingUp, Network, Swords, Compass, ArrowRight, Send, Sparkles, ChevronDown, CheckCircle2, Loader2,
} from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AGENTS = [
  { id: "01", title: "Market Analyst", icon: TrendingUp, accent: "#2563EB", analyzes: ["Population", "Market growth", "Economic activity", "Credit & deposit environment"], question: "Is this market attractive?" },
  { id: "02", title: "Banking Network Analyst", icon: Network, accent: "#0891B2", analyzes: ["Branch presence", "Geographic coverage", "Network scale", "Regional penetration"], question: "How strong is the bank's current presence?" },
  { id: "03", title: "Competitive Intelligence", icon: Swords, accent: "#E79B24", analyzes: ["Competitor presence", "Market concentration", "Relative coverage", "Competitive intensity"], question: "Where does the bank have competitive opportunity?" },
  { id: "04", title: "Strategy Consultant", icon: Compass, accent: "#1D4ED8", analyzes: ["Synthesis of all agents", "Opportunity score", "Business rationale", "Priority & action"], question: "What is the recommended strategy?" },
];

const PIPELINE_STAGES = [
  "Analyzing market...",
  "Evaluating bank network...",
  "Benchmarking competitors...",
  "Calculating opportunity...",
  "Generating strategic recommendation...",
];

const EXAMPLES = [
  "Which bank has the strongest expansion opportunity?",
  "Where should SBI expand?",
  "Which markets have the highest banking opportunity?",
  "Compare HDFC Bank and ICICI Bank.",
  "Where does Axis Bank have competitive opportunity?",
  "Which regions should Bank of Baroda prioritize?",
  "Which markets are suitable for digital-first banking?",
  "Compare private and public sector network strategies.",
];

export default function Consultant() {
  const { selectedBank } = useApp();
  const bank = getBank(selectedBank);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState(-1);
  const [answer, setAnswer] = useState(null);
  const [error, setError] = useState(null);
  const stageTimer = useRef(null);
  const respRef = useRef(null);

  useEffect(() => () => clearInterval(stageTimer.current), []);

  const runPipeline = () => {
    setStage(0);
    let i = 0;
    stageTimer.current = setInterval(() => {
      i += 1;
      if (i < PIPELINE_STAGES.length) setStage(i);
      else clearInterval(stageTimer.current);
    }, 650);
  };

  const ask = async (q) => {
    const question = (q ?? query).trim();
    if (!question || loading) return;
    setQuery(question);
    setLoading(true);
    setError(null);
    setAnswer(null);
    runPipeline();
    try {
      const context = buildConsultantContext(selectedBank);
      const { data } = await axios.post(`${API}/consultant/ask`, { question, selectedBank, context });
      setAnswer(data);
      setTimeout(() => respRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    } catch (e) {
      setError("BranchIQ could not complete the analysis. Please try again.");
    } finally {
      clearInterval(stageTimer.current);
      setStage(-1);
      setLoading(false);
    }
  };

  const decision = answer?.opportunityScore != null ? decisionForScore(answer.opportunityScore) : null;

  return (
    <div className="space-y-8" data-testid="page-consultant">
      <SectionTitle eyebrow="AI Consulting Team" title="Ask BranchIQ" subtitle="Strategic questions. Data-backed answers." testid="section-consultant" />

      {/* Agent cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {AGENTS.map((a) => (
          <div key={a.id} data-testid={`agent-card-${a.id}`} className="bq-card bq-shadow p-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1" style={{ background: a.accent }} />
            <div className="flex items-center justify-between">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: `${a.accent}16`, color: a.accent }}><a.icon size={20} /></span>
              <span className="font-mono text-xs text-slate-300">AGENT {a.id}</span>
            </div>
            <h3 className="font-display text-base font-bold text-[#071426] mt-3">{a.title}</h3>
            <ul className="mt-2 space-y-1">
              {a.analyzes.map((x) => <li key={x} className="text-[11px] text-slate-500 flex items-center gap-1.5"><span className="h-1 w-1 rounded-full bg-slate-300" />{x}</li>)}
            </ul>
            <div className="mt-3 rounded-md bg-[#F4F7FB] px-2.5 py-1.5 text-[11px] italic text-slate-600">"{a.question}"</div>
          </div>
        ))}
      </div>

      {/* Pipeline */}
      <div className="bq-card bq-shadow p-4" data-testid="agent-pipeline">
        <div className="eyebrow mb-3">Agent Synthesis Pipeline</div>
        <div className="flex flex-wrap items-center gap-2">
          {["Market Analyst", "Network Analyst", "Competitive Intelligence", "Strategy Consultant", "Opportunity Score", "Recommendation"].map((s, i, arr) => {
            const done = loading ? stage > i : !!answer;
            const activeNow = loading && stage === i;
            return (
              <React.Fragment key={s}>
                <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${activeNow ? "border-[#2563EB] bg-blue-50 text-[#2563EB]" : done ? "border-emerald-300 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-white text-slate-500"}`}>
                  {activeNow ? <Loader2 size={12} className="animate-spin" /> : done ? <CheckCircle2 size={12} /> : <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />}
                  {s}
                </span>
                {i < arr.length - 1 && <ArrowRight size={13} className="text-slate-300" />}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Query box */}
      <div className="bq-card bq-shadow p-5">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={16} className="text-[#2563EB]" />
          <span className="text-sm font-semibold text-[#071426]">Strategic Query</span>
          <span className="ml-auto text-xs text-slate-400">Context: {bank.short} · {bank.reportingPeriod}</span>
        </div>
        <Textarea
          data-testid="consultant-query-input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) ask(); }}
          placeholder="Ask a banking network strategy question..."
          className="min-h-[90px] resize-none border-[#DFE7F0] text-sm"
        />
        <div className="flex items-center justify-between mt-3">
          <span className="text-[11px] text-slate-400">Press ⌘/Ctrl + Enter to submit</span>
          <Button data-testid="btn-ask-consultant" onClick={() => ask()} disabled={loading || !query.trim()} className="bg-[#071426] hover:bg-[#0C1D33] text-white gap-2">
            {loading ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
            {loading ? "Analyzing..." : "Ask BranchIQ"}
          </Button>
        </div>
        <div className="mt-4">
          <div className="eyebrow mb-2">Example Questions</div>
          <div className="flex flex-wrap gap-2">
            {EXAMPLES.map((ex) => (
              <button key={ex} data-testid={`example-${ex.slice(0, 12).replace(/[^a-zA-Z]+/g, "-").toLowerCase()}`} onClick={() => ask(ex)} disabled={loading} className="rounded-full border border-[#DFE7F0] bg-white px-3 py-1.5 text-xs text-slate-600 hover:border-[#2563EB] hover:text-[#2563EB] transition-colors disabled:opacity-50">
                {ex}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="bq-card bq-shadow p-6 text-center" data-testid="consultant-loading">
          <Loader2 size={26} className="animate-spin text-[#2563EB] mx-auto mb-3" />
          <div className="text-sm font-medium text-[#071426]">{stage >= 0 ? PIPELINE_STAGES[stage] : "Analyzing..."}</div>
          <div className="text-xs text-slate-400 mt-1">BranchIQ consulting agents are synthesising a data-backed recommendation.</div>
        </div>
      )}

      {error && !loading && (
        <div className="bq-card border-rose-200 bg-rose-50 p-4 text-sm text-rose-700" data-testid="consultant-error">{error}</div>
      )}

      {/* Structured answer */}
      {answer && !loading && (
        <div ref={respRef} className="bq-card bq-shadow overflow-hidden bq-fade" data-testid="consultant-response">
          <div className="flex flex-wrap items-center gap-2 px-5 py-3 bg-[#071426] text-white">
            <Compass size={16} className="text-cyan-300" />
            <span className="font-display font-bold">BranchIQ Strategic Assessment</span>
            <span className="rounded bg-white/10 px-2 py-0.5 text-[10px] font-semibold">{answer.intent}</span>
            <span className="ml-auto"><ConfidenceBadge level={answer.dataConfidence} /></span>
          </div>
          <div className="p-5 space-y-5">
            <div data-testid="response-executive-answer">
              <div className="eyebrow mb-1.5">Executive Answer</div>
              <p className="text-base text-[#071426] font-medium leading-relaxed">{answer.executiveAnswer}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_200px] gap-5">
              <div data-testid="response-evidence">
                <div className="eyebrow mb-1.5">Key Evidence</div>
                <ul className="space-y-1.5">
                  {answer.keyEvidence.map((e, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-700"><span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#2563EB] shrink-0" />{e}</li>
                  ))}
                </ul>
              </div>
              {answer.opportunityScore != null && (
                <div className="rounded-lg bg-[#F4F7FB] p-4 flex flex-col items-center justify-center text-center" data-testid="response-score">
                  <div className="eyebrow mb-1">Opportunity Score</div>
                  <div className="font-display text-4xl font-bold text-[#071426]">{answer.opportunityScore}</div>
                  <div className="text-xs text-slate-400 mb-2">/ 100</div>
                  {decision && <DecisionBadge decision={decision} />}
                </div>
              )}
            </div>

            <div data-testid="response-reasoning">
              <div className="eyebrow mb-1.5">Business Reasoning</div>
              <p className="text-sm text-slate-700 leading-relaxed">{answer.businessReasoning}</p>
            </div>

            <div className="rounded-lg border border-[#2563EB]/30 bg-blue-50/50 p-4" data-testid="response-action">
              <div className="eyebrow mb-1.5 text-[#2563EB]">Recommended Action</div>
              <p className="text-sm text-[#071426] font-medium leading-relaxed">{answer.recommendedAction}</p>
            </div>

            {answer.supportingData?.length > 0 && (
              <Collapsible>
                <CollapsibleTrigger data-testid="view-supporting-data" className="flex items-center gap-1.5 text-sm font-semibold text-[#2563EB] hover:underline">
                  <ChevronDown size={15} /> View supporting data
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-3">
                  <div className="overflow-hidden rounded-lg border border-[#DFE7F0]">
                    <table className="w-full text-sm">
                      <thead><tr className="bg-[#F4F7FB] text-left text-[11px] uppercase tracking-wide text-slate-500"><th className="px-3 py-2">Indicator</th><th className="px-3 py-2">Value</th><th className="px-3 py-2">Source / Type</th></tr></thead>
                      <tbody>
                        {answer.supportingData.map((d, i) => (
                          <tr key={i} className="border-t border-[#EEF2F8]"><td className="px-3 py-2 text-slate-700">{d.label}</td><td className="px-3 py-2 font-mono text-[#0C1D33]">{d.value}</td><td className="px-3 py-2 text-slate-500 text-xs">{d.source}</td></tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}

            <div className="flex items-center gap-2 pt-1"><DataBadge type="analytical" /><span className="text-[11px] text-slate-400">Model-generated strategic assessment — not an official bank recommendation.</span></div>
          </div>
        </div>
      )}
    </div>
  );
}
