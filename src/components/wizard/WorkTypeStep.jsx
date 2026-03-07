import React from "react";
import { motion } from "framer-motion";
import { Building2, Paintbrush, Layers } from "lucide-react";

const WORK_TYPES = [
  {
    id: "construction",
    label: "קונסטרוקציה",
    desc: "בטון, ברזל, תבניות, כלונסאות",
    icon: Building2,
    color: "border-cyan-500/30 bg-cyan-500/5",
    activeColor: "ring-2 ring-cyan-500 border-cyan-500/50 bg-cyan-500/10",
  },
  {
    id: "finishing",
    label: "גמרים",
    desc: "בלוקים, גבס, טיח, צבע, ריצוף, חלונות, דלתות",
    icon: Paintbrush,
    color: "border-emerald-500/30 bg-emerald-500/5",
    activeColor: "ring-2 ring-emerald-500 border-emerald-500/50 bg-emerald-500/10",
  },
  {
    id: "both",
    label: "קונסטרוקציה + גמרים",
    desc: "כל סוגי העבודה",
    icon: Layers,
    color: "border-amber-500/30 bg-amber-500/5",
    activeColor: "ring-2 ring-amber-500 border-amber-500/50 bg-amber-500/10",
  },
];

const CONSTRUCTION_CATEGORIES = [
  { id: "concrete", label: "בטון", unit: 'מ"ק' },
  { id: "steel", label: "ברזל זיון", unit: "טון / ק\"ג" },
  { id: "formwork", label: "תבניות (טפסנות)", unit: 'מ"ר' },
  { id: "piles", label: "כלונסאות", unit: 'כמות × מ"א' },
];

const FINISHING_CATEGORIES = [
  { id: "blocks", label: "בלוקים / בנייה", unit: 'מ"ר' },
  { id: "plaster", label: "טיח", unit: 'מ"ר' },
  { id: "paint", label: "צבע", unit: 'מ"ר' },
  { id: "tiling", label: "ריצוף", unit: 'מ"ר' },
  { id: "gypsum", label: "גבס", unit: 'מ"ר' },
  { id: "windows", label: "חלונות", unit: "יח׳ (אורך×רוחב)" },
  { id: "doors", label: "דלתות", unit: "יח׳ (לפי מידות)" },
  { id: "acoustic_ceiling", label: "תקרות אקוסטיות", unit: 'מ"ר' },
];

export default function WorkTypeStep({ workType, setWorkType, categories, setCategories }) {
  const getCategoriesForType = (type) => {
    if (type === "construction") return CONSTRUCTION_CATEGORIES;
    if (type === "finishing") return FINISHING_CATEGORIES;
    return [...CONSTRUCTION_CATEGORIES, ...FINISHING_CATEGORIES];
  };

  const handleWorkTypeSelect = (type) => {
    setWorkType(type);
    const cats = getCategoriesForType(type);
    setCategories(cats.map(c => c.id));
  };

  const toggleCategory = (catId) => {
    setCategories(prev =>
      prev.includes(catId) ? prev.filter(c => c !== catId) : [...prev, catId]
    );
  };

  const availableCategories = getCategoriesForType(workType);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-100 mb-1">סוג עבודה</h2>
        <p className="text-sm text-slate-500">בחר את סוג העבודות שתרצה לחשב</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {WORK_TYPES.map((wt, i) => (
          <motion.button
            key={wt.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => handleWorkTypeSelect(wt.id)}
            className={`rounded border-2 p-5 text-right transition-all hover:bg-white/[0.02] ${
              workType === wt.id ? wt.activeColor : "border-[#1e293b] bg-[#0d1320] hover:border-[#334155]"
            }`}
          >
            <wt.icon className={`w-7 h-7 mb-3 ${workType === wt.id ? "text-slate-200" : "text-slate-500"}`} />
            <h3 className="font-bold text-slate-200 text-sm">{wt.label}</h3>
            <p className="text-[11px] text-slate-500 mt-1">{wt.desc}</p>
          </motion.button>
        ))}
      </div>

      {workType && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h3 className="text-sm font-bold text-slate-300 mb-2">קטגוריות חישוב</h3>
          <p className="text-xs text-slate-500 mb-3">בחר אילו סוגי עבודות לכלול. ניתן לבטל סימון של קטגוריות לא רלוונטיות.</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {availableCategories.map(cat => {
              const isSelected = categories.includes(cat.id);
              return (
                <button
                  key={cat.id}
                  onClick={() => toggleCategory(cat.id)}
                  className={`rounded border p-3 text-right transition-all text-sm ${
                    isSelected
                      ? "border-amber-500/40 bg-amber-500/10 text-slate-200"
                      : "border-[#1e293b] bg-[#0d1320] text-slate-500 hover:border-[#334155]"
                  }`}
                >
                  <span className="font-semibold block">{cat.label}</span>
                  <span className="text-[10px] text-slate-500">{cat.unit}</span>
                </button>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
}
