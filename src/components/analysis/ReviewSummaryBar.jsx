import React from "react";
import { CheckCircle2, AlertTriangle, XCircle, Info } from "lucide-react";

/**
 * Element types that ARE reinforcement data — they should never be flagged
 * for "missing reinforcement" or "missing concrete grade" because they're
 * steel bar details extracted from the reinforcement schedule, not concrete elements.
 */
const REINF_TYPE_PATTERNS = ["פרט זיון", "reinforcement", "rebar", "bar_detail"];

function isReinforcementDetail(el) {
  const t = (el.type || "").toLowerCase();
  const id = (el.id || "").toLowerCase();
  return REINF_TYPE_PATTERNS.some(p => t.includes(p) || id.includes(p));
}

/**
 * Smart element analysis — understands the CONTEXT of each element type.
 * A reinforcement detail is steel, not concrete — don't ask for concrete grade.
 * A raft foundation with separate reinforcement details doesn't need nested rebar data.
 */
function analyzeElement(el, contextHasReinfDetails = false) {
  const issues = [];
  const dims = el.dimensions || {};
  const reinf = el.reinforcement || {};
  const isValid = (v) => v != null && v !== "null" && v !== "" && v !== 0 && v !== "0";

  // Dimensions — every element needs some dimensions
  const hasDims = Object.entries(dims).some(([k, v]) => k !== "unit" && isValid(v));
  if (!hasDims) issues.push("חסרות מידות");

  const isReinf = isReinforcementDetail(el);

  // Reinforcement — skip for reinforcement details (they ARE the reinforcement)
  // Also skip if reinforcement details exist as separate elements in this analysis
  if (!isReinf) {
    const hasReinf = isValid(reinf.raw_text) || isValid(reinf.main_bars?.top)
      || isValid(reinf.main_bars?.bottom) || isValid(reinf.stirrups?.diameter);
    if (!hasReinf && !contextHasReinfDetails) {
      issues.push("חסר זיון");
    }
  }

  // Concrete grade — only for concrete structural elements, not steel reinforcement
  if (!isReinf) {
    if (!isValid(el.material?.concrete_grade)) issues.push("חסר סוג בטון");
  }

  return issues;
}

export function getElementStatus(el, contextHasReinfDetails = false) {
  const issues = analyzeElement(el, contextHasReinfDetails);
  if (issues.length === 0) return { status: "ok", issues };
  if (issues.length <= 1) return { status: "partial", issues };
  return { status: "missing", issues };
}

function MissingElementsList({ elements, hasReinfDetails }) {
  const problemElements = elements
    .map((el, i) => ({ el, i, ...getElementStatus(el, hasReinfDetails) }))
    .filter(e => e.status !== "ok");

  if (problemElements.length === 0) return null;

  return (
    <div className="bg-slate-50 rounded border border-slate-200 p-3">
      <p className="text-xs font-semibold text-slate-400 mb-2">אלמנטים שדורשים תשומת לב:</p>
      <div className="space-y-1.5">
        {problemElements.map(({ el, i, issues, status }) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <span className={`w-2 h-2 rounded-full shrink-0 ${status === "missing" ? "bg-rose-400" : "bg-amber-400"}`} />
            <span className="font-semibold text-slate-700">{el.id || `אלמנט ${i + 1}`}</span>
            <span className="text-slate-600">—</span>
            <span className="text-slate-500">{issues.join(", ")}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ReviewSummaryBar({ elements }) {
  // Detect if this analysis includes separate reinforcement detail elements
  const hasReinfDetails = elements.some(el => isReinforcementDetail(el));

  let okCount = 0, partialCount = 0, missingCount = 0;

  elements.forEach(el => {
    const { status } = getElementStatus(el, hasReinfDetails);
    if (status === "ok") okCount++;
    else if (status === "partial") partialCount++;
    else missingCount++;
  });

  const total = elements.length;
  const okPct = total ? Math.round((okCount / total) * 100) : 0;

  return (
    <div className="eng-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-800">איכות חילוץ נתונים</h3>
          <p className="text-xs text-slate-500">כמה מהנתונים חולצו בהצלחה</p>
        </div>
        <div className="text-xl font-bold text-amber-600 eng-number">{okPct}%</div>
      </div>

      <div className="w-full h-2.5 bg-slate-100 rounded-full flex overflow-hidden">
        {okCount > 0 && <div className="bg-emerald-500 h-full transition-all rounded-r-full" style={{ width: `${(okCount / total) * 100}%` }} />}
        {partialCount > 0 && <div className="bg-amber-400 h-full transition-all" style={{ width: `${(partialCount / total) * 100}%` }} />}
        {missingCount > 0 && <div className="bg-rose-400 h-full transition-all rounded-l-full" style={{ width: `${(missingCount / total) * 100}%` }} />}
      </div>

      <div className="flex gap-5 text-xs">
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span className="text-slate-400"><strong className="text-emerald-600 eng-number">{okCount}</strong> תקין</span>
        </div>
        <div className="flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
          <span className="text-slate-400"><strong className="text-amber-600 eng-number">{partialCount}</strong> חלקי</span>
        </div>
        <div className="flex items-center gap-1.5">
          <XCircle className="w-3.5 h-3.5 text-rose-600" />
          <span className="text-slate-400"><strong className="text-rose-600 eng-number">{missingCount}</strong> חסר</span>
        </div>
      </div>

      {(partialCount > 0 || missingCount > 0) && (
        <div className="space-y-2">
          <div className="flex items-start gap-2.5 bg-amber-50 rounded border border-amber-200 p-3">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-600/80 leading-relaxed">
              <p className="font-semibold mb-0.5 text-amber-600">מה צריך להשלים?</p>
              <p>לחץ על כל אלמנט מסומן בצהוב/אדום כדי לראות בדיוק מה חסר.</p>
              <p className="mt-0.5">בתוך כל אלמנט תמצא הסבר + כפתור "השלם נתונים חסרים".</p>
            </div>
          </div>
          <MissingElementsList elements={elements} hasReinfDetails={hasReinfDetails} />
        </div>
      )}
    </div>
  );
}
