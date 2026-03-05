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
      <DialogContent className="max-w-lg mx-3 sm:mx-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">
            {isEdit ? "עריכת מחיר" : "הוספת פריט מחיר"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 mt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs sm:text-sm">קטגוריה</Label>
              <Select value={form.category} onValueChange={(v) => handleChange("category", v)}>
                <SelectTrigger className="h-9 text-xs sm:text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs sm:text-sm">יחידה</Label>
              <Select value={form.unit} onValueChange={(v) => handleChange("unit", v)}>
                <SelectTrigger className="h-9 text-xs sm:text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {UNITS.map((u) => (
                    <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs sm:text-sm">שם פריט (EN)</Label>
              <Input value={form.item_name} onChange={(e) => handleChange("item_name", e.target.value)} className="h-9 text-xs sm:text-sm" placeholder="Structural concrete B30" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs sm:text-sm">שם פריט (עב)</Label>
              <Input value={form.item_name_he} onChange={(e) => handleChange("item_name_he", e.target.value)} className="h-9 text-xs sm:text-sm" placeholder="בטון קונסטרוקטיבי B30" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs sm:text-sm">מחיר ליחידה (₪)</Label>
            <Input type="number" value={form.price} onChange={(e) => handleChange("price", e.target.value)} className="h-9 text-xs sm:text-sm" dir="ltr" />
          </div>
          <div className="flex gap-2 pt-2">
            <Button onClick={handleSave} disabled={saving || !form.item_name_he || !form.price}
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