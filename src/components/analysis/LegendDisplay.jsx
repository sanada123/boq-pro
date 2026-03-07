import React from "react";
import { Badge } from "@/components/ui/badge";
import { BookOpen } from "lucide-react";

const LEGEND_SECTIONS = [
  { key: "column_symbols", label: "עמודים", color: "bg-cyan-500/15 text-blue-600 border-blue-200" },
  { key: "beam_symbols", label: "קורות", color: "bg-violet-500/15 text-violet-400 border-violet-500/30" },
  { key: "foundation_symbols", label: "יסודות", color: "bg-amber-50 text-amber-600 border-amber-200" },
  { key: "wall_symbols", label: "קירות", color: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30" },
  { key: "slab_symbols", label: "תקרות/פלטות", color: "bg-sky-500/15 text-sky-400 border-sky-500/30" },
  { key: "material_codes", label: "חומרים", color: "bg-slate-500/15 text-slate-400 border-slate-500/30" },
  { key: "reinforcement_codes", label: "זיון", color: "bg-rose-500/15 text-rose-600 border-rose-500/30" },
  { key: "graphic_symbols", label: "סימנים גרפיים", color: "bg-pink-500/15 text-pink-400 border-pink-500/30" },
  { key: "other_symbols", label: "אחר", color: "bg-slate-500/15 text-slate-500 border-slate-500/30" },
];

export default function LegendDisplay({ legend }) {
  if (!legend) return null;

  const hasContent = LEGEND_SECTIONS.some(s => {
    const data = legend[s.key];
    return data && Object.keys(data).length > 0;
  });

  if (!hasContent) return null;

  return (
    <div className="eng-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <BookOpen className="w-4 h-4 text-amber-600" />
        <h3 className="text-sm font-bold text-slate-800">מקרא התכנית</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {LEGEND_SECTIONS.map(section => {
          const data = legend[section.key];
          if (!data || Object.keys(data).length === 0) return null;
          return (
            <div key={section.key} className="bg-slate-50 rounded border border-slate-200 p-3">
              <span className={`inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded border mb-2 ${section.color}`}>
                {section.label}
              </span>
              <div className="space-y-1">
                {Object.entries(data).map(([symbol, meaning]) => (
                  <div key={symbol} className="flex items-start gap-1.5 text-[11px]">
                    <span className="font-mono font-semibold text-amber-600 shrink-0 bg-white px-1.5 py-0.5 rounded border border-slate-200">{symbol}</span>
                    <span className="text-slate-400">{meaning}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
