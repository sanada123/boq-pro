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
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 sm:p-6">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-1">
          סקירת קריאת התכנית
        </h2>
        <p className="text-sm text-slate-500 mb-5">
          בדוק שהמערכת זיהתה נכון את כל האלמנטים. תקן מה שצריך ואשר.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { val: elements.length, label: "אלמנטים" },
            { val: sectionsCuts.length, label: "חתכים" },
            { val: reinfSchedule.length, label: "פריטי זיון" },
            { val: unclearCount, label: "לא ברורים", warn: unclearCount > 0 },
          ].map((s, i) => (
            <div key={i} className={`rounded-xl p-3 text-center border ${s.warn ? "bg-amber-50 border-amber-200" : "bg-slate-50 border-slate-200"}`}>
              <span className={`text-2xl font-bold ${s.warn ? "text-amber-600" : "text-slate-800"}`}>{s.val}</span>
              <span className="text-xs text-slate-500 block mt-0.5">{s.label}</span>
            </div>
          ))}
        </div>

        {planReading.plan_type && (
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge className="bg-blue-600 text-white">{planReading.plan_type}</Badge>
            {planReading.scale && <Badge variant="outline">{planReading.scale}</Badge>}
            {planReading.title_info?.designer && <Badge variant="outline">מתכנן: {planReading.title_info.designer}</Badge>}
          </div>
        )}

        {patterns.length > 0 && (
          <div className="mt-3 bg-blue-50 rounded-lg p-3 border border-blue-100">
            <span className="text-xs font-semibold text-blue-700">דפוסים שזוהו:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {patterns.map((p, i) => (
                <Badge key={i} className="bg-blue-100 text-blue-700 text-[10px]">{p}</Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Data Quality */}
      <ReviewSummaryBar elements={elements} />

      {/* Guide */}
      <div className="bg-blue-50 rounded-xl border border-blue-100 p-3.5 flex items-center gap-3">
        <Info className="w-5 h-5 text-blue-500 shrink-0" />
        <div>
          <p className="text-sm font-medium text-slate-700">סקור את האלמנטים למטה</p>
          <p className="text-xs text-slate-500 mt-0.5">
            אלמנטים עם <span className="text-amber-600 font-semibold">פס צהוב</span> = חלקי, <span className="text-red-500 font-semibold">פס אדום</span> = חסר.
            לחץ על אלמנט → "תקן מידות" להשלמה.
          </p>
        </div>
      </div>

      {/* Legend */}
      <LegendDisplay legend={legend} />

      {/* Elements by category */}
      {Object.entries(categoryGroups).map(([cat, catElements]) => (
        <div key={cat} className="space-y-2">
          <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2 px-1">
            {categoryLabels[cat] || cat}
            <Badge variant="outline" className="text-[10px]">{catElements.length}</Badge>
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
        <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden">
          <button
            onClick={() => setShowSections(!showSections)}
            className="w-full flex items-center justify-between p-4 hover:bg-slate-50"
          >
            <span className="text-sm font-bold text-slate-700">חתכים ({sectionsCuts.length})</span>
            {showSections ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronLeft className="w-4 h-4 text-slate-400" />}
          </button>
          {showSections && (
            <div className="border-t border-slate-100 p-3 space-y-2">
              {sectionsCuts.map((sec, i) => (
                <div key={i} className="bg-slate-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className="bg-purple-100 text-purple-700 text-[10px]">{sec.section_id}</Badge>
                  </div>
                  <p className="text-xs text-slate-600">{sec.description}</p>
                  {sec.dimensions_found && <p className="text-[10px] text-slate-400 mt-0.5">מידות: {sec.dimensions_found}</p>}
                  {sec.reinforcement_found && <p className="text-[10px] text-slate-400">זיון: {sec.reinforcement_found}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Reinforcement Schedule */}
      {reinfSchedule.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden">
          <button
            onClick={() => setShowSchedule(!showSchedule)}
            className="w-full flex items-center justify-between p-4 hover:bg-slate-50"
          >
            <span className="text-sm font-bold text-slate-700">טבלת זיון ({reinfSchedule.length} פריטים)</span>
            {showSchedule ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronLeft className="w-4 h-4 text-slate-400" />}
          </button>
          {showSchedule && (
            <div className="border-t border-slate-100 overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b">
                    <th className="text-right px-3 py-2 font-semibold">סימון</th>
                    <th className="text-right px-3 py-2 font-semibold">Ø</th>
                    <th className="text-right px-3 py-2 font-semibold">אורך</th>
                    <th className="text-right px-3 py-2 font-semibold">כמות</th>
                    <th className="text-right px-3 py-2 font-semibold">צורה</th>
                    <th className="text-right px-3 py-2 font-semibold">אלמנט</th>
                  </tr>
                </thead>
                <tbody>
                  {reinfSchedule.map((bar, i) => (
                    <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/50">
                      <td className="px-3 py-2 font-mono text-slate-700">{bar.bar_mark}</td>
                      <td className="px-3 py-2">{bar.diameter}</td>
                      <td className="px-3 py-2">{bar.length}</td>
                      <td className="px-3 py-2">{bar.quantity}</td>
                      <td className="px-3 py-2">{bar.shape || "—"}</td>
                      <td className="px-3 py-2">{bar.element_ref || "—"}</td>
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
        <div className="bg-amber-50 rounded-xl border border-amber-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-bold text-amber-800">פריטים לא ברורים</span>
          </div>
          <ul className="space-y-1">
            {planReading.unclear_items.map((item, i) => (
              <li key={i} className="text-xs text-amber-700 flex items-start gap-1.5">
                <span className="text-amber-400 mt-0.5">•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {planReading.confidence_notes && (
        <p className="text-xs text-slate-400 px-1">{planReading.confidence_notes}</p>
      )}

      {/* Actions */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold text-slate-800">סיימת לבדוק?</p>
            <p className="text-xs text-slate-500 mt-0.5">
              {Object.keys(corrections).length > 0
                ? `✏️ ${Object.keys(corrections).length} תיקונים ישמרו ויילקחו בחשבון`
                : "אם הכל נראה טוב — אשר כדי להמשיך לחישוב כמויות ותמחור"}
            </p>
          </div>
          <Button
            onClick={handleApprove}
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 text-white h-11 px-6 text-sm font-semibold gap-2 rounded-xl"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            {Object.keys(corrections).length > 0 ? "שמור תיקונים והמשך" : "אשר והמשך לחישוב"}
          </Button>
        </div>
        <p className="text-[11px] text-slate-400 text-center mt-3">
          גם אם יש נתונים חסרים — המערכת תנסה לחשב כמויות על סמך מה שזמין. תוכל לתקן אח"כ בטבלת הכמויות.
        </p>
      </div>
    </motion.div>
  );
}