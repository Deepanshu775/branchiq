import React from "react";
import { useLocation } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import BankSelector from "./BankSelector";
import { Button } from "../ui/button";
import { FileDown, Menu, Search, Bell, Sparkles } from "lucide-react";

const TITLES = {
  "/": ["Executive Dashboard", "Indian Banking Network Intelligence"],
  "/comparison": ["Bank Intelligence", "How does each bank compare?"],
  "/network": ["Network Intelligence", "Where is the network strong — and where is the whitespace?"],
  "/opportunity-map": ["Opportunity Map", "Where should banks expand next?"],
  "/consultant": ["BranchIQ Consultant", "What should management do?"],
  "/recommendations": ["Strategic Recommendations", "What actions should be prioritized?"],
  "/methodology": ["Sources & Methodology", "Can you trust the analysis?"],
};

export default function Header() {
  const { setReportOpen, toggleNav } = useApp();
  const { pathname } = useLocation();
  const [title, subtitle] = TITLES[pathname] || TITLES["/"];

  return (
    <header data-testid="app-header" className="sticky top-0 z-30 bg-white/85 backdrop-blur-xl border-b border-[#E5EAF2]">
      <div className="flex items-center gap-3 px-4 lg:px-7 py-3">
        <Button variant="ghost" size="icon" onClick={toggleNav} data-testid="nav-toggle-btn" className="shrink-0 text-slate-500 hover:text-blue-600 hover:bg-blue-50">
          <Menu size={20} />
        </Button>

        <div className="hidden lg:flex items-center h-10 w-[260px] xl:w-[330px] rounded-xl bg-[#F7F9FC] border border-[#E5EAF2] px-3 gap-2 text-slate-400">
          <Search size={16} />
          <span className="text-xs">Search banks, regions, insights...</span>
          <span className="ml-auto text-[10px] border border-slate-200 bg-white rounded px-1.5 py-0.5">⌘K</span>
        </div>

        <div className="min-w-0 flex-1 px-1 lg:px-3">
          <h1 className="font-display text-base lg:text-lg font-extrabold tracking-tight text-[#0F172A] leading-none truncate">{title}</h1>
          <div className="hidden sm:block text-[10px] text-slate-400 mt-1 truncate">{subtitle}</div>
        </div>

        <div className="hidden xl:flex items-center gap-4 mr-1">
          <div className="flex flex-col leading-tight">
            <span className="eyebrow">Data Period</span>
            <span className="text-xs font-semibold text-slate-700">FY2024–25</span>
          </div>
          <div className="h-7 w-px bg-slate-200" />
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
            <span className="h-2 w-2 rounded-full bg-emerald-500 bq-live-dot" />
            AI Engine Active
          </div>
        </div>

        <button className="hidden sm:flex h-9 w-9 items-center justify-center rounded-xl border border-[#E5EAF2] bg-white text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors" aria-label="Notifications">
          <Bell size={16} />
        </button>
        <BankSelector />
        <Button data-testid="btn-generate-report" onClick={() => setReportOpen(true)} className="h-9 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-semibold gap-2 shadow-sm shadow-blue-600/20">
          <FileDown size={15} />
          <span className="hidden sm:inline">Generate Report</span>
        </Button>
      </div>
    </header>
  );
}
