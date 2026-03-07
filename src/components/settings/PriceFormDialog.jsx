import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/api/apiClient";
import { Loader2 } from "lucide-react";

const CATEGORIES = [
  { value: "earthworks", label: "עבודות עפר" },
  { value: "concrete", label: "בטון" },
  { value: "steel", label: "פלדה/זיון" },
  { value: "formwork", label: "תבניות" },
  { value: "masonry", label: "בנייה (בלוקים)" },
  { value: "plaster", label: "טיח" },
  { value: "tiling", label: "ריצוף וחיפוי" },
  { value: "waterproofing", label: "איטום" },
  { value: "insulation", label: "בידוד" },
  { value: "plumbing", label: "אינסטלציה" },
  { value: "electrical", label: "חשמל" },
  { value: "openings", label: "פתחים (חלונות/דלתות)" },
  { value: "metalwork", label: "מסגרות" },
  { value: "painting", label: "צבע" },
  { value: "misc", label: "שונות" },
];

const UNITS = [
  { value: "m3", label: 'מ"ק' },
  { value: "m2", label: 'מ"ר' },
  { value: "ml", label: 'מ"א' },
  { value: "kg", label: 'ק"ג' },
  { value: "ton", label: "טון" },
  { value: "unit", label: "יחידה" },
  { value: "lump_sum", label: "פאושלי" },
];

export default function PriceFormDialog({ item, onSaved, onClose }) {
  const isEdit = !!item;
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    category: item?.category || "concrete",
    category_name_he: item?.category_name_he || "",
    item_name: item?.item_name || "",
    item_name_he: item?.item_name_he || "",
    unit: item?.unit || "m3",
    unit_name_he: item?.unit_name_he || "",
    price: item?.price || 0,
  });

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (field === "category") {
      const match = CATEGORIES.find((c) => c.value === value);
      if (match) setForm((prev) => ({ ...prev, [field]: value, category_name_he: match.label }));
    }
    if (field === "unit") {
      const match = UNITS.find((u) => u.value === value);
      if (match) setForm((prev) => ({ ...prev, [field]: value, unit_name_he: match.label }));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    const data = { ...form, price: Number(form.price) };
    if (isEdit) {
      await api.entities.PriceItem.update(item.id, data);
    } else {
      await api.entities.PriceItem.create(data);
    }
    setSaving(false);
    onSaved();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg mx-3 sm:mx-auto bg-white border-slate-200" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg text-slate-900">
            {isEdit ? "עריכת מחיר" : "הוספת פריט מחיר"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 mt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs sm:text-sm text-slate-400">קטגוריה</Label>
              <Select value={form.category} onValueChange={(v) => handleChange("category", v)}>
                <SelectTrigger className="h-9 text-xs sm:text-sm bg-slate-50 border-slate-200 text-slate-800"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-slate-100 border-slate-300">
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value} className="text-slate-800 focus:bg-amber-50 focus:text-blue-600">{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs sm:text-sm text-slate-400">יחידה</Label>
              <Select value={form.unit} onValueChange={(v) => handleChange("unit", v)}>
                <SelectTrigger className="h-9 text-xs sm:text-sm bg-slate-50 border-slate-200 text-slate-800"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-slate-100 border-slate-300">
                  {UNITS.map((u) => (
                    <SelectItem key={u.value} value={u.value} className="text-slate-800 focus:bg-amber-50 focus:text-blue-600">{u.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs sm:text-sm text-slate-400">שם פריט (EN)</Label>
              <Input value={form.item_name} onChange={(e) => handleChange("item_name", e.target.value)} className="h-9 text-xs sm:text-sm bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400" placeholder="Structural concrete B30" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs sm:text-sm text-slate-400">שם פריט (עב)</Label>
              <Input value={form.item_name_he} onChange={(e) => handleChange("item_name_he", e.target.value)} className="h-9 text-xs sm:text-sm bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400" placeholder="בטון קונסטרוקטיבי B30" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs sm:text-sm text-slate-400">מחיר ליחידה (₪)</Label>
            <Input type="number" value={form.price} onChange={(e) => handleChange("price", e.target.value)} className="h-9 text-xs sm:text-sm bg-slate-50 border-slate-200 text-slate-800" dir="ltr" />
          </div>
          <div className="flex gap-2 pt-2">
            <button onClick={handleSave} disabled={saving || !form.item_name_he || !form.price}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 text-sm rounded-md transition-all h-10 text-sm font-bold disabled:opacity-50">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : isEdit ? "עדכן" : "הוסף"}
            </button>
            <Button variant="outline" onClick={onClose} className="h-10 text-sm bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200">ביטול</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
