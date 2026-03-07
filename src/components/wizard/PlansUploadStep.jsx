import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, FileText, X, Loader2, Building2, Info, ChevronDown, ChevronLeft, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/api/apiClient";
import { motion, AnimatePresence } from "framer-motion";

const PLAN_CATEGORIES = [
  { id: "structural", label: "תכנית שלד / קונסטרוקציה", desc: "עמודים, קורות, תקרות, יסודות" },
  { id: "architectural", label: "תכנית אדריכלית", desc: "קירות, חלונות, דלתות, חללים" },
  { id: "sections", label: "חתכים", desc: "גובה קומות, עומקים, פרטים" },
  { id: "details", label: "פרטי זיון / פרטים", desc: "טבלאות זיון, כיפופים, חתכים" },
  { id: "other", label: "אחר", desc: "" },
];

const ACCEPTED_TYPES = ".pdf,.png,.jpg,.jpeg,.dwg,.dxf";

export default function PlansUploadStep({ floors, setFloors, workType }) {
  const [expandedFloor, setExpandedFloor] = useState(0);
  const [uploading, setUploading] = useState(null);
  const fileRefs = useRef({});

  const getRecommendedPlans = () => {
    const plans = [];
    if (workType === "construction" || workType === "both") {
      plans.push({ cat: "structural", reason: "לחישוב בטון, ברזל ותבניות" });
      plans.push({ cat: "sections", reason: "לחישוב גובה קומות ועומקים" });
    }
    if (workType === "finishing" || workType === "both") {
      plans.push({ cat: "architectural", reason: "לחישוב בלוקים, גבס, טיח, ריצוף, חלונות, דלתות" });
    }
    return plans;
  };

  const handleFileUpload = async (floorIdx, file) => {
    const key = `${floorIdx}`;
    setUploading(key);
    const { file_url } = await api.integrations.Core.UploadFile({ file });
    const ext = file.name.split(".").pop().toLowerCase();
    const fileType = ext === "pdf" ? "pdf" : ["dwg", "dxf"].includes(ext) ? "dwg" : ["png", "jpg", "jpeg"].includes(ext) ? "image" : "other";

    setFloors(prev => prev.map((f, i) => {
      if (i !== floorIdx) return f;
      return {
        ...f,
        plans: [...(f.plans || []), { file_url, file_type: fileType, file_name: file.name, plan_category: "structural" }],
      };
    }));
    setUploading(null);
  };

  const updatePlanCategory = (floorIdx, planIdx, category) => {
    setFloors(prev => prev.map((f, i) => {
      if (i !== floorIdx) return f;
      const plans = [...f.plans];
      plans[planIdx] = { ...plans[planIdx], plan_category: category };
      return { ...f, plans };
    }));
  };

  const removePlan = (floorIdx, planIdx) => {
    setFloors(prev => prev.map((f, i) => {
      if (i !== floorIdx) return f;
      return { ...f, plans: f.plans.filter((_, j) => j !== planIdx) };
    }));
  };

  const recommended = getRecommendedPlans();
  const totalPlans = floors.reduce((s, f) => s + (f.plans?.length || 0), 0);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-slate-100 mb-1">העלאת תכניות</h2>
        <p className="text-sm text-slate-500">העלה תכניות לכל קומה — ככל שיותר תכניות, התוצאה מדויקת יותר</p>
      </div>

      {/* Recommended plans */}
      <div className="bg-cyan-500/10 rounded border border-cyan-500/20 p-3.5">
        <div className="flex items-center gap-2 mb-2">
          <Info className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-bold text-cyan-400">תכניות מומלצות לפי סוג העבודה</span>
        </div>
        <div className="space-y-1">
          {recommended.map(r => (
            <p key={r.cat} className="text-xs text-cyan-300/70">
              • <strong className="text-cyan-400">{PLAN_CATEGORIES.find(c => c.id === r.cat)?.label}</strong> — {r.reason}
            </p>
          ))}
        </div>
      </div>

      {/* Floors */}
      <div className="space-y-2">
        {floors.map((floor, floorIdx) => (
          <div key={floorIdx} className="bg-[#0d1320] rounded border border-[#1e293b] overflow-hidden">
            <button
              onClick={() => setExpandedFloor(expandedFloor === floorIdx ? -1 : floorIdx)}
              className="w-full flex items-center gap-3 p-4 hover:bg-white/[0.02] transition-colors text-right"
            >
              <div className="w-8 h-8 bg-[#111827] rounded flex items-center justify-center shrink-0 border border-[#1e293b]">
                <Building2 className="w-4 h-4 text-slate-500" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="font-semibold text-sm text-slate-200">{floor.label}</span>
                {floor.is_typical && <span className="inline-flex items-center text-[10px] font-medium px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 mr-2">×{floor.typical_count}</span>}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="inline-flex items-center text-[10px] font-medium px-1.5 py-0.5 rounded border border-[#1e293b] text-slate-500 bg-[#111827]">{(floor.plans || []).length} תכניות</span>
                {expandedFloor === floorIdx ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronLeft className="w-4 h-4 text-slate-500" />}
              </div>
            </button>

            <AnimatePresence>
              {expandedFloor === floorIdx && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t border-[#1e293b] overflow-hidden"
                >
                  <div className="p-4 space-y-3">
                    {/* Existing plans */}
                    {(floor.plans || []).map((plan, planIdx) => (
                      <div key={planIdx} className="flex items-center gap-3 bg-[#111827] rounded border border-[#1e293b] p-3">
                        <FileText className="w-4 h-4 text-amber-400 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-slate-300 truncate">{plan.file_name}</p>
                        </div>
                        <Select
                          value={plan.plan_category}
                          onValueChange={(v) => updatePlanCategory(floorIdx, planIdx, v)}
                        >
                          <SelectTrigger className="w-44 h-8 text-xs bg-[#0d1320] border-[#1e293b] text-slate-300">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-[#1e293b] border-[#334155]">
                            {PLAN_CATEGORIES.map(cat => (
                              <SelectItem key={cat.id} value={cat.id} className="text-xs text-slate-200 focus:bg-amber-500/10 focus:text-amber-400">{cat.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-slate-600 hover:text-rose-400 hover:bg-rose-500/10" onClick={() => removePlan(floorIdx, planIdx)}>
                          <X className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    ))}

                    {/* Upload */}
                    <input
                      ref={el => fileRefs.current[floorIdx] = el}
                      type="file"
                      accept={ACCEPTED_TYPES}
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files[0]) handleFileUpload(floorIdx, e.target.files[0]);
                        e.target.value = "";
                      }}
                    />
                    <Button
                      variant="outline"
                      onClick={() => fileRefs.current[floorIdx]?.click()}
                      disabled={uploading === `${floorIdx}`}
                      className="w-full h-10 border-dashed border-[#334155] text-slate-400 hover:border-amber-500/40 hover:text-amber-400 hover:bg-amber-500/5 gap-2 text-xs bg-transparent"
                    >
                      {uploading === `${floorIdx}` ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Plus className="w-4 h-4" />
                      )}
                      העלה תכנית ל{floor.label}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {totalPlans > 0 && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded p-3 text-center">
          <p className="text-sm font-semibold text-emerald-400">סה"כ <span className="eng-number">{totalPlans}</span> תכניות הועלו</p>
        </div>
      )}
    </div>
  );
}
