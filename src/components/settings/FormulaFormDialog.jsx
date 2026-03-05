import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/api/apiClient";
import { Loader2 } from "lucide-react";

const SECTIONS = [
  { value: "earthworks", label: "עבודות עפר" },
  { value: "concrete_foundations", label: "בטון ויסודות" },
  { value: "skeleton", label: "שלד" },
  { value: "piles", label: "כלונסאות" },
  { value: "masonry", label: "בנייה ובלוקים" },
  { value: "plaster", label: "טיח" },
  { value: "paint", label: "צבע" },
  { value: "tiling", label: "ריצוף" },
  { value: "gypsum", label: "גבס" },
  { value: "windows_doors", label: "חלונות ודלתות" },
  { value: "acoustic_ceiling", label: "תקרות אקוסטיות" },
  { value: "misc", label: "שונות" },
];

export default function FormulaFormDialog({ formula, onSaved, onClose }) {
  const isEdit = !!formula;
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    element_type: formula?.element_type || "",
    element_name_he: formula?.element_name_he || "",
    formula: formula?.formula || "",
    formula_description_he: formula?.formula_description_he || "",
    default_values: formula?.default_values || "",
    waste_factor: formula?.waste_factor || 0,
    section: formula?.section || "concrete_foundations",
    is_editable: formula?.is_editable ?? true,
    is_active: formula?.is_active ?? true,
  });

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    const data = { ...form, waste_factor: Number(form.waste_factor) };
    if (isEdit) {
      await api.entities.CalculationFormula.update(formula.id, data);
    } else {
      await api.entities.CalculationFormula.create(data);
    }
    setSaving(false);
    onSaved();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg mx-3 sm:mx-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">
            {isEdit ? "עריכת נוסחה" : "הוספת נוסחה"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 mt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs sm:text-sm">סעיף</Label>
              <Select value={form.section} onValueChange={(v) => handleChange("section", v)}>
                <SelectTrigger className="h-9 text-xs sm:text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SECTIONS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs sm:text-sm">פחת (%)</Label>
              <Input type="number" value={form.waste_factor} onChange={(e) => handleChange("waste_factor", e.target.value)} className="h-9 text-xs sm:text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs sm:text-sm">מזהה (EN)</Label>
              <Input value={form.element_type} onChange={(e) => handleChange("element_type", e.target.value)} className="h-9 text-xs sm:text-sm" placeholder="strip_foundations" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs sm:text-sm">שם בעברית</Label>
              <Input value={form.element_name_he} onChange={(e) => handleChange("element_name_he", e.target.value)} className="h-9 text-xs sm:text-sm" placeholder="יסודות רצועה" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs sm:text-sm">נוסחה</Label>
            <Input value={form.formula} onChange={(e) => handleChange("formula", e.target.value)} className="h-9 text-xs sm:text-sm font-mono" dir="ltr" placeholder="perimeter × 0.4 × 0.8" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs sm:text-sm">הסבר הנוסחה</Label>
            <Textarea value={form.formula_description_he} onChange={(e) => handleChange("formula_description_he", e.target.value)} rows={2} className="text-xs sm:text-sm" placeholder="היקף הבניין × רוחב היסוד × עומק היסוד" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs sm:text-sm">ערכי ברירת מחדל</Label>
            <Input value={form.default_values} onChange={(e) => handleChange("default_values", e.target.value)} className="h-9 text-xs sm:text-sm" placeholder="רוחב=0.4מ׳, עומק=0.8מ׳" />
          </div>
          <div className="flex gap-2 pt-2">
            <Button onClick={handleSave} disabled={saving || !form.element_name_he || !form.formula}
              className="flex-1 bg-[#1e3a5f] hover:bg-[#2a5a8f] h-10 text-sm font-bold rounded-xl">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : isEdit ? "עדכן" : "הוסף"}
            </Button>
            <Button variant="outline" onClick={onClose} className="h-10 rounded-xl text-sm">ביטול</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}