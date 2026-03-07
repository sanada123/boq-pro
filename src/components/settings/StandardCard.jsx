import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Pencil, Trash2 } from "lucide-react";

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

export default function StandardCard({ standard, onEdit, onToggle, onDelete }) {
  return (
    <div className={`bg-white rounded border border-slate-200 p-3 sm:p-5 transition-all ${
      !standard.is_active ? "opacity-50" : ""
    }`}>
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className={`inline-flex items-center text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded border ${SECTION_COLORS[standard.section] || "bg-slate-500/15 text-slate-400 border-slate-500/30"}`}>
              {standard.section_name_he}
            </span>
            <span className="text-[10px] sm:text-xs text-slate-500 eng-mono">{standard.standard_reference}</span>
            {standard.waste_factor > 0 && (
              <span className="text-[10px] sm:text-xs text-slate-500">פחת: {standard.waste_factor}%</span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">{standard.description}</p>
          {standard.custom_notes && (
            <p className="text-[10px] sm:text-xs text-amber-600 mt-1 bg-amber-50 rounded px-2 py-1 inline-block border border-amber-200">
              {standard.custom_notes}
            </p>
          )}
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <Switch
            checked={standard.is_active}
            onCheckedChange={onToggle}
            className="scale-75 sm:scale-100"
          />
          <Button size="icon" variant="ghost" className="h-7 w-7 sm:h-8 sm:w-8 text-slate-500 hover:text-amber-600 hover:bg-amber-50" onClick={onEdit}>
            <Pencil className="w-3.5 h-3.5" />
          </Button>
          <Button size="icon" variant="ghost" className="h-7 w-7 sm:h-8 sm:w-8 text-slate-500 hover:text-rose-600 hover:bg-rose-50" onClick={onDelete}>
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
