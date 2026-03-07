import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Pencil, Lock } from "lucide-react";

const SECTION_COLORS = {
  earthworks: "bg-amber-50 text-amber-600 border-amber-200",
  concrete_foundations: "bg-slate-500/15 text-slate-700 border-slate-500/30",
  skeleton: "bg-cyan-500/15 text-blue-600 border-blue-200",
  finishing: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",
  plumbing: "bg-sky-500/15 text-sky-400 border-sky-500/30",
  electrical: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  metalwork: "bg-rose-500/15 text-rose-600 border-rose-500/30",
  insulation: "bg-violet-500/15 text-violet-400 border-violet-500/30",
  misc: "bg-slate-500/15 text-slate-400 border-slate-500/30",
};

export default function FormulaCard({ formula, onEdit, onToggle }) {
  return (
    <div className={`bg-white rounded border border-slate-200 p-3 sm:p-4 transition-all ${
      !formula.is_active ? "opacity-50" : ""
    }`}>
      <div className="flex items-start gap-2 sm:gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1">
            <span className={`inline-flex items-center text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded border ${SECTION_COLORS[formula.section] || "bg-slate-500/15 text-slate-400 border-slate-500/30"}`}>
              {formula.section}
            </span>
            <span className="text-xs sm:text-sm font-bold text-slate-800">{formula.element_name_he}</span>
            {!formula.is_editable && (
              <Lock className="w-3 h-3 text-slate-600" />
            )}
          </div>
          <div className="bg-slate-50 rounded px-2.5 py-1.5 eng-mono text-[10px] sm:text-xs text-amber-600 mt-1.5 border border-slate-200" dir="ltr">
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
            <Button size="icon" variant="ghost" className="h-7 w-7 text-slate-500 hover:text-amber-600 hover:bg-amber-50" onClick={onEdit}>
              <Pencil className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
