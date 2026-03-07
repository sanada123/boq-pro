import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronDown, ChevronLeft, Check, Pencil, X, Columns3, Box, Layers, Square, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { getElementStatus } from "./ReviewSummaryBar";

const TYPE_ICONS = {
  "עמוד": Columns3,
  "קורה": Layers,
  "יסוד": Box,
  "רפסודה": Square,
  "default": Box,
};

const CATEGORY_COLORS = {
  foundations: "bg-amber-500/15 text-amber-400",
  skeleton: "bg-cyan-500/15 text-cyan-400",
  walls: "bg-emerald-500/15 text-emerald-400",
  slabs: "bg-violet-500/15 text-violet-400",
  default: "bg-slate-500/15 text-slate-400",
};

export default function ElementReviewCard({ element, index, onCorrect }) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [corrections, setCorrections] = useState({});

  const Icon = TYPE_ICONS[element.type] || TYPE_ICONS.default;
  const colorClass = CATEGORY_COLORS[element.category] || CATEGORY_COLORS.default;
  const dims = element.dimensions || {};
  const reinf = element.reinforcement || {};

  const handleSaveCorrection = () => {
    if (Object.keys(corrections).length > 0) {
      onCorrect(index, corrections);
    }
    setEditing(false);
    setCorrections({});
  };

  const isValidValue = (v) => v != null && v !== "null" && v !== "" && v !== 0 && v !== "0" && v !== undefined;
  const cleanValue = (v) => {
    if (!isValidValue(v)) return null;
    if (typeof v === "number") return v;
    return String(v).replace(/null/gi, "").trim() || null;
  };
  const formatDim = (v, unit) => {
    const cleaned = cleanValue(v);
    if (cleaned === null) return null;
    return `${cleaned} ${unit || 'ס"מ'}`;
  };

  const dimEntries = Object.entries(dims).filter(([k, v]) => k !== "unit" && isValidValue(v));
  const dimLabels = { length: "אורך", width: "רוחב", height: "גובה", thickness: "עובי", diameter: "קוטר", depth: "עומק", span: "מוטה" };

  const { status: elStatus, issues: elIssues } = getElementStatus(element);
  const statusBorder = elStatus === "ok" ? "border-r-emerald-500" : elStatus === "partial" ? "border-r-amber-500" : "border-r-rose-500";
  const StatusIcon = elStatus === "ok" ? CheckCircle2 : elStatus === "partial" ? AlertTriangle : XCircle;
  const statusIconColor = elStatus === "ok" ? "text-emerald-400" : elStatus === "partial" ? "text-amber-400" : "text-rose-400";

  return (
    <div className={`eng-card overflow-hidden border-r-4 ${statusBorder}`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-3.5 hover:bg-white/[0.02] transition-colors text-right"
      >
        <div className={`w-9 h-9 rounded flex items-center justify-center shrink-0 ${colorClass}`}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-slate-200">{element.id || `אלמנט ${index + 1}`}</span>
            <span className="inline-flex items-center text-[10px] font-medium px-1.5 py-0.5 rounded border border-[#1e293b] text-slate-400 bg-[#111827]">{element.type}</span>
            {element.count > 1 && <span className="inline-flex items-center text-[10px] font-medium px-1.5 py-0.5 rounded border border-cyan-500/30 text-cyan-400 bg-cyan-500/10">×{element.count}</span>}
            {element.is_typical && <span className="inline-flex items-center text-[10px] font-medium px-1.5 py-0.5 rounded border border-emerald-500/30 text-emerald-400 bg-emerald-500/10">טיפוסי</span>}
          </div>
          <div className="flex flex-wrap gap-x-2 gap-y-0.5 mt-1">
            {dimEntries.slice(0, 3).map(([k, v]) => (
              <span key={k} className="text-[11px] text-slate-500">{dimLabels[k] || k}: <span className="eng-number">{v}</span>{dims.unit || ""}</span>
            ))}
            {isValidValue(element.material?.concrete_grade) && <span className="text-[11px] text-slate-500">בטון: <span className="eng-mono text-slate-400">{cleanValue(element.material.concrete_grade)}</span></span>}
          </div>
          {elIssues.length > 0 && (
            <div className="flex items-center gap-1 mt-1">
              <StatusIcon className={`w-3 h-3 ${statusIconColor}`} />
              <span className={`text-[11px] font-medium ${statusIconColor}`}>{elIssues.join(" · ")}</span>
            </div>
          )}
        </div>
        {expanded ? <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" /> : <ChevronLeft className="w-4 h-4 text-slate-500 shrink-0" />}
      </button>

      {expanded && (
        <div className="border-t border-[#1e293b] p-4 space-y-3 bg-[#0a0f1a]/50">
          {/* Missing data alert */}
          {elIssues.length > 0 && (
            <div className={`p-3 rounded border ${elStatus === "missing" ? "bg-rose-500/10 border-rose-500/20" : "bg-amber-500/10 border-amber-500/20"}`}>
              <p className={`text-xs font-semibold mb-1.5 ${elStatus === "missing" ? "text-rose-400" : "text-amber-400"}`}>
                נתונים חסרים באלמנט זה:
              </p>
              <ul className="space-y-1">
                {elIssues.map((issue, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs">
                    <span className={`mt-0.5 ${elStatus === "missing" ? "text-rose-500/50" : "text-amber-500/50"}`}>●</span>
                    <div className={elStatus === "missing" ? "text-rose-300/80" : "text-amber-300/80"}>
                      <strong>{issue}</strong>
                      {issue === "חסרות מידות" && <span> — הזן אורך, רוחב, גובה או עובי בלחיצה על "תקן מידות"</span>}
                      {issue === "חסר זיון" && <span> — פרטי זיון (מוטות, כנפות) לא זוהו מהתכנית</span>}
                      {issue === "חסר סוג בטון" && <span> — לדוגמה: B30, B25</span>}
                    </div>
                  </li>
                ))}
              </ul>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setEditing(true)}
                className={`h-7 text-[11px] gap-1 mt-2 rounded ${elStatus === "missing" ? "border-rose-500/30 text-rose-400 hover:bg-rose-500/10" : "border-amber-500/30 text-amber-400 hover:bg-amber-500/10"}`}
              >
                <Pencil className="w-3 h-3" />
                השלם נתונים חסרים
              </Button>
            </div>
          )}

          {/* Dimensions */}
          {dimEntries.length > 0 && (
            <div>
              <h4 className="text-[11px] font-semibold text-slate-500 mb-1.5">מידות</h4>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {dimEntries.map(([k, v]) => (
                  <div key={k} className="bg-[#111827] px-2.5 py-2 rounded border border-[#1e293b]">
                    <span className="text-[10px] text-slate-500 block">{dimLabels[k] || k}</span>
                    {editing ? (
                      <Input
                        type="number"
                        defaultValue={v}
                        onChange={(e) => setCorrections(prev => ({ ...prev, [`dimensions.${k}`]: Number(e.target.value) }))}
                        className="h-6 text-xs mt-0.5 p-1 bg-[#0d1320] border-[#1e293b] text-slate-200"
                      />
                    ) : (
                      <span className="text-xs font-semibold text-slate-200 eng-number">{formatDim(v, dims.unit || 'ס"מ')}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reinforcement raw */}
          {isValidValue(reinf.raw_text) && (
            <div>
              <h4 className="text-[11px] font-semibold text-slate-500 mb-1.5">זיון (מקור)</h4>
              <p className="text-xs text-slate-400 bg-[#111827] p-2.5 rounded border border-[#1e293b] font-mono leading-relaxed">
                {cleanValue(reinf.raw_text)}
              </p>
            </div>
          )}

          {/* Main bars */}
          {(isValidValue(reinf.main_bars?.top) || isValidValue(reinf.main_bars?.bottom)) && (
            <div>
              <h4 className="text-[11px] font-semibold text-slate-500 mb-1.5">מוטות</h4>
              <div className="grid grid-cols-2 gap-2">
                {isValidValue(reinf.main_bars?.top) && (
                  <div className="bg-[#111827] px-2.5 py-2 rounded border border-[#1e293b]">
                    <span className="text-[10px] text-slate-500">עליון</span>
                    <span className="text-xs font-semibold text-slate-200 block eng-mono">{cleanValue(reinf.main_bars.top)}</span>
                  </div>
                )}
                {isValidValue(reinf.main_bars?.bottom) && (
                  <div className="bg-[#111827] px-2.5 py-2 rounded border border-[#1e293b]">
                    <span className="text-[10px] text-slate-500">תחתון</span>
                    <span className="text-xs font-semibold text-slate-200 block eng-mono">{cleanValue(reinf.main_bars.bottom)}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Stirrups */}
          {(isValidValue(reinf.stirrups?.diameter) || isValidValue(reinf.stirrups?.spacing)) && (
            <div>
              <h4 className="text-[11px] font-semibold text-slate-500 mb-1.5">כנפות</h4>
              <div className="grid grid-cols-3 gap-2">
                {isValidValue(reinf.stirrups?.diameter) && (
                  <div className="bg-[#111827] px-2.5 py-2 rounded border border-[#1e293b]">
                    <span className="text-[10px] text-slate-500">קוטר</span>
                    <span className="text-xs font-semibold text-slate-200 block eng-mono">{cleanValue(reinf.stirrups.diameter)}</span>
                  </div>
                )}
                {isValidValue(reinf.stirrups?.spacing) && (
                  <div className="bg-[#111827] px-2.5 py-2 rounded border border-[#1e293b]">
                    <span className="text-[10px] text-slate-500">ריווח</span>
                    <span className="text-xs font-semibold text-slate-200 block eng-mono">{cleanValue(reinf.stirrups.spacing)} ס"מ</span>
                  </div>
                )}
                {isValidValue(reinf.stirrups?.spacing_zones) && (
                  <div className="bg-[#111827] px-2.5 py-2 rounded border border-[#1e293b] col-span-3">
                    <span className="text-[10px] text-slate-500">אזורים</span>
                    <span className="text-xs font-semibold text-slate-200 block">{cleanValue(reinf.stirrups.spacing_zones)}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Lap splices and bends */}
          {(isValidValue(reinf.lap_splice?.length) || isValidValue(reinf.bends?.angle)) && (
            <div>
              <h4 className="text-[11px] font-semibold text-slate-500 mb-1.5">חפיפות וכיפופים</h4>
              <div className="grid grid-cols-2 gap-2">
                {isValidValue(reinf.lap_splice?.length) && (
                  <div className="bg-[#111827] px-2.5 py-2 rounded border border-[#1e293b]">
                    <span className="text-[10px] text-slate-500">חפיפה</span>
                    <span className="text-xs font-semibold text-slate-200 block eng-mono">{cleanValue(reinf.lap_splice.length)} ס"מ{isValidValue(reinf.lap_splice.location) ? ` (${cleanValue(reinf.lap_splice.location)})` : ""}</span>
                  </div>
                )}
                {isValidValue(reinf.bends?.angle) && (
                  <div className="bg-[#111827] px-2.5 py-2 rounded border border-[#1e293b]">
                    <span className="text-[10px] text-slate-500">כיפוף</span>
                    <span className="text-xs font-semibold text-slate-200 block eng-mono">{cleanValue(reinf.bends.angle)}°{isValidValue(reinf.bends.leg_length) ? ` רגל: ${cleanValue(reinf.bends.leg_length)}` : ""}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Mesh */}
          {reinf.mesh && (isValidValue(reinf.mesh.direction_x) || isValidValue(reinf.mesh.direction_y)) && (
            <div>
              <h4 className="text-[11px] font-semibold text-slate-500 mb-1.5">רשת</h4>
              <div className="grid grid-cols-2 gap-2">
                {isValidValue(reinf.mesh.direction_x) && <div className="bg-[#111827] px-2.5 py-2 rounded border border-[#1e293b]"><span className="text-[10px] text-slate-500">כיוון X</span><span className="text-xs font-semibold text-slate-200 block eng-mono">{cleanValue(reinf.mesh.direction_x)}</span></div>}
                {isValidValue(reinf.mesh.direction_y) && <div className="bg-[#111827] px-2.5 py-2 rounded border border-[#1e293b]"><span className="text-[10px] text-slate-500">כיוון Y</span><span className="text-xs font-semibold text-slate-200 block eng-mono">{cleanValue(reinf.mesh.direction_y)}</span></div>}
              </div>
            </div>
          )}

          {isValidValue(element.grid_location) && (
            <div className="text-xs text-slate-500">מיקום על צירים: <span className="font-semibold text-slate-300 eng-mono">{cleanValue(element.grid_location)}</span></div>
          )}

          {isValidValue(element.notes) && (
            <p className="text-xs text-amber-300/80 bg-amber-500/10 p-2.5 rounded border border-amber-500/20">{cleanValue(element.notes)}</p>
          )}

          {/* Edit actions */}
          <div className="flex gap-2 pt-1">
            {editing ? (
              <>
                <Button size="sm" onClick={handleSaveCorrection} className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1 rounded"><Check className="w-3 h-3" />שמור תיקון</Button>
                <Button size="sm" variant="outline" onClick={() => { setEditing(false); setCorrections({}); }} className="h-8 text-xs gap-1 rounded border-[#1e293b] text-slate-400 hover:bg-white/5"><X className="w-3 h-3" />ביטול</Button>
              </>
            ) : (
              <Button size="sm" variant="outline" onClick={() => setEditing(true)} className="h-8 text-xs gap-1 rounded border-[#1e293b] text-slate-400 hover:text-amber-400 hover:border-amber-500/30 hover:bg-amber-500/5"><Pencil className="w-3 h-3" />תקן מידות</Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
