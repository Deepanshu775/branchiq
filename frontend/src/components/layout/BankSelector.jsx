import React from "react";
import { useApp } from "../../context/AppContext";
import { BANK_GROUPS, getBank } from "../../data/banks";
import { getBank as _gb } from "../../lib/engine";
import {
  Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue,
} from "../ui/select";
import { Landmark } from "lucide-react";

export default function BankSelector({ testid = "bank-selector-dropdown", className = "" }) {
  const { selectedBank, setSelectedBank } = useApp();
  return (
    <Select value={selectedBank} onValueChange={setSelectedBank}>
      <SelectTrigger data-testid={testid} className={`h-9 w-[220px] shrink-0 border-[#E2E8F0] bg-white text-sm font-semibold text-[#0F172A] ${className}`}>
        <span className="flex items-center gap-2">
          <Landmark size={15} className="text-[#2563EB]" />
          <SelectValue placeholder="Select a bank" />
        </span>
      </SelectTrigger>
      <SelectContent className="max-h-[380px]">
        {BANK_GROUPS.map((grp) => (
          <SelectGroup key={grp.group}>
            <SelectLabel className="text-[10px] uppercase tracking-wider text-slate-400">{grp.group}</SelectLabel>
            {grp.banks.map((name) => (
              <SelectItem key={name} value={name} data-testid={`bank-option-${name.replace(/[^a-zA-Z]+/g, "-").toLowerCase()}`}>
                {name}
              </SelectItem>
            ))}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  );
}
