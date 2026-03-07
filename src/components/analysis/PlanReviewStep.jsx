import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertTriangle, Loader2, ChevronDown, ChevronLeft, ArrowDown, Info } from "lucide-react";
import { motion } from "framer-motion";
import ElementReviewCard from "./ElementReviewCard";
import LegendDisplay from "./LegendDisplay";
import ReviewSummaryBar from "./ReviewSummaryBar";

export default function PlanReviewStep({ planReading, onApprove, onCorrections, isSubmitting }) {
  const [corrections, setCorrections] = useState({});
  const [showSections, setShowSections] = useState(true);
  const [showSchedule, setShowSchedule] = useState(false);

  const elements = planReading.elements || [];
  const unclearCount = (planReading.unclear_items || []).length;
  const legend = planReading.legend;
  const sectionsCuts = planReading.sections_cuts || [];
  const reinfSchedule = planReading.reinforcement_schedule || [];
  const patterns = planReading.detected_patterns || [];

  const handleElementCorrect = (index, elementCorrections) => {
    setCorrections(prev => ({
      ...prev,
      [index]: { ...prev[index], ...elementCorrections }
    }));
  };

  const handleApprove = () => {
    const corrList = Object.entries(corrections).map(([idx, corr]) => ({
      element_index: Number(idx),
      element_id: elements[Number(idx)]?.id || `element_${idx}`,
      corrections: corr,
    }));
    if (corrList.length > 0) {
      onCorrections(corrList);
    } else {
      onApprove();
    }
  };

  const categoryGroups = elements.reduce((acc, el) => {
    const cat = el.category || "other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(el);
    return acc;
  }, {});

  const categoryLabels = {
    foundations: "יסודות",
    skeleton: "שלד (עמודים, קורות, תקרות)",
    walls: "קירות",
    slabs: "תקרות/פלטות",
    stairs: "מדרגות",
    other: "אחר",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Header */}
      <div className="eng-card p-5 sm:p-6">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-100 mb-1">
          סקירת קריאת התכנית
        </h2>
        <p className="text-sm text-slate-500 mb-5">
          בדוק שהמערכת זיהתה נכון את כל האלמנטים. תקן מה שצריך ואשר.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { val: elements.length, label: "אלמנטים", color: "text-cyan-400" },
            { val: sectionsCuts.length, label: "חתכים", color: "text-violet-400" },
            { val: reinfSchedule.length, label: "פריטי זיון", color: "text-emerald-400" },
            { val: unclearCount, label: "לא ברורים", warn: unclearCount > 0, color: "text-amber-400" },
          ].map((s, i) => (
            <div key={i} className={`rounded p-3 text-center border ${s.warn ? "bg-amber-500/10 border-amber-500/25" : "bg-[#0d1320] border-[#1e293b]"}`}>
              <span className={`text-2xl font-bold eng-number ${s.warn ? "text-amber-400" : s.color}`}>{s.val}</span>
              <span className="text-xs text-slate-500 block mt-0.5">{s.label}</span>
            </div>
          ))}
        </div>

        {planReading.plan_type && (
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="inline-flex items-center text-[11px] font-semibold px-2.5 py-1 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30">{planReading.plan_type}</span>
            {planReading.scale && <span className="inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded border border-[#1e293b] text-slate-400 eng-mono">{planReading.scale}</span>}
            {planReading.title_info?.designer && <span className="inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded border border-[#1e293b] text-slate-400">מתכנן: {planReading.title_info.designer}</span>}
          </div>
        )}

        {patterns.length > 0 && (
          <div className="mt-3 bg-cyan-500/10 rounded p-3 border border-cyan-500/20">
            <span className="text-xs font-semibold text-cyan-400">דפוסים שזוהו:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {patterns.map((p, i) => (
                <span key={i} className="inline-flex items-center text-[10px] font-medium px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/25">{p}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Data Quality */}
      <ReviewSummaryBar elements={elements} />

      {/* Guide */}
      <div className="bg-cyan-500/10 rounded border border-cyan-500/20 p-3.5 flex items-center gap-3">
        <Info className="w-5 h-5 text-cyan-400 shrink-0" />
        <div>
          <p className="text-sm font-medium text-slate-200">סקור את האלמנטים למטה</p>
          <p className="text-xs text-slate-500 mt-0.5">
            אלמנטים עם <span className="text-amber-400 font-semibold">פס צהוב</span> = חלקי, <span className="text-rose-400 font-semibold">פס אדום</span> = חסר.
            לחץ על אלמנט → "תקן מידות" להשלמה.
          </p>
        </div>
      </div>

      {/* Legend */}
      <LegendDisplay legend={legend} />

      {/* Elements by category */}
      {Object.entries(categoryGroups).map(([cat, catElements]) => (
        <div key={cat} className="space-y-2">
          <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2 px-1">
            {categoryLabels[cat] || cat}
            <span className="inline-flex items-center text-[10px] font-medium px-1.5 py-0.5 rounded border border-[#1e293b] text-slate-500 bg-[#111827] eng-number">{catElements.length}</span>
          </h3>
          {catElements.map((el) => {
            const globalIndex = elements.indexOf(el);
            return (
              <ElementReviewCard
                key={globalIndex}
                element={el}
                index={globalIndex}
                onCorrect={handleElementCorrect}
              />
            );
          })}
        </div>
      ))}

      {/* Sections */}
      {sectionsCuts.length > 0 && (
        <div className="eng-card overflow-hidden">
          <button
            onClick={() => setShowSections(!showSections)}
            className="w-full flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors"
          >
            <span className="text-sm font-bold text-slate-300">חתכים ({sectionsCuts.length})</span>
            {showSections ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronLeft className="w-4 h-4 text-slate-500" />}
          </button>
          {showSections && (
            <div className="border-t border-[#1e293b] p-3 space-y-2">
              {sectionsCuts.map((sec, i) => (
                <div key={i} className="bg-[#0d1320] rounded border border-[#1e293b] p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="inline-flex items-center text-[10px] font-medium px-1.5 py-0.5 rounded bg-violet-500/15 text-violet-400 border border-violet-500/30">{sec.section_id}</span>
                  </div>
                  <p className="text-xs text-slate-400">{sec.description}</p>
                  {sec.dimensions_found && <p className="text-[10px] text-slate-500 mt-0.5 eng-mono">מידות: {sec.dimensions_found}</p>}
                  {sec.reinforcement_found && <p className="text-[10px] text-slate-500 eng-mono">זיון: {sec.reinforcement_found}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Reinforcement Schedule */}
      {reinfSchedule.length > 0 && (
        <div className="eng-card overflow-hidden">
          <button
            onClick={() => setShowSchedule(!showSchedule)}
            className="w-full flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors"
          >
            <span className="text-sm font-bold text-slate-300">טבלת זיון ({reinfSchedule.length} פריטים)</span>
            {showSchedule ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronLeft className="w-4 h-4 text-slate-500" />}
          </button>
          {showSchedule && (
            <div className="border-t border-[#1e293b] overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-[#0d1320] border-b border-[#1e293b]">
                    <th className="text-right px-3 py-2 font-semibold text-slate-400">סימון</th>
                    <th className="text-right px-3 py-2 font-semibold text-slate-400">Ø</th>
                    <th className="text-right px-3 py-2 font-semibold text-slate-400">אורך</th>
                    <th className="text-right px-3 py-2 font-semibold text-slate-400">כמות</th>
                    <th className="text-right px-3 py-2 font-semibold text-slate-400">צורה</th>
                    <th className="text-right px-3 py-2 font-semibold text-slate-400">אלמנט</th>
                  </tr>
                </thead>
                <tbody>
                  {reinfSchedule.map((bar, i) => (
                    <tr key={i} className="border-b border-[#1e293b]/50 hover:bg-white/[0.02]">
                      <td className="px-3 py-2 eng-mono text-amber-400">{bar.bar_mark}</td>
                      <td className="px-3 py-2 eng-number text-slate-300">{bar.diameter}</td>
                      <td className="px-3 py-2 eng-number text-slate-300">{bar.length}</td>
                      <td className="px-3 py-2 eng-number text-slate-300">{bar.quantity}</td>
                      <td className="px-3 py-2 text-slate-400">{bar.shape || "—"}</td>
                      <td className="px-3 py-2 text-slate-400">{bar.element_ref || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Unclear */}
      {unclearCount > 0 && (
        <div className="bg-amber-500/10 rounded border border-amber-500/25 p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-bold text-amber-300">פריטים לא ברורים</span>
          </div>
          <ul className="space-y-1">
            {planReading.unclear_items.map((item, i) => (
              <li key={i} className="text-xs text-amber-300/70 flex items-start gap-1.5">
                <span className="text-amber-500/50 mt-0.5">•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {planReading.confidence_notes && (
        <p className="text-xs text-slate-500 px-1">{planReading.confidence_notes}</p>
      )}

      {/* Actions */}
      <div className="eng-card p-5">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold text-slate-200">סיימת לבדוק?</p>
            <p className="text-xs text-slate-500 mt-0.5">
              {Object.keys(corrections).length > 0
                ? `${Object.keys(corrections).length} תיקונים ישמרו ויילקחו בחשבון`
                : "אם הכל נראה טוב — אשר כדי להמשיך לחישוב כמויות ותמחור"}
            </p>
          </div>
          <button
            onClick={handleApprove}
            disabled={isSubmitting}
            className="btn-eng-primary h-11 px-6 text-sm font-semibold flex items-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            {Object.keys(corrections).length > 0 ? "שמור תיקונים והמשך" : "אשר והמשך לחישוב"}
          </button>
        </div>
        <p className="text-[11px] text-slate-500 text-center mt-3">
          גם אם יש נתונים חסרים — המערכת תנסה לחשב כמויות על סמך מה שזמין. תוכל לתקן אח"כ בטבלת הכמויות.
        </p>
      </div>
    </motion.div>
  );
}
