import React from "react";
import { Loader2, CheckCircle2, FileSearch, ScanSearch, Calculator, DollarSign, Table2, ClipboardCheck, Sheet, BookOpen } from "lucide-react";
import { motion } from "framer-motion";

const STEPS = [
  { key: "upload", label: "העלאת קובץ", icon: FileSearch },
  { key: "tables", label: "חילוץ טבלאות — זיון, דלתות, חלונות", icon: Sheet },
  { key: "legend", label: "זיהוי מקרא וסוג תכנית", icon: BookOpen },
  { key: "reading", label: "קריאת אלמנטים — מידות, זיון, פרטים", icon: ScanSearch },
  { key: "review", label: "סקירה ואישור", icon: ClipboardCheck },
  { key: "quantities", label: "חישוב כמויות", icon: Calculator },
  { key: "pricing", label: "תמחור", icon: DollarSign },
  { key: "saving", label: "שמירה ולמידה", icon: Table2 },
];

export default function AnalysisProgress({ currentStep, pass1Summary }) {
  const currentIndex = STEPS.findIndex((s) => s.key === currentStep);

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm">
      <div className="text-center mb-6">
        <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-3">
          <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
        </div>
        <h3 className="text-base font-bold text-slate-800">מנתח תכנית...</h3>
        <p className="text-xs text-slate-400 mt-1">הניתוח כולל מספר שלבים — אנא המתן</p>
      </div>

      <div className="space-y-2">
        {STEPS.map((step, idx) => {
          const Icon = step.icon;
          const isActive = idx === currentIndex;
          const isDone = idx < currentIndex;

          return (
            <motion.div
              key={step.key}
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.08 }}
              className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                isActive
                  ? "bg-blue-50 border border-blue-200"
                  : isDone
                  ? "bg-green-50/50 border border-green-200"
                  : "bg-slate-50/50 border border-transparent opacity-40"
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                isActive ? "bg-blue-600 text-white" : isDone ? "bg-green-500 text-white" : "bg-slate-100 text-slate-400"
              }`}>
                {isActive ? <Loader2 className="w-4 h-4 animate-spin" /> : isDone ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
              </div>
              <span className={`font-medium text-sm ${isActive ? "text-slate-800" : isDone ? "text-green-700" : "text-slate-400"}`}>
                {step.label}
              </span>
            </motion.div>
          );
        })}
      </div>

      {pass1Summary && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 bg-slate-50 rounded-lg p-3 border border-slate-200"
        >
          <h4 className="text-xs font-bold text-slate-600 mb-2">סיכום קריאה</h4>
          <div className="space-y-1 text-xs text-slate-600">
            <p>סוג: <span className="font-semibold">{pass1Summary.plan_type}</span></p>
            <p>אלמנטים: <span className="font-semibold">{pass1Summary.element_count}</span></p>
            {pass1Summary.unclear_count > 0 && (
              <p className="text-amber-600">⚠ לא ברורים: <span className="font-semibold">{pass1Summary.unclear_count}</span></p>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}