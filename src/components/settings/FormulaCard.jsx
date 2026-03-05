import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Pencil, Lock } from "lucide-react";

const SECTION_COLORS = {
  earthworks: "bg-amber-100 text-amber-800",
  concrete_foundations: "bg-slate-200 text-slate-800",
  skeleton: "bg-blue-100 text-blue-800",
  finishing: "bg-emerald-100 text-emerald-800",
  plumbing: "bg-cyan-100 text-cyan-800",
  electrical: "bg-yellow-100 text-yellow-800",
  metalwork: "bg-red-100 text-red-800",
  insulation: "bg-violet-100 text-violet-800",
  misc: "bg-gray-100 text-gray-800",
};

export default function FormulaCard({ formula, onEdit, onToggle }) {
  return (
    <div className={`bg-white rounded-xl border border-slate-100 p-3 sm:p-4 transition-all ${
      !formula.is_active ? "opacity-50" : ""
    }`}>
      <div className="flex items-start gap-2 sm:gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1">
            <Badge className={`${SECTION_COLORS[formula.section] || "bg-gray-100"} text-[9px] sm:text-[10px] font-bold`}>
              {formula.section}
            </Badge>
            <span className="text-xs sm:text-sm font-bold text-slate-800">{formula.element_name_he}</span>
            {!formula.is_editable && (
              <Lock className="w-3 h-3 text-slate-300" />
            )}
          </div>
          <div className="bg-slate-50 rounded-lg px-2.5 py-1.5 font-mono text-[10px] sm:text-xs text-slate-600 mt-1.5" dir="ltr">
            {formula.formula}
          </div>
          {formula.formula_description_he && (
            <p className="text-[10px] sm:text-xs text-slate-500 mt-1">{formula.formula_description_he}</p>
          )}
          {formula.default_values && (
            <p className="text-[10px] sm:text-xs text-blue-600 mt-0.5">ברירות מחדל: {formula.default_values}</p>
          )}
          {formula.waste_factor > 0 && (
            <span className="text-[10px] sm:text-xs text-amber-600">פחת: {formula.waste_factor}%</span>
          )}
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <Switch
            checked={formula.is_active}
            onCheckedChange={onToggle}
            className="scale-75 sm:scale-100"
          />
          {formula.is_editable && (
            <Button size="icon" variant="ghost" className="h-7 w-7 text-slate-400 hover:text-[#1e3a5f]" onClick={onEdit}>
              <Pencil className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}