import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Trash2, Check, X } from "lucide-react";

const UNIT_LABELS = {
  m3: 'מ"ק', m2: 'מ"ר', ml: 'מ"א', kg: 'ק"ג', ton: "טון", unit: "יחידה", lump_sum: "פאושלי",
};

const CATEGORY_COLORS = {
  earthworks: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  concrete: "bg-slate-500/15 text-slate-300 border-slate-500/30",
  steel: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
  formwork: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  masonry: "bg-stone-500/15 text-stone-400 border-stone-500/30",
  plaster: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  tiling: "bg-teal-500/15 text-teal-400 border-teal-500/30",
  waterproofing: "bg-sky-500/15 text-sky-400 border-sky-500/30",
  insulation: "bg-violet-500/15 text-violet-400 border-violet-500/30",
  plumbing: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  electrical: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  openings: "bg-indigo-500/15 text-indigo-400 border-indigo-500/30",
  metalwork: "bg-rose-500/15 text-rose-400 border-rose-500/30",
  painting: "bg-pink-500/15 text-pink-400 border-pink-500/30",
  misc: "bg-slate-500/15 text-slate-400 border-slate-500/30",
};

export default function PriceCard({ item, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [price, setPrice] = useState(item.price);

  const handleSave = () => {
    onUpdate(item.id, { price: Number(price) });
    setEditing(false);
  };

  return (
    <div className="flex items-center gap-2 sm:gap-3 bg-[#111827] rounded border border-[#1e293b] px-3 py-2.5 sm:px-4 sm:py-3">
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <span className={`inline-flex items-center text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded border ${CATEGORY_COLORS[item.category] || "bg-slate-500/15 text-slate-400 border-slate-500/30"}`}>
            {item.category_name_he || item.category}
          </span>
          <span className="text-xs sm:text-sm font-medium text-slate-200 truncate">{item.item_name_he}</span>
        </div>
      </div>
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        <span className="text-[10px] sm:text-xs text-slate-500">{UNIT_LABELS[item.unit] || item.unit}</span>
        {editing ? (
          <>
            <Input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-20 h-7 sm:h-8 text-xs sm:text-sm text-left bg-[#0d1320] border-[#1e293b] text-slate-200"
              dir="ltr"
            />
            <Button size="icon" variant="ghost" className="h-6 w-6 text-emerald-400 hover:bg-emerald-500/10" onClick={handleSave}>
              <Check className="w-3.5 h-3.5" />
            </Button>
            <Button size="icon" variant="ghost" className="h-6 w-6 text-slate-500 hover:bg-slate-500/10" onClick={() => { setEditing(false); setPrice(item.price); }}>
              <X className="w-3.5 h-3.5" />
            </Button>
          </>
        ) : (
          <>
            <span className="text-sm sm:text-base font-bold text-amber-400 min-w-[60px] text-left eng-number" dir="ltr">
              ₪{item.price.toLocaleString()}
            </span>
            <Button size="icon" variant="ghost" className="h-7 w-7 text-slate-500 hover:text-amber-400 hover:bg-amber-500/10" onClick={() => setEditing(true)}>
              <Pencil className="w-3 h-3" />
            </Button>
            <Button size="icon" variant="ghost" className="h-7 w-7 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10" onClick={() => onDelete(item.id)}>
              <Trash2 className="w-3 h-3" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
