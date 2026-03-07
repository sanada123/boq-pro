import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/apiClient";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Plus, Settings2, DollarSign, Calculator, User, Save } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import StandardCard from "../components/settings/StandardCard";
import StandardFormDialog from "../components/settings/StandardFormDialog";
import PriceCard from "../components/settings/PriceCard";
import PriceFormDialog from "../components/settings/PriceFormDialog";
import FormulaCard from "../components/settings/FormulaCard";
import FormulaFormDialog from "../components/settings/FormulaFormDialog";

const DEFAULT_STANDARDS = [
  { section: "earthworks", section_name_he: "עבודות עפר", standard_reference: 'ת"י 1491', description: "עבודות חפירה, מילוי והידוק קרקע", waste_factor: 10, is_active: true },
  { section: "concrete_foundations", section_name_he: "בטון ויסודות", standard_reference: 'ת"י 118', description: "יציקת בטון, ברזל זיון, תבניות ויסודות", waste_factor: 8, is_active: true },
  { section: "skeleton", section_name_he: "שלד", standard_reference: 'ת"י 466', description: "עמודים, קורות, תקרות, קירות בניה ומבנה שלד", waste_factor: 5, is_active: true },
  { section: "piles", section_name_he: "כלונסאות", standard_reference: 'ת"י 466', description: "כלונסאות קידוח, כלונסאות מוכנות, ראשי כלונסאות", waste_factor: 5, is_active: true },
  { section: "masonry", section_name_he: "בנייה ובלוקים", standard_reference: 'ת"י 2378', description: "קירות בלוקים, חגורות, משקופים, מילוי בטון בבלוקים", waste_factor: 10, is_active: true },
  { section: "plaster", section_name_he: "טיח", standard_reference: 'ת"י 1920', description: "טיח חוץ ופנים, שכבת בסיס וגמר", waste_factor: 12, is_active: true },
  { section: "paint", section_name_he: "צבע", standard_reference: 'ת"י 7', description: "צביעה פנימית וחיצונית, יסוד וגמר", waste_factor: 10, is_active: true },
  { section: "tiling", section_name_he: "ריצוף", standard_reference: 'ת"י 1555', description: "ריצוף רצפה וחיפוי קירות, פיתוח וריצוף חוץ", waste_factor: 12, is_active: true },
  { section: "gypsum", section_name_he: "גבס", standard_reference: 'ת"י 4283', description: "מחיצות גבס, תקרות גבס, עבודות גבס שונות", waste_factor: 8, is_active: true },
  { section: "windows_doors", section_name_he: "חלונות ודלתות", standard_reference: 'ת"י 23', description: "חלונות אלומיניום, דלתות עץ/פלדה/אלומיניום, תריסים", waste_factor: 3, is_active: true },
  { section: "acoustic_ceiling", section_name_he: "תקרות אקוסטיות", standard_reference: 'ת"י 1372', description: "תקרות אקוסטיות, תקרות מתכת, מערכת תליה", waste_factor: 8, is_active: true },
  { section: "misc", section_name_he: "שונות", standard_reference: "-", description: "פריטים שונים שאינם שייכים לסעיף ספציפי", waste_factor: 10, is_active: true },
];

