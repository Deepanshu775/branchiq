# BRANCHIQ — Product Requirements Document

## Original Problem Statement
Build BRANCHIQ, an AI Banking Network Strategy Consultant for the Indian banking sector — a premium McKinsey/BCG-style executive decision-support platform (NOT a chatbot). It converts public banking/geographic/market indicators into strategic network recommendations across 9 Indian banks, with dynamic scoring, an AI consulting workflow, strategic recommendations, and an executive report.

## User Choices
- Consultant: Real AI (Emergent LLM key, Claude Sonnet) grounded on the dataset, with rule-based fallback.
- Data: Curated verified public FY2025 figures + BranchIQ analytical (model-generated) scores, clearly labelled.
- No authentication — opens directly to the dashboard.
- Executive report: in-browser Print + PDF.
- Emphasis: natural, data-analyst-grade consulting UI (avoid generic AI look).

## Architecture
- Frontend: React + react-router + Tailwind + shadcn/ui + Recharts. Fonts: Outfit (display), Inter (body), JetBrains Mono. Exact color system per spec.
- Data layer (frontend): `src/data/{banks,regions,sources}.js`. Scoring engine `src/lib/engine.js` (Opportunity Score = 0.30·MarketGrowth + 0.20·Credit + 0.15·Deposit + 0.15·Customer + 0.10·Competitive + 0.10·Digital; decision bands EXPAND/SELECTIVE/OPTIMIZE/DIGITAL-FIRST/REVIEW).
- Backend: FastAPI `POST /api/consultant/ask` (Claude Sonnet via emergentintegrations, JSON-structured output, rule-based fallback, persisted to Mongo), `GET /api/consultant/history`.
- State via React context (selected bank/state, report modal).

## User Personas
Strategy Consultant, Banking Executive, Chief Strategy Officer, Head of Retail Banking, Network Planning Head, Digital Banking Head.

## Core Requirements (static)
9 banks (Public: SBI, BoB, PNB, Canara; Private: HDFC, ICICI, Axis, Kotak, IndusInd). 6 pages: Executive Dashboard, Bank Comparison, Network Analysis, BranchIQ Consultant, Strategic Recommendations, Sources & Methodology. Data labelling badges, transparency notes, dynamic scoring, executive report. No fabricated official figures; no "synthetic data" wording.

## Implemented (2026-06)
- [x] Executive Dashboard: hero, 5 KPI cards with source badges, 5 comparison charts (bank-dynamic), ranked Management Priorities.
- [x] Bank Comparison: sortable 9-bank table, 5 analytical dimensions, Opportunity Matrix, Private vs Public chart.
- [x] Network Analysis: bank/state/tier filters, 8 market-intelligence panels, Branch Opportunity Score ring + 6 sub-scores, expandable scoring formula, data-confidence + low-evidence states.
- [x] BranchIQ Consultant: 4 professional agent cards, synthesis pipeline with progress states, LLM-backed structured answers (Executive Answer/Key Evidence/Opportunity Score/Business Reasoning/Recommended Action), example chips, view-supporting-data.
- [x] Strategic Recommendations: 5 category boards, clickable 2x2 priority matrix, market detail dialog.
- [x] Sources & Methodology: source cards, process flow, scoring formula, transparency section.
- [x] Executive Report: 10-section consulting report, Print/PDF.
- [x] Responsive layout (sidebar + mobile sheet nav), full data-testid coverage.
- [x] Tested: backend 4/4 pytest, frontend 100% of flows.

## Backlog / Remaining
- P1: Trends over multiple periods (time-series) once multi-year public data is curated.
- P2: Server-generated PDF, richer heatmap by district, export to Excel.
- P2: Split backend into routers/services; add timeout wrapper on LLM call.

## Next Tasks
- Await user feedback; deepen any specific page or add requested markets/metrics.
