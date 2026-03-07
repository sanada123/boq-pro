import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ChevronDown, ChevronLeft, Pencil, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/api/apiClient";
import { motion, AnimatePresence } from "framer-motion";

const SECTION_LABELS = {
  earthworks: "01 — EARTHWORKS — עבודות עפר",
  concrete_foundations: "02 — CONCRETE — בטון ויסודות",
  skeleton: "03 — SKELETON — שלד",
  piles: "04 — PILES — כלונסאות",
  masonry: "05 — MASONRY — בנייה ובלוקים",
  plaster: "06 — PLASTER — טיח",
  paint: "07 — PAINT — צבע",
  tiling: "08 — TILING — ריצוף",
  gypsum: "09 — GYPSUM — גבס",
  windows_doors: "10 — WINDOWS/DOORS — חלונות ודלתות",
  acoustic_ceiling: "11 — ACOUSTIC — תקרות אקוסטיות",
  misc: "99 — MISC — שונות",
};

const SECTION_COLORS = {
  earthworks: "bg-amber-500/15 border-amber-500/40 text-amber-400",
  concrete_foundations: "bg-slate-500/15 border-slate-500/40 text-slate-300",
  skeleton: "bg-cyan-500/15 border-cyan-500/40 text-cyan-400",
  piles: "bg-orange-500/15 border-orange-500/40 text-orange-400",
  masonry: "bg-stone-500/15 border-stone-500/40 text-stone-400",
  plaster: "bg-yellow-500/15 border-yellow-500/40 text-yellow-400",
  paint: "bg-pink-500/15 border-pink-500/40 text-pink-400",
  tiling: "bg-sky-500/15 border-sky-500/40 text-sky-400",
  gypsum: "bg-violet-500/15 border-violet-500/40 text-violet-400",
  windows_doors: "bg-teal-500/15 border-teal-500/40 text-teal-400",
  acoustic_ceiling: "bg-indigo-500/15 border-indigo-500/40 text-indigo-400",
  misc: "bg-slate-500/15 border-slate-500/40 text-slate-400",
};

const UNIT_LABELS = {
  m3: "מ״ק",
  m2: "מ״ר",
  ml: "מ״א",
  kg: "ק״ג",
  ton: "טון",
  unit: "יח׳",
  lump_sum: "פאושלי",
};

