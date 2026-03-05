import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

export default function StandardFormDialog({ standard, onSaved, onClose }) {
  const isEdit = !!standard;
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    section: standard?.section || "earthworks",
    section_name_he: standard?.section_name_he || "",
    standard_reference: standard?.standard_reference || "",
    description: standard?.description || "",
    waste_factor: standard?.waste_factor || 0,
    is_active: standard?.is_active ?? true,
    custom_notes: standard?.custom_notes || "",
  });

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (field === "section") {
      const match = SECTIONS.find((s) => s.value === value);
      if (match && !form.section_name_he) {
        setForm((prev) => ({ ...prev, [field]: value, section_name_he: match.label }));
      }
    }
  };

  const handleSave = async () => {
    setSaving(true);
    if (isEdit) {
      await api.entities.EngineerStandard.update(standard.id, {
        ...form,
        waste_factor: Number(form.waste_factor),
      });
    } else {
      await api.entities.EngineerStandard.create({
        ...form,
        waste_factor: Number(form.waste_factor),
      });
    }
    setSaving(false);
    onSaved();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg mx-3 sm:mx-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">
            {isEdit ? "עריכת סעיף תקן" : "הוספת סעיף תקן"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 sm:space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs sm:text-sm">סעיף</Label>
              <Select value={form.section} onValueChange={(v) => handleChange("section", v)}>
                <SelectTrigger className="h-9 sm:h-10 text-xs sm:text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SECTIONS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs sm:text-sm">שם בעברית</Label>
              <Input
                value={form.section_name_he}
                onChange={(e) => handleChange("section_name_he", e.target.value)}
                className="h-9 sm:h-10 text-xs sm:text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs sm:text-sm">תקן (ת״י)</Label>
              <Input
                value={form.standard_reference}
                onChange={(e) => handleChange("standard_reference", e.target.value)}
                placeholder='ת"י 118'
                className="h-9 sm:h-10 text-xs sm:text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs sm:text-sm">אחוז פחת (%)</Label>
              <Input
                type="number"
                value={form.waste_factor}
                onChange={(e) => handleChange("waste_factor", e.target.value)}
                className="h-9 sm:h-10 text-xs sm:text-sm"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs sm:text-sm">תיאור התקן</Label>
            <Textarea
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
              rows={2}
              className="text-xs sm:text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs sm:text-sm">הערות מותאמות (הנחיות ל-AI)</Label>
            <Textarea
              value={form.custom_notes}
              onChange={(e) => handleChange("custom_notes", e.target.value)}
              placeholder="לדוגמה: להשתמש בבטון B30 במקום B25, להוסיף 5% תוספת לחוזק..."
              rows={2}
              className="text-xs sm:text-sm"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              onClick={handleSave}
              disabled={saving || !form.section_name_he || !form.standard_reference}
              className="flex-1 bg-[#1e3a5f] hover:bg-[#2a5a8f] h-10 sm:h-11 text-sm font-bold rounded-xl"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : isEdit ? "עדכן" : "הוסף"}
            </Button>
            <Button variant="outline" onClick={onClose} className="h-10 sm:h-11 rounded-xl text-sm">
              ביטול
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}