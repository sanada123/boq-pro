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

  const [uploadError, setUploadError] = useState(null);

  const handleFileUpload = async (floorIdx, file) => {
    const key = `${floorIdx}`;
    setUploading(key);
    setUploadError(null);
    try {
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
    } catch (err) {
      console.error("Upload failed:", err);
      setUploadError(`שגיאה בהעלאה: ${err.message || "נסה שוב"}`);
    } finally {
      setUploading(null);
    }
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
        <h2 className="text-lg font-bold text-slate-900 mb-1">העלאת תכניות</h2>
        <p className="text-sm text-slate-500">העלה תכניות לכל קומה — ככל שיותר תכניות, התוצאה מדויקת יותר</p>
      </div>

      {/* Recommended plans */}
      <div className="bg-blue-50 rounded border border-blue-200 p-3.5">
        <div className="flex items-center gap-2 mb-2">
          <Info className="w-4 h-4 text-blue-600" />
          <span className="text-xs font-bold text-blue-600">תכניות מומלצות לפי סוג העבודה</span>
        </div>
        <div className="space-y-1">
          {recommended.map(r => (
            <p key={r.cat} className="text-xs text-blue-500">
              • <strong className="text-blue-600">{PLAN_CATEGORIES.find(c => c.id === r.cat)?.label}</strong> — {r.reason}
            </p>
          ))}
        </div>
      </div>

      {/* Floors */}
      <div className="space-y-2">
        {floors.map((floor, floorIdx) => (
          <div key={floorIdx} className="bg-slate-50 rounded border border-slate-200 overflow-hidden">
            <button
              onClick={() => setExpandedFloor(expandedFloor === floorIdx ? -1 : floorIdx)}
              className="w-full flex items-center gap-3 p-4 hover:bg-black/[0.02] transition-colors text-right"
            >
              <div className="w-8 h-8 bg-white rounded flex items-center justify-center shrink-0 border border-slate-200">
                <Building2 className="w-4 h-4 text-slate-500" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="font-semibold text-sm text-slate-800">{floor.label}</span>
                {floor.is_typical && <span className="inline-flex items-center text-[10px] font-medium px-1.5 py-0.5 rounded bg-cyan-500/15 text-blue-600 border border-blue-200 mr-2">×{floor.typical_count}</span>}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="inline-flex items-center text-[10px] font-medium px-1.5 py-0.5 rounded border border-slate-200 text-slate-500 bg-white">{(floor.plans || []).length} תכניות</span>
                {expandedFloor === floorIdx ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronLeft className="w-4 h-4 text-slate-500" />}
              </div>
            </button>

            <AnimatePresence>
              {expandedFloor === floorIdx && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t border-slate-200 overflow-hidden"
                >
                  <div className="p-4 space-y-3">
                    {/* Existing plans */}
                    {(floor.plans || []).map((plan, planIdx) => (
                      <div key={planIdx} className="flex items-center gap-3 bg-white rounded border border-slate-200 p-3">
                        <FileText className="w-4 h-4 text-amber-600 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-slate-700 truncate">{plan.file_name}</p>
                        </div>
                        <Select
                          value={plan.plan_category}
                          onValueChange={(v) => updatePlanCategory(floorIdx, planIdx, v)}
                        >
                          <SelectTrigger className="w-44 h-8 text-xs bg-slate-50 border-slate-200 text-slate-700">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-100 border-slate-300">
                            {PLAN_CATEGORIES.map(cat => (
                              <SelectItem key={cat.id} value={cat.id} className="text-xs text-slate-800 focus:bg-amber-50 focus:text-blue-600">{cat.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-slate-600 hover:text-rose-600 hover:bg-rose-50" onClick={() => removePlan(floorIdx, planIdx)}>
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
                      className="w-full h-10 border-dashed border-slate-300 text-slate-400 hover:border-amber-300 hover:text-amber-600 hover:bg-amber-50 gap-2 text-xs bg-transparent"
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

      {uploadError && (
        <div className="bg-rose-50 border border-rose-500/25 rounded p-3 text-center">
          <p className="text-sm text-rose-600">{uploadError}</p>
        </div>
      )}

      {totalPlans > 0 && (
        <div className="bg-emerald-50 border border-emerald-200 rounded p-3 text-center">
          <p className="text-sm font-semibold text-emerald-600">סה"כ <span className="eng-number">{totalPlans}</span> תכניות הועלו</p>
        </div>
      )}
    </div>
  );
}