export default function QuantitiesTable({ items, onItemUpdated }) {
  const [expandedSections, setExpandedSections] = useState(
    Object.keys(SECTION_LABELS)
  );
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  const groupedItems = items.reduce((acc, item) => {
    const section = item.section || "misc";
    if (!acc[section]) acc[section] = [];
    acc[section].push(item);
    return acc;
  }, {});

  const toggleSection = (section) => {
    setExpandedSections((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section]
    );
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setEditData({ quantity: item.quantity, unit_price: item.unit_price || 0 });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const saveEdit = async (item) => {
    const total = (editData.quantity || 0) * (editData.unit_price || 0);
    await api.entities.QuantityItem.update(item.id, {
      quantity: Number(editData.quantity),
      unit_price: Number(editData.unit_price),
      total_price: total,
    });
    setEditingId(null);
    if (onItemUpdated) onItemUpdated();
  };

  const getSectionTotal = (sectionItems) => {
    return sectionItems.reduce((sum, item) => sum + (item.total_price || 0), 0);
  };

  const grandTotal = items.reduce(
    (sum, item) => sum + (item.total_price || 0),
    0
  );

  const knownSections = Object.keys(SECTION_LABELS);
  const unknownSections = Object.keys(groupedItems).filter(s => !knownSections.includes(s));
  const sectionOrder = [...knownSections, ...unknownSections];

  return (
    <div className="space-y-3 sm:space-y-4">
      {sectionOrder
        .filter((section) => groupedItems[section]?.length > 0)
        .map((section) => {
          const sectionItems = groupedItems[section];
          const isExpanded = expandedSections.includes(section);
          const sectionTotal = getSectionTotal(sectionItems);

          return (
            <div
              key={section}
              className="eng-card overflow-hidden"
            >
              <button
                onClick={() => toggleSection(section)}
                className="w-full flex items-center justify-between p-3 sm:p-4 hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-slate-500" />
                  ) : (
                    <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-slate-500" />
                  )}
                  <span className={`eng-badge ${SECTION_COLORS[section] || "bg-slate-500/15 border-slate-500/40 text-slate-400"}`}>
                    {SECTION_LABELS[section] || sectionItems[0]?.section_name_he || section}
                  </span>
                  <span className="text-[10px] sm:text-sm text-slate-500">
                    ({sectionItems.length})
                  </span>
                </div>
                <span className="font-bold text-amber-400 text-xs sm:text-base eng-number">
                  ₪{sectionTotal.toLocaleString("he-IL", { minimumFractionDigits: 0 })}
                </span>
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: "auto" }}
                    exit={{ height: 0 }}
                    className="overflow-hidden"
                  >
                    {/* Desktop table */}
                    <div className="hidden sm:block overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-[#0d1320] border-t border-[#1e293b]">
                            <th className="text-right font-bold px-4 py-2.5 w-16 text-slate-400">מס׳</th>
                            <th className="text-right font-bold px-4 py-2.5 text-slate-400">תיאור</th>
                            <th className="text-right font-bold px-4 py-2.5 w-20 text-slate-400">יחידה</th>
                            <th className="text-right font-bold px-4 py-2.5 w-24 text-slate-400">כמות</th>
                            <th className="text-right font-bold px-4 py-2.5 w-28 text-slate-400">מחיר ליח׳</th>
                            <th className="text-right font-bold px-4 py-2.5 w-28 text-slate-400">סה״כ</th>
                            <th className="text-right font-bold px-4 py-2.5 w-36 text-slate-400">תקן</th>
                            <th className="w-20 px-4 py-2.5"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {sectionItems.map((item) => (
                            <tr key={item.id} className="hover:bg-white/[0.02] border-t border-[#1e293b]/50">
                              <td className="text-sm text-slate-500 eng-mono px-4 py-2.5">
                                {item.item_number || "-"}
                              </td>
                              <td className="text-sm font-medium text-slate-200 px-4 py-2.5">
                                {item.description}
                                {item.notes && (
                                  <p className="text-xs text-slate-500 mt-1">{item.notes}</p>
                                )}
                              </td>
                              <td className="text-sm text-slate-400 px-4 py-2.5">
                                {UNIT_LABELS[item.unit] || item.unit}
                              </td>
                              <td className="px-4 py-2.5">
                                {editingId === item.id ? (
                                  <Input
                                    type="number"
                                    value={editData.quantity}
                                    onChange={(e) =>
                                      setEditData({ ...editData, quantity: e.target.value })
                                    }
                                    className="h-8 w-20 text-sm bg-[#0d1320] border-[#1e293b] text-slate-200"
                                  />
                                ) : (
                                  <span className="text-sm font-medium text-slate-300 eng-number">
                                    {item.quantity?.toLocaleString("he-IL")}
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-2.5">
                                {editingId === item.id ? (
                                  <Input
                                    type="number"
                                    value={editData.unit_price}
                                    onChange={(e) =>
                                      setEditData({ ...editData, unit_price: e.target.value })
                                    }
                                    className="h-8 w-24 text-sm bg-[#0d1320] border-[#1e293b] text-slate-200"
                                  />
                                ) : (
                                  <span className="text-sm text-slate-400 eng-number">
                                    ₪{(item.unit_price || 0).toLocaleString("he-IL")}
                                  </span>
                                )}
                              </td>
                              <td className="text-sm font-bold text-amber-400 px-4 py-2.5 eng-number">
                                ₪{(item.total_price || 0).toLocaleString("he-IL")}
                              </td>
                              <td className="text-xs text-slate-500 px-4 py-2.5 eng-mono">
                                {item.standard_reference || "-"}
                              </td>
                              <td className="px-4 py-2.5">
                                {editingId === item.id ? (
                                  <div className="flex gap-1">
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-7 w-7 text-emerald-400 hover:bg-emerald-500/10"
                                      onClick={() => saveEdit(item)}
                                    >
                                      <Check className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-7 w-7 text-rose-400 hover:bg-rose-500/10"
                                      onClick={cancelEdit}
                                    >
                                      <X className="w-4 h-4" />
                                    </Button>
                                  </div>
                                ) : (
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-7 w-7 text-slate-500 hover:text-amber-400 hover:bg-amber-500/10"
                                    onClick={() => startEdit(item)}
                                  >
                                    <Pencil className="w-3.5 h-3.5" />
                                  </Button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile cards */}
                    <div className="sm:hidden divide-y divide-[#1e293b]/50">
                      {sectionItems.map((item) => (
                        <MobileItemCard
                          key={item.id}
                          item={item}
                          editingId={editingId}
                          editData={editData}
                          setEditData={setEditData}
                          startEdit={startEdit}
                          cancelEdit={cancelEdit}
                          saveEdit={saveEdit}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}

      {/* Grand Total */}
      {items.length > 0 && (
        <div className="bg-gradient-to-l from-amber-600 to-amber-500 text-[#0a0f1a] p-4 sm:p-5 flex items-center justify-between" style={{ borderRadius: 0 }}>
          <span className="text-sm sm:text-base font-bold">סה״כ כללי <span className="eng-mono text-[9px] tracking-wider mr-2 opacity-60">GRAND TOTAL</span></span>
          <span className="text-lg sm:text-2xl font-black eng-mono">
            ₪{grandTotal.toLocaleString("he-IL", { minimumFractionDigits: 0 })}
          </span>
        </div>
      )}
    </div>
  );
}

function MobileItemCard({ item, editingId, editData, setEditData, startEdit, cancelEdit, saveEdit }) {
  const isEditing = editingId === item.id;

  return (
    <div className="p-3 hover:bg-white/[0.02]">
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <p className="text-xs font-medium text-slate-200 leading-relaxed flex-1">
          {item.description}
        </p>
        {isEditing ? (
          <div className="flex gap-1 shrink-0">
            <Button size="icon" variant="ghost" className="h-6 w-6 text-emerald-400" onClick={() => saveEdit(item)}>
              <Check className="w-3.5 h-3.5" />
            </Button>
            <Button size="icon" variant="ghost" className="h-6 w-6 text-rose-400" onClick={cancelEdit}>
              <X className="w-3.5 h-3.5" />
            </Button>
          </div>
        ) : (
          <Button size="icon" variant="ghost" className="h-6 w-6 text-slate-500 shrink-0" onClick={() => startEdit(item)}>
            <Pencil className="w-3 h-3" />
          </Button>
        )}
      </div>

      {item.notes && (
        <p className="text-[10px] text-slate-500 mb-1.5">{item.notes}</p>
      )}

      <div className="flex items-center gap-3 text-[10px] text-slate-500">
        {item.item_number && <span className="eng-mono">{item.item_number}</span>}
        <span>{UNIT_LABELS[item.unit] || item.unit}</span>
        {item.standard_reference && <span className="text-slate-600 eng-mono">{item.standard_reference}</span>}
      </div>

      <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#1e293b]">
        {isEditing ? (
          <div className="flex gap-2 flex-1">
            <div className="flex-1">
              <label className="text-[10px] text-slate-500 block mb-0.5">כמות</label>
              <Input
                type="number"
                value={editData.quantity}
                onChange={(e) => setEditData({ ...editData, quantity: e.target.value })}
                className="h-7 text-xs bg-[#0d1320] border-[#1e293b] text-slate-200"
              />
            </div>
            <div className="flex-1">
              <label className="text-[10px] text-slate-500 block mb-0.5">מחיר</label>
              <Input
                type="number"
                value={editData.unit_price}
                onChange={(e) => setEditData({ ...editData, unit_price: e.target.value })}
                className="h-7 text-xs bg-[#0d1320] border-[#1e293b] text-slate-200"
              />
            </div>
          </div>
        ) : (
          <>
            <div className="flex gap-3 text-[11px] text-slate-500">
              <span className="eng-number">{item.quantity?.toLocaleString("he-IL")} × ₪{(item.unit_price || 0).toLocaleString("he-IL")}</span>
            </div>
            <span className="text-xs font-bold text-amber-400 eng-number">
              ₪{(item.total_price || 0).toLocaleString("he-IL")}
            </span>
          </>
        )}
      </div>
    </div>
  );
}
