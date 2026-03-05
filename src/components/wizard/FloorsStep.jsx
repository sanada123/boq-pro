import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X, Copy, Building2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { motion, AnimatePresence } from "framer-motion";

const PRESET_FLOORS = [
  { name: "basement_1", label: "מרתף -1" },
  { name: "ground", label: "קומת קרקע" },
  { name: "typical", label: "קומה טיפוסית", is_typical: true, typical_count: 3 },
  { name: "roof", label: "גג" },
];

export default function FloorsStep({ floors, setFloors }) {
  const addFloor = () => {
    setFloors(prev => [
      ...prev,
      { name: `floor_${prev.length + 1}`, label: `קומה ${prev.length + 1}`, is_typical: false, typical_count: 1, plans: [] },
    ]);
  };

  const removeFloor = (idx) => {
    setFloors(prev => prev.filter((_, i) => i !== idx));
  };

  const updateFloor = (idx, field, value) => {
    setFloors(prev => prev.map((f, i) => i === idx ? { ...f, [field]: value } : f));
  };

  const loadPreset = () => {
    setFloors(PRESET_FLOORS.map(p => ({ ...p, plans: [] })));
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 mb-1">קומות</h2>
          <p className="text-sm text-slate-500">הגדר את הקומות בפרויקט</p>
        </div>
        {floors.length === 0 && (
          <Button variant="outline" onClick={loadPreset} className="gap-1.5 text-xs rounded-lg">
            <Copy className="w-3.5 h-3.5" />
            טען תבנית
          </Button>
        )}
      </div>

      <AnimatePresence>
        {floors.map((floor, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="bg-white rounded-xl border border-slate-200 p-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
                <Building2 className="w-4 h-4 text-slate-400" />
              </div>
              <div className="flex-1 min-w-0">
                <Input
                  value={floor.label}
                  onChange={(e) => updateFloor(idx, "label", e.target.value)}
                  className="h-9 text-sm font-semibold rounded-lg"
                  placeholder="שם הקומה"
                />
              </div>
              <Button size="icon" variant="ghost" onClick={() => removeFloor(idx)} className="h-8 w-8 text-slate-300 hover:text-red-500 shrink-0">
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex items-center gap-4 mt-3 mr-12">
              <div className="flex items-center gap-2">
                <Switch
                  checked={floor.is_typical}
                  onCheckedChange={(v) => updateFloor(idx, "is_typical", v)}
                />
                <span className="text-xs text-slate-600">קומה טיפוסית</span>
              </div>
              {floor.is_typical && (
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-500">חוזרת</span>
                  <Input
                    type="number"
                    min={1}
                    max={50}
                    value={floor.typical_count}
                    onChange={(e) => updateFloor(idx, "typical_count", Number(e.target.value))}
                    className="w-16 h-7 text-xs text-center rounded-lg"
                  />
                  <span className="text-xs text-slate-500">פעמים</span>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      <Button onClick={addFloor} variant="outline" className="w-full h-10 gap-2 text-sm border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50/50 rounded-xl">
        <Plus className="w-4 h-4" />
        הוסף קומה
      </Button>

      {floors.length > 0 && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
          <p className="text-xs text-blue-700">
            <strong>סה"כ:</strong>{" "}
            {floors.reduce((sum, f) => sum + (f.is_typical ? (f.typical_count || 1) : 1), 0)} קומות
            {floors.some(f => f.is_typical) && (
              <span className="text-blue-500"> (כולל {floors.filter(f => f.is_typical).reduce((s, f) => s + (f.typical_count || 1), 0)} קומות טיפוסיות)</span>
            )}
          </p>
        </div>
      )}
    </div>
  );
}