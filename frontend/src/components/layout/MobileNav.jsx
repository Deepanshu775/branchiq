import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard, BarChart3, MapPin, Bot, Compass, BookOpen, Network,
} from "lucide-react";

const NAV = [
  { id: "01", name: "Executive Dashboard", to: "/", icon: LayoutDashboard, end: true },
  { id: "02", name: "Bank Comparison", to: "/comparison", icon: BarChart3 },
  { id: "03", name: "Network Analysis", to: "/network", icon: MapPin },
  { id: "04", name: "BranchIQ Consultant", to: "/consultant", icon: Bot },
  { id: "05", name: "Strategic Recommendations", to: "/recommendations", icon: Compass },
  { id: "06", name: "Sources & Methodology", to: "/methodology", icon: BookOpen },
];

export default function MobileNav() {
  return (
    <div className="flex flex-col h-full text-white">
      <div className="px-5 py-5 border-b border-white/10 flex items-center gap-3">
        <div className="flex items-center justify-center h-9 w-9 rounded-lg" style={{ background: "linear-gradient(135deg,#1687F8,#27C3E8)" }}>
          <Network size={20} color="#fff" />
        </div>
        <div>
          <div className="font-display text-lg font-extrabold">BRANCHIQ</div>
          <div className="text-[10px] text-slate-400">AI Banking Network Strategy</div>
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-md px-3 py-2.5 text-sm ${
                isActive ? "bg-[#1687F8] text-white font-semibold" : "text-slate-300 hover:bg-white/5"
              }`
            }
          >
            <span className="font-mono text-[11px] text-slate-500">{item.id}</span>
            <item.icon size={17} />
            {item.name}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
