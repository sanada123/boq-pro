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
  foundations: "bg-amber-50 text-amber-700",
  skeleton: "bg-blue-50 text-blue-700",
  walls: "bg-emerald-50 text-emerald-700",
  slabs: "bg-purple-50 text-purple-700",
  default: "bg-slate-50 text-slate-700",
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
  const statusBorder = elStatus === "ok" ? "border-r-green-400" : elStatus === "partial" ? "border-r-amber-400" : "border-r-red-400";
  const StatusIcon = elStatus === "ok" ? CheckCircle2 : elStatus === "partial" ? AlertTriangle : XCircle;
  const statusIconColor = elStatus === "ok" ? "text-green-500" : elStatus === "partial" ? "text-amber-500" : "text-red-500";

  return (
    <div className={`bg-white rounded-xl border border-slate-200/80 overflow-hidden border-r-4 ${statusBorder}`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-3.5 hover:bg-slate-50/50 transition-colors text-right"
      >
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${colorClass}`}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-slate-800">{element.id || `אלמנט ${index + 1}`}</span>
            <Badge variant="outline" className="text-[10px] rounded-md">{element.type}</Badge>
            {element.count > 1 && <Badge className="bg-blue-50 text-blue-700 text-[10px] rounded-md">×{element.count}</Badge>}
            {element.is_typical && <Badge className="bg-green-50 text-green-700 text-[10px] rounded-md">טיפוסי</Badge>}
          </div>
          <div className="flex flex-wrap gap-x-2 gap-y-0.5 mt-1">
            {dimEntries.slice(0, 3).map(([k, v]) => (
              <span key={k} className="text-[11px] text-slate-400">{dimLabels[k] || k}: {v}{dims.unit || ""}</span>
            ))}
            {isValidValue(element.material?.concrete_grade) && <span className="text-[11px] text-slate-400">בטון: {cleanValue(element.material.concrete_grade)}</span>}
          </div>
          {elIssues.length > 0 && (
            <div className="flex items-center gap-1 mt-1">
              <StatusIcon className={`w-3 h-3 ${statusIconColor}`} />
              <span className={`text-[11px] font-medium ${statusIconColor}`}>{elIssues.join(" · ")}</span>
            </div>
          )}
        </div>
        {expanded ? <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" /> : <ChevronLeft className="w-4 h-4 text-slate-400 shrink-0" />}
      </button>

      {expanded && (
        <div className="border-t border-slate-100 p-4 space-y-3 bg-slate-50/30">
          {/* Missing data alert */}
          {elIssues.length > 0 && (
            <div className={`p-3 rounded-lg border ${elStatus === "missing" ? "bg-red-50 border-red-200" : "bg-amber-50 border-amber-200"}`}>
              <p className={`text-xs font-semibold mb-1.5 ${elStatus === "missing" ? "text-red-700" : "text-amber-700"}`}>
                נתונים חסרים באלמנט זה:
              </p>
              <ul className="space-y-1">
                {elIssues.map((issue, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs">
                    <span className={`mt-0.5 ${elStatus === "missing" ? "text-red-300" : "text-amber-300"}`}>●</span>
                    <div className={elStatus === "missing" ? "text-red-700" : "text-amber-700"}>
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
                className={`h-7 text-[11px] gap-1 mt-2 rounded-lg ${elStatus === "missing" ? "border-red-300 text-red-700 hover:bg-red-100" : "border-amber-300 text-amber-700 hover:bg-amber-100"}`}
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
                  <div key={k} className="bg-white px-2.5 py-2 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-400 block">{dimLabels[k] || k}</span>
                    {editing ? (
                      <Input
                        type="number"
                        defaultValue={v}
                        onChange={(e) => setCorrections(prev => ({ ...prev, [`dimensions.${k}`]: Number(e.target.value) }))}
                        className="h-6 text-xs mt-0.5 p-1"
                      />
                    ) : (
                      <span className="text-xs font-semibold text-slate-800">{formatDim(v, dims.unit || 'ס"מ')}</span>
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
              <p className="text-xs text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200 font-mono leading-relaxed">
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
                  <div className="bg-white px-2.5 py-2 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-400">עליון</span>
                    <span className="text-xs font-semibold text-slate-800 block">{cleanValue(reinf.main_bars.top)}</span>
                  </div>
                )}
                {isValidValue(reinf.main_bars?.bottom) && (
                  <div className="bg-white px-2.5 py-2 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-400">תחתון</span>
                    <span className="text-xs font-semibold text-slate-800 block">{cleanValue(reinf.main_bars.bottom)}</span>
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
                  <div className="bg-white px-2.5 py-2 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-400">קוטר</span>
                    <span className="text-xs font-semibold block">{cleanValue(reinf.stirrups.diameter)}</span>
                  </div>
                )}
                {isValidValue(reinf.stirrups?.spacing) && (
                  <div className="bg-white px-2.5 py-2 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-400">ריווח</span>
                    <span className="text-xs font-semibold block">{cleanValue(reinf.stirrups.spacing)} ס"מ</span>
                  </div>
                )}
                {isValidValue(reinf.stirrups?.spacing_zones) && (
                  <div className="bg-white px-2.5 py-2 rounded-lg border border-slate-200 col-span-3">
                    <span className="text-[10px] text-slate-400">אזורים</span>
                    <span className="text-xs font-semibold block">{cleanValue(reinf.stirrups.spacing_zones)}</span>
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
                  <div className="bg-white px-2.5 py-2 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-400">חפיפה</span>
                    <span className="text-xs font-semibold block">{cleanValue(reinf.lap_splice.length)} ס"מ{isValidValue(reinf.lap_splice.location) ? ` (${cleanValue(reinf.lap_splice.location)})` : ""}</span>
                  </div>
                )}
                {isValidValue(reinf.bends?.angle) && (
                  <div className="bg-white px-2.5 py-2 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-400">כיפוף</span>
                    <span className="text-xs font-semibold block">{cleanValue(reinf.bends.angle)}°{isValidValue(reinf.bends.leg_length) ? ` רגל: ${cleanValue(reinf.bends.leg_length)}` : ""}</span>
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
                {isValidValue(reinf.mesh.direction_x) && <div className="bg-white px-2.5 py-2 rounded-lg border border-slate-200"><span className="text-[10px] text-slate-400">כיוון X</span><span className="text-xs font-semibold block">{cleanValue(reinf.mesh.direction_x)}</span></div>}
                {isValidValue(reinf.mesh.direction_y) && <div className="bg-white px-2.5 py-2 rounded-lg border border-slate-200"><span className="text-[10px] text-slate-400">כיוון Y</span><span className="text-xs font-semibold block">{cleanValue(reinf.mesh.direction_y)}</span></div>}
              </div>
            </div>
          )}

          {isValidValue(element.grid_location) && (
            <div className="text-xs text-slate-400">מיקום על צירים: <span className="font-semibold text-slate-600">{cleanValue(element.grid_location)}</span></div>
          )}

          {isValidValue(element.notes) && (
            <p className="text-xs text-slate-600 bg-amber-50 p-2.5 rounded-lg border border-amber-200">📝 {cleanValue(element.notes)}</p>
          )}

          {/* Edit actions */}
          <div className="flex gap-2 pt-1">
            {editing ? (
              <>
                <Button size="sm" onClick={handleSaveCorrection} className="h-8 text-xs bg-green-600 hover:bg-green-700 gap-1 rounded-lg"><Check className="w-3 h-3" />שמור תיקון</Button>
                <Button size="sm" variant="outline" onClick={() => { setEditing(false); setCorrections({}); }} className="h-8 text-xs gap-1 rounded-lg"><X className="w-3 h-3" />ביטול</Button>
              </>
            ) : (
              <Button size="sm" variant="outline" onClick={() => setEditing(true)} className="h-8 text-xs gap-1 rounded-lg"><Pencil className="w-3 h-3" />תקן מידות</Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}