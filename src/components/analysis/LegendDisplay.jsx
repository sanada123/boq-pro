import React from "react";
import { Badge } from "@/components/ui/badge";
import { BookOpen } from "lucide-react";

const LEGEND_SECTIONS = [
  { key: "column_symbols", label: "עמודים", color: "bg-blue-50 text-blue-700" },
  { key: "beam_symbols", label: "קורות", color: "bg-purple-50 text-purple-700" },
  { key: "foundation_symbols", label: "יסודות", color: "bg-amber-50 text-amber-700" },
  { key: "wall_symbols", label: "קירות", color: "bg-emerald-50 text-emerald-700" },
  { key: "slab_symbols", label: "תקרות/פלטות", color: "bg-cyan-50 text-cyan-700" },
  { key: "material_codes", label: "חומרים", color: "bg-slate-100 text-slate-700" },
  { key: "reinforcement_codes", label: "זיון", color: "bg-red-50 text-red-700" },
  { key: "graphic_symbols", label: "סימנים גרפיים", color: "bg-pink-50 text-pink-700" },
  { key: "other_symbols", label: "אחר", color: "bg-gray-50 text-gray-600" },
];

export default function LegendDisplay({ legend }) {
  if (!legend) return null;

  const hasContent = LEGEND_SECTIONS.some(s => {
    const data = legend[s.key];
    return data && Object.keys(data).length > 0;
  });

  if (!hasContent) return null;

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-4">
      <div className="flex items-center gap-2 mb-3">
        <BookOpen className="w-4 h-4 text-blue-600" />
        <h3 className="text-sm font-bold text-slate-800">מקרא התכנית</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {LEGEND_SECTIONS.map(section => {
          const data = legend[section.key];
          if (!data || Object.keys(data).length === 0) return null;
          return (
            <div key={section.key} className="bg-slate-50/50 rounded-lg p-3 border border-slate-100">
              <Badge className={`${section.color} text-[10px] mb-2 rounded-md`}>{section.label}</Badge>
              <div className="space-y-1">
                {Object.entries(data).map(([symbol, meaning]) => (
                  <div key={symbol} className="flex items-start gap-1.5 text-[11px]">
                    <span className="font-mono font-semibold text-slate-700 shrink-0 bg-white px-1.5 py-0.5 rounded border border-slate-200">{symbol}</span>
                    <span className="text-slate-500">{meaning}</span>
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