const DEFAULT_PRICES = [
  { category: "earthworks", category_name_he: "עבודות עפר", item_name: "Excavation", item_name_he: "חפירה", unit: "m3", unit_name_he: 'מ"ק', price: 35, sort_order: 1 },
  { category: "earthworks", category_name_he: "עבודות עפר", item_name: "Backfill & compaction", item_name_he: "מילוי והידוק", unit: "m3", unit_name_he: 'מ"ק', price: 25, sort_order: 2 },
  { category: "concrete", category_name_he: "בטון", item_name: "Lean concrete B10", item_name_he: "בטון רזה B10", unit: "m3", unit_name_he: 'מ"ק', price: 380, sort_order: 3 },
  { category: "concrete", category_name_he: "בטון", item_name: "Structural concrete B30", item_name_he: "בטון קונסטרוקטיבי B30", unit: "m3", unit_name_he: 'מ"ק', price: 550, sort_order: 4 },
  { category: "concrete", category_name_he: "בטון", item_name: "Structural concrete B40", item_name_he: "בטון קונסטרוקטיבי B40", unit: "m3", unit_name_he: 'מ"ק', price: 650, sort_order: 5 },
  { category: "steel", category_name_he: "פלדה/זיון", item_name: "Reinforcement steel 60/40", item_name_he: "ברזל זיון 60/40", unit: "ton", unit_name_he: "טון", price: 6500, sort_order: 6 },
  { category: "formwork", category_name_he: "תבניות", item_name: "Formwork foundations", item_name_he: "תבניות ליסודות", unit: "m2", unit_name_he: 'מ"ר', price: 120, sort_order: 7 },
  { category: "formwork", category_name_he: "תבניות", item_name: "Formwork columns", item_name_he: "תבניות לעמודים", unit: "m2", unit_name_he: 'מ"ר', price: 180, sort_order: 8 },
  { category: "formwork", category_name_he: "תבניות", item_name: "Formwork beams", item_name_he: "תבניות לקורות", unit: "m2", unit_name_he: 'מ"ר', price: 160, sort_order: 9 },
  { category: "formwork", category_name_he: "תבניות", item_name: "Formwork slabs", item_name_he: "תבניות לתקרה", unit: "m2", unit_name_he: 'מ"ר', price: 140, sort_order: 10 },
  { category: "masonry", category_name_he: "בנייה", item_name: "Concrete blocks 20cm", item_name_he: "בלוקים 20 ס״מ", unit: "m2", unit_name_he: 'מ"ר', price: 120, sort_order: 11 },
  { category: "masonry", category_name_he: "בנייה", item_name: "Concrete blocks 10cm", item_name_he: "בלוקים 10 ס״מ", unit: "m2", unit_name_he: 'מ"ר', price: 85, sort_order: 12 },
  { category: "misc", category_name_he: "שונות", item_name: "Concrete lintels", item_name_he: "משקופי בטון", unit: "ml", unit_name_he: 'מ"א', price: 150, sort_order: 13 },
];

const DEFAULT_FORMULAS = [
  { element_type: "strip_foundations", element_name_he: "יסודות רצועה (בטון)", formula: "perimeter × foundation_width × foundation_depth", formula_description_he: "היקף × רוחב × עומק", default_values: "כל המידות מהתכנית", waste_factor: 8, section: "concrete_foundations", is_editable: true, sort_order: 1 },
  { element_type: "slab_on_grade", element_name_he: "רצפת בטון (רפסודה)", formula: "footprint_area × slab_thickness", formula_description_he: "שטח × עובי", default_values: "כל המידות מהתכנית", waste_factor: 8, section: "concrete_foundations", is_editable: true, sort_order: 2 },
  { element_type: "concrete_columns", element_name_he: "עמודי בטון", formula: "count × section_area × height", formula_description_he: "כמות × חתך × גובה", default_values: "כל המידות מהתכנית", waste_factor: 8, section: "skeleton", is_editable: true, sort_order: 3 },
  { element_type: "beams", element_name_he: "קורות בטון", formula: "span × width × depth", formula_description_he: "אורך × רוחב × עומק", default_values: "כל המידות מהתכנית", waste_factor: 8, section: "skeleton", is_editable: true, sort_order: 4 },
  { element_type: "roof_slab", element_name_he: "תקרת/פלטת בטון", formula: "area × thickness", formula_description_he: "שטח × עובי", default_values: "כל המידות מהתכנית", waste_factor: 8, section: "skeleton", is_editable: true, sort_order: 5 },
  { element_type: "block_walls", element_name_he: "קירות בלוקים", formula: "length × height", formula_description_he: "אורך × גובה", default_values: "כל המידות מהתכנית", waste_factor: 10, section: "skeleton", is_editable: true, sort_order: 6 },
  { element_type: "formwork", element_name_he: "תבניות (טפסנות)", formula: "exposed_concrete_surfaces", formula_description_he: "משטחי בטון חשופים", default_values: "", waste_factor: 10, section: "concrete_foundations", is_editable: false, sort_order: 7 },
];

