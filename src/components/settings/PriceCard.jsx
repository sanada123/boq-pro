import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Trash2, Check, X } from "lucide-react";

const UNIT_LABELS = {
  m3: 'מ"ק', m2: 'מ"ר', ml: 'מ"א', kg: 'ק"ג', ton: "טון", unit: "יחידה", lump_sum: "פאושלי",
};

const CATEGORY_COLORS = {
  earthworks: "bg-amber-100 text-amber-800",
  concrete: "bg-slate-200 text-slate-800",
  steel: "bg-blue-100 text-blue-800",
  formwork: "bg-orange-100 text-orange-800",
  masonry: "bg-red-100 text-red-800",
  plaster: "bg-emerald-100 text-emerald-800",
  tiling: "bg-teal-100 text-teal-800",
  waterproofing: "bg-cyan-100 text-cyan-800",
  insulation: "bg-violet-100 text-violet-800",
  plumbing: "bg-sky-100 text-sky-800",
  electrical: "bg-yellow-100 text-yellow-800",
  openings: "bg-indigo-100 text-indigo-800",
  metalwork: "bg-rose-100 text-rose-800",
  painting: "bg-lime-100 text-lime-800",
  misc: "bg-gray-100 text-gray-800",
};

export default function PriceCard({ item, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [price, setPrice] = useState(item.price);

  const handleSave = () => {
    onUpdate(item.id, { price: Number(price) });
    setEditing(false);
  };

  return (
    <div className="flex items-center gap-2 sm:gap-3 bg-white rounded-xl border border-slate-100 px-3 py-2.5 sm:px-4 sm:py-3">
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <Badge className={`${CATEGORY_COLORS[item.category] || "bg-gray-100"} text-[9px] sm:text-[10px] font-bold`}>
            {item.category_name_he || item.category}
          </Badge>
          <span className="text-xs sm:text-sm font-medium text-slate-800 truncate">{item.item_name_he}</span>
        </div>
      </div>
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        <span className="text-[10px] sm:text-xs text-slate-400">{UNIT_LABELS[item.unit] || item.unit}</span>
        {editing ? (
          <>
            <Input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-20 h-7 sm:h-8 text-xs sm:text-sm text-left"
              dir="ltr"
            />
            <Button size="icon" variant="ghost" className="h-6 w-6 text-green-600" onClick={handleSave}>
              <Check className="w-3.5 h-3.5" />
            </Button>
            <Button size="icon" variant="ghost" className="h-6 w-6 text-slate-400" onClick={() => { setEditing(false); setPrice(item.price); }}>
              <X className="w-3.5 h-3.5" />
            </Button>
          </>
        ) : (
          <>
            <span className="text-sm sm:text-base font-bold text-slate-800 min-w-[60px] text-left" dir="ltr">
              ₪{item.price.toLocaleString()}
            </span>
            <Button size="icon" variant="ghost" className="h-7 w-7 text-slate-400 hover:text-[#1e3a5f]" onClick={() => setEditing(true)}>
              <Pencil className="w-3 h-3" />
            </Button>
            <Button size="icon" variant="ghost" className="h-7 w-7 text-slate-400 hover:text-red-500" onClick={() => onDelete(item.id)}>
              <Trash2 className="w-3 h-3" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
}