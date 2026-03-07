import React, { useState, useEffect } from "react";
import {
  FileSearch,
  ScanSearch,
  Calculator,
  DollarSign,
  Sheet,
  BookOpen,
  Hexagon,
  ClipboardCheck,
  Table2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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

/* ── Animated spinning dashes icon (from 21st.dev pattern) ── */
function SpinningDashes({ color = "#f59e0b" }) {
  const [activeDash, setActiveDash] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveDash((prev) => (prev + 1) % 8);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <svg width="18" height="18" viewBox="0 0 18 18" className="drop-shadow-sm">
      {Array.from({ length: 8 }).map((_, index) => {
        const angle = index * 45 - 90;
        const radian = (angle * Math.PI) / 180;
        const radius = 7;
        const dashLen = 2;
        const x1 = 9 + (radius - dashLen / 2) * Math.cos(radian);
        const y1 = 9 + (radius - dashLen / 2) * Math.sin(radian);
        const x2 = 9 + (radius + dashLen / 2) * Math.cos(radian);
        const y2 = 9 + (radius + dashLen / 2) * Math.sin(radian);
        const isActive = index === activeDash;
        return (
          <line
            key={index}
            x1={x1} y1={y1} x2={x2} y2={y2}
            stroke={isActive ? color : "#334155"}
            strokeWidth="2"
            strokeLinecap="round"
          />
        );
      })}
    </svg>
  );
}

/* ── Animated checkmark icon ── */
function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" className="drop-shadow-sm">
      <circle cx="9" cy="9" r="9" fill="#10b981" />
      <motion.path
        d="M5.5 9l2.5 2.5 4.5-5"
        stroke="white"
        strokeWidth="1.8"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      />
    </svg>
  );
}

/* ── Pending dot icon ── */
function PendingIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18">
      <circle cx="9" cy="9" r="5" fill="none" stroke="#334155" strokeWidth="1.5" />
      <circle cx="9" cy="9" r="2" fill="#334155" />
    </svg>
  );
}