const SECTION_ORDER = ["earthworks", "concrete_foundations", "skeleton", "piles", "masonry", "plaster", "paint", "tiling", "gypsum", "windows_doors", "acoustic_ceiling", "misc"];

export default function Settings() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("standards");
  const [showStandardForm, setShowStandardForm] = useState(false);
  const [editingStandard, setEditingStandard] = useState(null);
  const [showPriceForm, setShowPriceForm] = useState(false);
  const [editingPrice, setEditingPrice] = useState(null);
  const [showFormulaForm, setShowFormulaForm] = useState(false);
  const [editingFormula, setEditingFormula] = useState(null);
  const [initializing, setInitializing] = useState({});
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileForm, setProfileForm] = useState(null);

  const { data: user } = useQuery({ queryKey: ["currentUser"], queryFn: () => api.auth.me() });
  const { data: standards, isLoading: ls } = useQuery({ queryKey: ["standards", user?.email], queryFn: () => api.entities.EngineerStandard.filter({ created_by: user.email }), enabled: !!user?.email, initialData: [] });
  const { data: prices, isLoading: lp } = useQuery({ queryKey: ["prices", user?.email], queryFn: () => api.entities.PriceItem.filter({ created_by: user.email }), enabled: !!user?.email, initialData: [] });
  const { data: formulas, isLoading: lf } = useQuery({ queryKey: ["formulas", user?.email], queryFn: () => api.entities.CalculationFormula.filter({ created_by: user.email }), enabled: !!user?.email, initialData: [] });
  const { data: profiles } = useQuery({ queryKey: ["profiles", user?.email], queryFn: () => api.entities.EngineerProfile.filter({ created_by: user.email }), enabled: !!user?.email, initialData: [] });

  React.useEffect(() => {
    if (profiles?.length > 0 && !profileForm) {
      const p = profiles[0];
      setProfileForm({
        designer_name: p.designer_name || "",
        company_name: p.company_name || "",
        preferred_concrete_grade: p.preferred_concrete_grade || "B30",
        preferred_steel_grade: p.preferred_steel_grade || "60/40",
        typical_slab_thickness: p.typical_slab_thickness || "0.20",
      });
    } else if (profiles?.length === 0 && !profileForm) {
      setProfileForm({
        designer_name: "",
        company_name: "",
        preferred_concrete_grade: "B30",
        preferred_steel_grade: "60/40",
        typical_slab_thickness: "0.20",
      });
    }
  }, [profiles, profileForm]);

  const initDefaults = async (type) => {
    setInitializing(prev => ({ ...prev, [type]: true }));
    if (type === "standards") await api.entities.EngineerStandard.bulkCreate(DEFAULT_STANDARDS);
    if (type === "prices") await api.entities.PriceItem.bulkCreate(DEFAULT_PRICES);
    if (type === "formulas") await api.entities.CalculationFormula.bulkCreate(DEFAULT_FORMULAS);
    queryClient.invalidateQueries({ queryKey: [type] });
    setInitializing(prev => ({ ...prev, [type]: false }));
  };

  const saveProfile = async () => {
    if (!profileForm) return;
    setProfileSaving(true);
    if (profiles?.length > 0) {
      await api.entities.EngineerProfile.update(profiles[0].id, profileForm);
    } else {
      await api.entities.EngineerProfile.create(profileForm);
    }
    queryClient.invalidateQueries({ queryKey: ["profiles"] });
    setProfileSaving(false);
  };

  if (ls || lp || lf) {
    return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-8 h-8 animate-spin text-amber-500" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-100 flex items-center gap-2">
          <Settings2 className="w-5 h-5 text-amber-400" />
          הגדרות
        </h1>
        <p className="text-sm text-slate-500">תקנים, מחירים ונוסחאות חישוב</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full grid grid-cols-4 h-10 bg-[#111827] border border-[#1e293b] rounded">
          <TabsTrigger value="standards" className="text-xs text-slate-400 data-[state=active]:bg-amber-500/10 data-[state=active]:text-amber-400 data-[state=active]:border-amber-500/30 rounded">
            תקנים
          </TabsTrigger>
          <TabsTrigger value="prices" className="text-xs text-slate-400 data-[state=active]:bg-amber-500/10 data-[state=active]:text-amber-400 data-[state=active]:border-amber-500/30 rounded">
            מחירון
          </TabsTrigger>
          <TabsTrigger value="formulas" className="text-xs text-slate-400 data-[state=active]:bg-amber-500/10 data-[state=active]:text-amber-400 data-[state=active]:border-amber-500/30 rounded">
            נוסחאות
          </TabsTrigger>
          <TabsTrigger value="profile" className="text-xs text-slate-400 data-[state=active]:bg-amber-500/10 data-[state=active]:text-amber-400 data-[state=active]:border-amber-500/30 rounded">
            פרופיל
          </TabsTrigger>
        </TabsList>

        <TabsContent value="standards" className="space-y-3 mt-4">
          <div className="flex justify-end">
            <button onClick={() => { setEditingStandard(null); setShowStandardForm(true); }}
              className="btn-eng-primary flex items-center gap-1.5 h-8 px-3 text-xs">
              <Plus className="w-3.5 h-3.5" /> הוסף
            </button>
          </div>
          {standards.length === 0 ? (
            <EmptyState label="תקנים" code="STANDARDS" onInit={() => initDefaults("standards")} loading={initializing.standards} />
          ) : (
            <div className="space-y-2">
              {standards.sort((a, b) => SECTION_ORDER.indexOf(a.section) - SECTION_ORDER.indexOf(b.section)).map(s => (
                <StandardCard key={s.id} standard={s}
                  onEdit={() => { setEditingStandard(s); setShowStandardForm(true); }}
                  onToggle={async () => { await api.entities.EngineerStandard.update(s.id, { is_active: !s.is_active }); queryClient.invalidateQueries({ queryKey: ["standards"] }); }}
                  onDelete={async () => { await api.entities.EngineerStandard.delete(s.id); queryClient.invalidateQueries({ queryKey: ["standards"] }); }}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="prices" className="space-y-3 mt-4">
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-500">מחירי שוק (₪)</span>
            <button onClick={() => { setEditingPrice(null); setShowPriceForm(true); }}
              className="btn-eng-primary flex items-center gap-1.5 h-8 px-3 text-xs">
              <Plus className="w-3.5 h-3.5" /> הוסף
            </button>
          </div>
          {prices.length === 0 ? (
            <EmptyState label="מחירון" code="PRICES" onInit={() => initDefaults("prices")} loading={initializing.prices} />
          ) : (
            <div className="space-y-1.5">
              {prices.sort((a, b) => (a.sort_order || 99) - (b.sort_order || 99)).map(p => (
                <PriceCard key={p.id} item={p}
                  onUpdate={async (id, data) => { await api.entities.PriceItem.update(id, data); queryClient.invalidateQueries({ queryKey: ["prices"] }); }}
                  onDelete={async (id) => { await api.entities.PriceItem.delete(id); queryClient.invalidateQueries({ queryKey: ["prices"] }); }}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="formulas" className="space-y-3 mt-4">
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-500">נוסחאות חישוב</span>
            <button onClick={() => { setEditingFormula(null); setShowFormulaForm(true); }}
              className="btn-eng-primary flex items-center gap-1.5 h-8 px-3 text-xs">
              <Plus className="w-3.5 h-3.5" /> הוסף
            </button>
          </div>
          {formulas.length === 0 ? (
            <EmptyState label="נוסחאות" code="FORMULAS" onInit={() => initDefaults("formulas")} loading={initializing.formulas} />
          ) : (
            <div className="space-y-2">
              {formulas.sort((a, b) => (a.sort_order || 99) - (b.sort_order || 99)).map(f => (
                <FormulaCard key={f.id} formula={f}
                  onEdit={() => { setEditingFormula(f); setShowFormulaForm(true); }}
                  onToggle={async () => { await api.entities.CalculationFormula.update(f.id, { is_active: !f.is_active }); queryClient.invalidateQueries({ queryKey: ["formulas"] }); }}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="profile" className="space-y-4 mt-4">
          {profileForm && (
            <div className="eng-card p-4 sm:p-6 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-sm text-slate-200">פרופיל מהנדס</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs sm:text-sm text-slate-400">שם המתכנן</Label>
                  <Input value={profileForm.designer_name} onChange={(e) => setProfileForm({ ...profileForm, designer_name: e.target.value })}
                    className="h-9 text-xs sm:text-sm bg-[#0d1320] border-[#1e293b] text-slate-200 placeholder:text-slate-600" placeholder="מהנדס ראשי" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs sm:text-sm text-slate-400">חברה</Label>
                  <Input value={profileForm.company_name} onChange={(e) => setProfileForm({ ...profileForm, company_name: e.target.value })}
                    className="h-9 text-xs sm:text-sm bg-[#0d1320] border-[#1e293b] text-slate-200 placeholder:text-slate-600" placeholder="שם החברה" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs sm:text-sm text-slate-400">דרגת בטון מועדפת</Label>
                  <Input value={profileForm.preferred_concrete_grade} onChange={(e) => setProfileForm({ ...profileForm, preferred_concrete_grade: e.target.value })}
                    className="h-9 text-xs sm:text-sm bg-[#0d1320] border-[#1e293b] text-slate-200 eng-mono" placeholder="B30" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs sm:text-sm text-slate-400">דרגת פלדה מועדפת</Label>
                  <Input value={profileForm.preferred_steel_grade} onChange={(e) => setProfileForm({ ...profileForm, preferred_steel_grade: e.target.value })}
                    className="h-9 text-xs sm:text-sm bg-[#0d1320] border-[#1e293b] text-slate-200 eng-mono" placeholder="60/40" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs sm:text-sm text-slate-400">עובי תקרה טיפוסי (מ׳)</Label>
                  <Input value={profileForm.typical_slab_thickness} onChange={(e) => setProfileForm({ ...profileForm, typical_slab_thickness: e.target.value })}
                    className="h-9 text-xs sm:text-sm bg-[#0d1320] border-[#1e293b] text-slate-200 eng-mono" placeholder="0.20" />
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <button onClick={saveProfile} disabled={profileSaving}
                  className="btn-eng-primary flex items-center gap-2 h-9 px-5 text-xs font-semibold disabled:opacity-50">
                  {profileSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  שמור פרופיל
                </button>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {showStandardForm && <StandardFormDialog standard={editingStandard} onSaved={() => { setShowStandardForm(false); setEditingStandard(null); queryClient.invalidateQueries({ queryKey: ["standards"] }); }} onClose={() => { setShowStandardForm(false); setEditingStandard(null); }} />}
      {showPriceForm && <PriceFormDialog item={editingPrice} onSaved={() => { setShowPriceForm(false); setEditingPrice(null); queryClient.invalidateQueries({ queryKey: ["prices"] }); }} onClose={() => { setShowPriceForm(false); setEditingPrice(null); }} />}
      {showFormulaForm && <FormulaFormDialog formula={editingFormula} onSaved={() => { setShowFormulaForm(false); setEditingFormula(null); queryClient.invalidateQueries({ queryKey: ["formulas"] }); }} onClose={() => { setShowFormulaForm(false); setEditingFormula(null); }} />}
    </div>
  );
}

function EmptyState({ label, code, onInit, loading }) {
  return (
    <div className="eng-card text-center py-10">
      <p className="text-sm text-slate-400 mb-4">לא הוגדרו {label} עדיין</p>
      <button onClick={onInit} disabled={loading}
        className="btn-eng-primary flex items-center gap-2 h-9 px-5 text-xs font-semibold mx-auto disabled:opacity-50">
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
        טען {label} סטנדרטיים
      </button>
    </div>
  );
}
