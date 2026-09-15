import React from "react";
import { NavLink } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import { LayoutGrid, Building2, Network as NetworkIcon, Map, Bot, Compass, BookOpen, Sparkles, UserCircle2, X } from "lucide-react";

const NAV = [
  { name: "Overview", to: "/", icon: LayoutGrid, end: true },
  { name: "Bank Intelligence", to: "/comparison", icon: Building2 },
  { name: "Network Analysis", to: "/network", icon: NetworkIcon },
  { name: "Opportunity Map", to: "/opportunity-map", icon: Map },
  { name: "AI Consultant", to: "/consultant", icon: Bot },
  { name: "Strategic Recommendations", to: "/recommendations", icon: Compass },
  { name: "Sources & Methodology", to: "/methodology", icon: BookOpen },
];

export default function Sidebar() {
  const { navOpen, setNavOpen } = useApp();
  // Sidebar is now an overlay on every screen size, so any nav click closes it.
  const closeOnMobile = () => setNavOpen(false);
  return (
    <aside
      data-testid="app-sidebar"
      style={{ transform: navOpen ? "translateX(0)" : "translateX(-100%)" }}
      className="fixed z-40 top-0 left-0 h-screen w-64 flex flex-col bg-[#0B1220] text-white transition-transform duration-300 border-r border-white/5"
    >
      <div className="px-5 py-5 border-b border-white/[.07]">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 shadow-lg shadow-blue-950/40">
            <Sparkles size={20} color="#fff" strokeWidth={2.2} />
          </span>
          <div className="leading-tight">
            <div className="font-display text-lg font-extrabold tracking-tight">BRANCH<span className="text-cyan-400">IQ</span></div>
            <div className="text-[10px] text-slate-400 mt-0.5">AI Banking Network Strategy</div>
          </div>
          <button
            onClick={() => setNavOpen(false)}
            aria-label="Close navigation"
            data-testid="nav-close-btn"
            className="ml-auto flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/[.08] transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto bq-scroll">
        <div className="eyebrow text-slate-500 px-3 pb-2">Workspace</div>
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={closeOnMobile}
            data-testid={`nav-${item.name.toLowerCase().replace(/[^a-z]+/g, "-").replace(/(^-|-$)/g, "")}`}
            className={({ isActive }) => `relative group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all ${isActive ? "bg-blue-600/15 text-white font-semibold shadow-inner" : "text-slate-400 hover:bg-white/[.045] hover:text-white"}`}
          >
            {({ isActive }) => (
              <>
                {isActive && <span className="absolute left-0 top-2 bottom-2 w-1 rounded-full bg-gradient-to-b from-blue-400 to-cyan-400" />}
                <item.icon size={18} className={`shrink-0 ${isActive ? "text-cyan-300" : "text-slate-500 group-hover:text-slate-200"}`} />
                <span className="leading-tight">{item.name}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="px-4 py-4 border-t border-white/[.07]">
        <div className="eyebrow text-slate-500 mb-2">Data Coverage</div>
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[['9', 'Banks'], ['12+', 'Regions'], ['Public', 'Data']].map(([n, l]) => (
            <div key={l} className="rounded-xl bg-white/[.045] border border-white/[.05] px-2 py-2 text-center">
              <div className="stat-num text-sm text-white">{n}</div>
              <div className="text-[9px] uppercase tracking-wide text-slate-500">{l}</div>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2.5 rounded-xl bg-white/[.045] border border-white/[.05] px-3 py-2.5">
          <UserCircle2 size={30} className="text-cyan-300" />
          <div className="leading-tight">
            <div className="text-sm font-semibold text-white">BranchIQ Analyst</div>
            <div className="text-[10px] text-slate-500">Strategy Workspace</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