export default function AnalysisProgress({ currentStep, pass1Summary }) {
  const currentIndex = STEPS.findIndex((s) => s.key === currentStep);
  const progressPct = Math.round(((currentIndex + 1) / STEPS.length) * 100);
  const [hoveredStep, setHoveredStep] = useState(null);

  return (
    <div className="w-full mx-auto">
      <div className="eng-card overflow-hidden">
        {/* ── Top progress bar ── */}
        <div className="h-[3px] bg-[#1e293b] relative overflow-hidden">
          <motion.div
            className="absolute top-0 right-0 h-full bg-gradient-to-l from-amber-500 via-amber-400 to-amber-600"
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
          {/* shimmer effect */}
          <motion.div
            className="absolute top-0 h-full w-20 bg-gradient-to-l from-transparent via-white/10 to-transparent"
            animate={{ right: ["-80px", "100%"] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
          />
        </div>

        <div className="p-5 sm:p-6">
          {/* ── Header ── */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10">
                <motion.div
                  className="absolute inset-0 border border-amber-500/20 rounded-lg"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                />
                <div className="absolute inset-[3px] bg-amber-500/10 border border-amber-500/25 rounded-md flex items-center justify-center">
                  <Hexagon className="w-4 h-4 text-amber-400" />
                </div>
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-100">מנתח תכנית...</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  שלב {currentIndex + 1} מתוך {STEPS.length}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 bg-[#0d1320] border border-[#1e293b] rounded-md px-3 py-1.5">
              <SpinningDashes />
              <span
                className="text-xs font-bold text-amber-400"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                {progressPct}%
              </span>
            </div>
          </div>

          {/* ── Steps list with card-status-list pattern ── */}
          <motion.div
            className="space-y-2"
            variants={{
              visible: {
                transition: { staggerChildren: 0.07, delayChildren: 0.1 },
              },
            }}
            initial="hidden"
            animate="visible"
          >
            <AnimatePresence>
              {STEPS.map((step, idx) => {
                const Icon = step.icon;
                const isActive = idx === currentIndex;
                const isDone = idx < currentIndex;
                const isPending = idx > currentIndex;

                return (
                  <motion.div
                    key={step.key}
                    layout
                    layoutId={step.key}
                    variants={{
                      hidden: { opacity: 0, y: 15, scale: 0.98 },
                      visible: {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        transition: {
                          type: "spring",
                          stiffness: 300,
                          damping: 30,
                        },
                      },
                    }}
                    transition={{
                      layout: {
                        type: "spring",
                        stiffness: 400,
                        damping: 30,
                        duration: 0.5,
                      },
                    }}
                    className="relative"
                    onMouseEnter={() => setHoveredStep(step.key)}
                    onMouseLeave={() => setHoveredStep(null)}
                  >
                    <motion.div
                      className={`relative overflow-hidden rounded-lg border p-3.5 transition-colors ${
                        isActive
                          ? "bg-[#111827] border-amber-500/30"
                          : isDone
                          ? "bg-[#0d1320] border-emerald-500/20"
                          : "bg-[#0d1320]/50 border-[#1e293b]/50"
                      }`}
                      whileHover={
                        !isPending
                          ? {
                              y: -1,
                              transition: {
                                type: "spring",
                                stiffness: 400,
                                damping: 25,
                              },
                            }
                          : {}
                      }
                      animate={
                        isDone
                          ? {
                              scale: [1, 1.01, 1],
                              transition: {
                                duration: 0.5,
                                ease: [0.04, 0.62, 0.23, 0.98],
                                times: [0, 0.3, 1],
                              },
                            }
                          : {}
                      }
                    >
                      {/* Gradient overlay for active/done */}
                      {isActive && (
                        <div
                          className="absolute inset-0 bg-gradient-to-l from-amber-500/15 to-transparent pointer-events-none"
                          style={{
                            backgroundSize: "50% 100%",
                            backgroundPosition: "right",
                            backgroundRepeat: "no-repeat",
                          }}
                        />
                      )}
                      {isDone && hoveredStep === step.key && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0 bg-gradient-to-l from-emerald-500/8 to-transparent pointer-events-none"
                          style={{
                            backgroundSize: "50% 100%",
                            backgroundPosition: "right",
                            backgroundRepeat: "no-repeat",
                          }}
                        />
                      )}

                      <div className="relative flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {/* Status icon */}
                          <div
                            className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 transition-all ${
                              isActive
                                ? "bg-amber-500/15"
                                : isDone
                                ? "bg-emerald-500/10"
                                : "bg-[#1e293b]/50"
                            }`}
                          >
                            <AnimatePresence mode="wait">
                              <motion.div
                                key={
                                  isDone
                                    ? "done"
                                    : isActive
                                    ? "active"
                                    : "pending"
                                }
                                initial={{ scale: 0.6, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.6, opacity: 0 }}
                                transition={{
                                  type: "spring",
                                  stiffness: 400,
                                  damping: 25,
                                }}
                              >
                                {isDone ? (
                                  <CheckIcon />
                                ) : isActive ? (
                                  <SpinningDashes />
                                ) : (
                                  <PendingIcon />
                                )}
                              </motion.div>
                            </AnimatePresence>
                          </div>

                          {/* Step label */}
                          <span
                            className={`text-sm font-medium transition-colors ${
                              isActive
                                ? "text-amber-300"
                                : isDone
                                ? "text-emerald-400/80"
                                : "text-slate-600"
                            }`}
                          >
                            {step.label}
                          </span>
                        </div>

                        {/* Right side: status badge */}
                        <div className="flex items-center min-w-0 h-7">
                          <AnimatePresence mode="wait">
                            {isActive ? (
                              <motion.span
                                key="active-badge"
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                transition={{
                                  type: "spring",
                                  stiffness: 400,
                                  damping: 25,
                                }}
                                className="px-2.5 py-1 bg-amber-500/15 border border-amber-500/25 rounded text-[10px] font-bold text-amber-400 tracking-wider whitespace-nowrap"
                                style={{
                                  fontFamily: "'JetBrains Mono', monospace",
                                }}
                              >
                                מעבד
                              </motion.span>
                            ) : isDone ? (
                              <motion.span
                                key="done-badge"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="text-[10px] font-medium text-emerald-500/60 tracking-wider whitespace-nowrap"
                                style={{
                                  fontFamily: "'JetBrains Mono', monospace",
                                }}
                              >
                                הושלם ✓
                              </motion.span>
                            ) : null}
                          </AnimatePresence>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>

          {/* ── Pass 1 Summary Card ── */}
          {pass1Summary && (
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="mt-4 bg-[#0d1320] rounded-lg border border-cyan-500/20 p-4 overflow-hidden relative"
            >
              {/* Subtle gradient */}
              <div
                className="absolute inset-0 bg-gradient-to-l from-cyan-500/8 to-transparent pointer-events-none"
                style={{
                  backgroundSize: "40% 100%",
                  backgroundPosition: "right",
                  backgroundRepeat: "no-repeat",
                }}
              />
              <div className="relative">
                <h4
                  className="text-[10px] font-bold text-cyan-400/70 mb-2.5 tracking-wider uppercase"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  סיכום קריאה
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-[#111827] rounded border border-[#1e293b] px-3 py-2">
                    <span className="text-[10px] text-slate-500 block">סוג</span>
                    <span className="text-sm font-semibold text-slate-200">
                      {pass1Summary.plan_type}
                    </span>
                  </div>
                  <div className="bg-[#111827] rounded border border-[#1e293b] px-3 py-2">
                    <span className="text-[10px] text-slate-500 block">אלמנטים</span>
                    <span className="text-sm font-bold text-cyan-400 eng-number">
                      {pass1Summary.element_count}
                    </span>
                  </div>
                  {pass1Summary.unclear_count > 0 && (
                    <div className="col-span-2 bg-amber-500/5 rounded border border-amber-500/20 px-3 py-2 flex items-center gap-2">
                      <svg width="14" height="14" viewBox="0 0 16 16">
                        <path
                          d="M8 1.5L14.5 13H1.5L8 1.5Z"
                          fill="#f59e0b"
                          stroke="#f59e0b"
                          strokeWidth="1"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M8 6v3M8 11h0"
                          stroke="white"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      </svg>
                      <span className="text-xs text-amber-400">
                        לא ברורים:{" "}
                        <span className="font-bold eng-number">
                          {pass1Summary.unclear_count}
                        </span>
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
