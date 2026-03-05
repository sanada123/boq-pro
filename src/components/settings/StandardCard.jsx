import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Pencil, Trash2 } from "lucide-react";

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

export default function StandardCard({ standard, onEdit, onToggle, onDelete }) {
  return (
    <div className={`bg-white rounded-xl sm:rounded-2xl border border-slate-100 p-3 sm:p-5 transition-all ${
      !standard.is_active ? "opacity-50" : ""
    }`}>
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <Badge className={`${SECTION_COLORS[standard.section] || "bg-gray-100 text-gray-800"} text-[10px] sm:text-xs font-bold`}>
              {standard.section_name_he}
            </Badge>
            <span className="text-[10px] sm:text-xs text-slate-500 font-mono">{standard.standard_reference}</span>
            {standard.waste_factor > 0 && (
              <span className="text-[10px] sm:text-xs text-slate-400">פחת: {standard.waste_factor}%</span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">{standard.description}</p>
          {standard.custom_notes && (
            <p className="text-[10px] sm:text-xs text-amber-600 mt-1 bg-amber-50 rounded-lg px-2 py-1 inline-block">
              📝 {standard.custom_notes}
            </p>
          )}
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <Switch
            checked={standard.is_active}
            onCheckedChange={onToggle}
            className="scale-75 sm:scale-100"
          />
          <Button size="icon" variant="ghost" className="h-7 w-7 sm:h-8 sm:w-8 text-slate-400 hover:text-[#1e3a5f]" onClick={onEdit}>
            <Pencil className="w-3.5 h-3.5" />
          </Button>
          <Button size="icon" variant="ghost" className="h-7 w-7 sm:h-8 sm:w-8 text-slate-400 hover:text-red-500" onClick={onDelete}>
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}