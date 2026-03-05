import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { createPageUrl } from "../utils";
import { api } from "@/api/apiClient";
import { motion } from "framer-motion";
import { Building2, ArrowLeft, ArrowRight, Check, Loader2, FileSpreadsheet, Calculator, Shield, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import WorkTypeStep from "../components/wizard/WorkTypeStep";
import FloorsStep from "../components/wizard/FloorsStep";
import PlansUploadStep from "../components/wizard/PlansUploadStep";
import AnalysisProgress from "../components/analysis/AnalysisProgress";
import PlanReviewStep from "../components/analysis/PlanReviewStep";
import UnclearItemsDialog from "../components/analysis/UnclearItemsDialog";
import {
  buildPass0TablePrompt,
  buildPass1aLegendPrompt,
  buildPass1bElementsPrompt,
  buildMultiPlanMergePrompt,
  buildPass2Prompt,
  buildPass3Prompt,
  buildStandardsSection,
  buildFormulasSection,
  buildPriceTable,
} from "../components/analysis/prompts";
import { extractPdfTiles, extractPdfFullPage } from "../components/analysis/pdfTiling";

const WIZARD_STEPS = [
  { key: "info", label: "פרטי פרויקט" },
  { key: "work_type", label: "סוג עבודה" },
  { key: "floors", label: "קומות" },
  { key: "plans", label: "העלאת תכניות" },
];

export default function Home() {
  const navigate = useNavigate();

  // Wizard state
  const [wizardStep, setWizardStep] = useState(0);
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [workType, setWorkType] = useState("");
  const [categories, setCategories] = useState([]);
  const [floors, setFloors] = useState([]);

  // Analysis state
  const [step, setStep] = useState("wizard"); // wizard | analyzing | review
  const [analysisStep, setAnalysisStep] = useState("upload");
  const [pass1Summary, setPass1Summary] = useState(null);
  const [planReadingData, setPlanReadingData] = useState(null);
  const [projectRef, setProjectRef] = useState(null);
  const [settingsRef, setSettingsRef] = useState(null);
  const [engineerProfile, setEngineerProfile] = useState(null);
  const [unclearData, setUnclearData] = useState(null);
  const [pendingAnalysis, setPendingAnalysis] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [analysisError, setAnalysisError] = useState(null);

  // Resume support
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const resumeId = params.get("resume");
    if (resumeId) resumeProject(resumeId);
  }, []);

  const { data: user } = useQuery({ queryKey: ["currentUser"], queryFn: () => api.auth.me() });
  const { data: pendingProjects } = useQuery({
    queryKey: ["pendingProjects", user?.email],
    queryFn: () => api.entities.Project.filter({ created_by: user.email, status: "review_pending" }, "-created_date"),
    enabled: !!user?.email && step === "wizard",
    initialData: [],
  });

  const resumeProject = async (projectId) => {
    const projects = await api.entities.Project.filter({ id: projectId });
    const project = projects[0];
    if (!project) return;
    setProjectRef(project);
    const planReadings = await api.entities.PlanReading.filter({ project_id: projectId });
    if (planReadings.length > 0) {
      const pr = planReadings[0];
      const parseArr = (arr) => (arr || []).map(item => { if (typeof item === "string") { try { return JSON.parse(item); } catch { return item; } } return item; });
      const readingData = {
        plan_type: pr.plan_type, plan_type_category: pr.plan_type_category,
        scale: pr.scale, title_info: pr.title_info, elements: parseArr(pr.elements),
        legend: pr.legend, sections_cuts: parseArr(pr.sections_cuts),
        reinforcement_schedule: parseArr(pr.reinforcement_details),
        unclear_items: pr.unclear_items || [], confidence_notes: pr.confidence_notes,
        detected_patterns: [],
      };
      setPlanReadingData(readingData);
      setSettingsRef(await loadSettings());
      setStep("review");
    }
  };

  const loadSettings = async () => {
    const currentUser = await api.auth.me();
    let standards = [], prices = [], formulas = [], profile = null;
    if (currentUser?.email) {
      const [s, p, f, profiles] = await Promise.all([
        api.entities.EngineerStandard.filter({ created_by: currentUser.email }),
        api.entities.PriceItem.filter({ created_by: currentUser.email }),
        api.entities.CalculationFormula.filter({ created_by: currentUser.email }),
        api.entities.EngineerProfile.filter({ created_by: currentUser.email }),
      ]);
      standards = s; prices = p; formulas = f;
      profile = profiles[0] || null;
    }
    setEngineerProfile(profile);
    return { standards, prices, formulas, profile };
  };

  // === WIZARD NAVIGATION ===
  const canGoNext = () => {
    if (wizardStep === 0) return projectName.trim().length > 0;
    if (wizardStep === 1) return workType && categories.length > 0;
    if (wizardStep === 2) return floors.length > 0;
    if (wizardStep === 3) return floors.some(f => (f.plans || []).length > 0);
    return false;
  };

  // === START ANALYSIS ===
  const handleStartAnalysis = async () => {
    setAnalysisError(null);
    let project = null;

    try {
    // Create project
    const allPlanUrls = [];
    const firstPlan = floors.find(f => (f.plans || []).length > 0)?.plans?.[0];

    project = await api.entities.Project.create({
      name: projectName.trim(),
      description: projectDescription.trim(),
      work_type: workType,
      work_categories: categories,
      floors: floors.map(f => JSON.stringify({
        name: f.name, label: f.label, is_typical: f.is_typical,
        typical_count: f.typical_count || 1,
        plans: (f.plans || []).map(p => ({ file_url: p.file_url, file_type: p.file_type, plan_category: p.plan_category })),
      })),
      file_url: firstPlan?.file_url || "",
      file_type: firstPlan?.file_type || "pdf",
      status: "analyzing",
    });
    setProjectRef(project);

    // Collect all plans
    floors.forEach(f => {
      (f.plans || []).forEach(p => {
        allPlanUrls.push({ ...p, floor_label: f.label, floor_name: f.name });
      });
    });

    setStep("analyzing");
    const settings = await loadSettings();
    setSettingsRef(settings);
    setAnalysisStep("reading");

    const uploadFile = async (file) => {
      return await api.integrations.Core.UploadFile({ file });
    };
    // For each plan: extract text, render high-res tiles, then run 3-stage LLM analysis
    const readings = [];
    for (const plan of allPlanUrls) {
      // 1. Extract text from PDF (best effort)
      setAnalysisStep("upload");
      let extractedText = null;
      try {
        const pdfResult = await api.functions.invoke('processPdf', { file_url: plan.file_url });
        if (pdfResult.data?.full_text) extractedText = pdfResult.data.full_text;
      } catch (e) {
        console.log("PDF text extraction skipped for", plan.file_url, e);
      }

      // 2. Render PDF to high-res tiles (4x scale, 128px overlap, binarized)
      const isPdf = (plan.file_type === "pdf") || plan.file_url?.toLowerCase().endsWith(".pdf");
      let fileUrls = [plan.file_url];
      let fullPageUrls = [plan.file_url];

      if (isPdf) {
        setAnalysisStep("upload"); // Show "upload" during tiling — this takes time
        try {
          console.log("[Analysis] Starting PDF tiling for", plan.file_url);
          const tiles = await extractPdfTiles(plan.file_url, uploadFile);
          if (tiles.length > 0) {
            console.log(`[Analysis] Created ${tiles.length} tiles, now rendering full pages`);
            const fullPages = await extractPdfFullPage(plan.file_url, uploadFile);
            fullPageUrls = fullPages.map(fp => fp.file_url);
            fileUrls = [...fullPageUrls, ...tiles.map(t => t.file_url)];
            console.log(`[Analysis] Total ${fileUrls.length} images ready for LLM`);
          }
        } catch (e) {
          console.log("PDF tiling failed, falling back to raw PDF", plan.file_url, e);
          fileUrls = [plan.file_url];
          fullPageUrls = [plan.file_url];
        }
      }

      const tileInfo = fileUrls.length > 1
        ? `\n\nהערה: התכנית רונדרה ברזולוציה גבוהה (4x, binarized) ונחתכה ל-${fileUrls.length} תמונות עם חפיפה בין אריחים. התמונה הראשונה היא סקירה כללית, השאר אריחים ברזולוציה גבוהה. נתח את כולם יחד.`
        : "";

      // === PASS 0: חילוץ טבלאות ייעודי (full-page images only) ===
      setAnalysisStep("tables");
      let tableContext = null;
      try {
        tableContext = await api.integrations.Core.InvokeLLM({
          prompt: buildPass0TablePrompt(),
          file_urls: fullPageUrls,
          response_json_schema: getPass0Schema(),
        });
        console.log("Pass 0 tables:", tableContext);
      } catch (e) {
        console.log("Pass 0 table extraction failed, continuing without tables", e);
      }

      // === PASS 1a: זיהוי מקרא וסוג תכנית בלבד ===
      setAnalysisStep("legend");
      let pass1aContext = null;
      try {
        pass1aContext = await api.integrations.Core.InvokeLLM({
          prompt: buildPass1aLegendPrompt(extractedText, tableContext) + tileInfo,
          file_urls: fileUrls,
          response_json_schema: getPass1aSchema(),
        });
        console.log("Pass 1a legend:", pass1aContext);
      } catch (e) {
        console.log("Pass 1a failed, continuing without legend context", e);
      }

      // === PASS 1b: חילוץ אלמנטים מלא עם הקשר מ-1a ו-0 ===
      setAnalysisStep("reading");
      const result = await api.integrations.Core.InvokeLLM({
        prompt: buildPass1bElementsPrompt(settings.profile, workType, categories, extractedText, pass1aContext, tableContext) + tileInfo,
        file_urls: fileUrls,
        response_json_schema: getPass1Schema(),
      });

      // Enrich result with Pass 1a legend/title if Pass 1b missed them
      if (pass1aContext) {
        if (!result.legend || Object.keys(result.legend).length === 0) result.legend = pass1aContext.legend;
        if (!result.scale) result.scale = pass1aContext.scale;
        if (!result.title_info?.project_name) result.title_info = pass1aContext.title_info;
      }

      readings.push({ ...result, _floor: plan.floor_label, _plan_category: plan.plan_category });
    }

    // Merge if multiple plans
    let finalReading;
    if (readings.length > 1) {
      finalReading = await api.integrations.Core.InvokeLLM({
        prompt: buildMultiPlanMergePrompt(readings),
        response_json_schema: getPass1Schema(),
      });
    } else {
      finalReading = readings[0];
    }

    setPass1Summary({ plan_type: finalReading.plan_type || "לא זוהה", element_count: finalReading.elements?.length || 0, unclear_count: finalReading.unclear_items?.length || 0 });

    // Save PlanReading
    const toStringArray = (arr) => (arr || []).map(item => typeof item === "string" ? item : JSON.stringify(item));
    await api.entities.PlanReading.create({
      project_id: project.id, plan_type: finalReading.plan_type, plan_type_category: finalReading.plan_type_category,
      scale: finalReading.scale, title_info: finalReading.title_info, elements: toStringArray(finalReading.elements),
      legend: finalReading.legend, sections_cuts: toStringArray(finalReading.sections_cuts),
      reinforcement_details: toStringArray(finalReading.reinforcement_schedule), tables: toStringArray(finalReading.tables),
      text_annotations: toStringArray(finalReading.text_annotations), unclear_items: toStringArray(finalReading.unclear_items),
      confidence_notes: finalReading.confidence_notes,
    });

    await api.entities.Project.update(project.id, { status: "review_pending" });
    setPlanReadingData(finalReading);
    setStep("review");
    } catch (err) {
      console.error("[Analysis] Pipeline failed:", err);
      setAnalysisError(err.message || "שגיאה בניתוח התכנית");
      if (project?.id) {
        try { await api.entities.Project.update(project.id, { status: "error", analysis_notes: `Error: ${err.message}` }); } catch {}
      }
    }
  };

  // === REVIEW HANDLERS ===
  const handleApproveReading = async () => {
    setIsSubmitting(true);
    await runQuantitiesAndPricing(planReadingData, []);
  };

  const handleCorrections = async (correctionsList) => {
    setIsSubmitting(true);
    const planReadings = await api.entities.PlanReading.filter({ project_id: projectRef.id });
    if (planReadings.length > 0) {
      await api.entities.PlanReading.update(planReadings[0].id, { user_corrections: correctionsList, is_verified: true });
    }
    await learnFromCorrections(correctionsList);
    await runQuantitiesAndPricing(planReadingData, correctionsList);
  };

  const learnFromCorrections = async (correctionsList) => {
    if (!correctionsList?.length) return;
    const currentUser = await api.auth.me();
    const profiles = await api.entities.EngineerProfile.filter({ created_by: currentUser.email });
    const corrTexts = correctionsList.map(c => {
      const el = planReadingData.elements?.[c.element_index];
      return `${c.element_id} (${el?.type || ""}): ${Object.entries(c.corrections).map(([k, v]) => `${k}=${v}`).join(", ")}`;
    });
    if (profiles.length > 0) {
      const history = [...(profiles[0].correction_history || []), ...corrTexts].slice(-50);
      await api.entities.EngineerProfile.update(profiles[0].id, { correction_history: history });
    } else {
      await api.entities.EngineerProfile.create({ correction_history: corrTexts });
    }
  };

  const runQuantitiesAndPricing = async (pass1Data, correctionsList) => {
    setStep("analyzing");
    setAnalysisError(null);
    await api.entities.Project.update(projectRef.id, { status: "analyzing" });
    const settings = settingsRef;
    const formulasSection = buildFormulasSection(settings.formulas);
    const standardsSection = buildStandardsSection(settings.standards);
    const priceTable = buildPriceTable(settings.prices);

    let correctedPass1 = { ...pass1Data };
    if (correctionsList.length > 0) {
      correctedPass1 = { ...pass1Data, elements: [...(pass1Data.elements || [])] };
      correctionsList.forEach(corr => {
        const idx = corr.element_index;
        if (correctedPass1.elements[idx]) {
          const el = { ...correctedPass1.elements[idx] };
          Object.entries(corr.corrections).forEach(([key, value]) => {
            const parts = key.split(".");
            if (parts.length === 2) el[parts[0]] = { ...el[parts[0]], [parts[1]]: value };
            else el[key] = value;
          });
          correctedPass1.elements[idx] = el;
        }
      });
    }

    setAnalysisStep("quantities");
    const wt = projectRef.work_type || workType;
    const cats = projectRef.work_categories || categories;

    const pass2Result = await api.integrations.Core.InvokeLLM({
      prompt: buildPass2Prompt(correctedPass1, formulasSection, standardsSection, engineerProfile, wt, cats),
      response_json_schema: getPass2Schema(),
    });

    const hasUnclear = (correctedPass1.unclear_items?.length || 0) > 0;
    const hasSkipped = (pass2Result.skipped_elements?.length || 0) > 0;
    if (hasUnclear || hasSkipped) {
      setPendingAnalysis({ project: projectRef, pass1Result: correctedPass1, pass2Result, priceTable });
      setUnclearData({ unclearItems: correctedPass1.unclear_items || [], skippedElements: pass2Result.skipped_elements || [] });
      setIsSubmitting(false);
      return;
    }
    await runPass3AndSave(projectRef, correctedPass1, pass2Result, priceTable, []);
  };

  const handleClarifications = async (clarifications) => {
    setUnclearData(null);
    if (!pendingAnalysis) return;
    const { project, pass1Result, pass2Result, priceTable } = pendingAnalysis;
    setPendingAnalysis(null);
    setStep("analyzing");
    setIsSubmitting(true);
    await runPass3AndSave(project, pass1Result, pass2Result, priceTable, clarifications);
  };

  const runPass3AndSave = async (project, pass1Result, pass2Result, priceTable, clarifications) => {
    try {
    let finalPass2 = pass2Result;
    if (clarifications?.length > 0) {
      setAnalysisStep("quantities");
      const clarText = clarifications.map(c => `• ${c.issue}: ${c.clarification}`).join("\n");
      finalPass2 = await api.integrations.Core.InvokeLLM({
        prompt: `אתה מהנדס בניין מומחה. עדכן כמויות לפי הבהרות.\n\nכמויות:\n${JSON.stringify(pass2Result.calculated_items, null, 2)}\n\nדולגו:\n${JSON.stringify(pass2Result.skipped_elements, null, 2)}\n\nהבהרות:\n${clarText}\n\nהחזר JSON מעודכן.`,
        response_json_schema: getPass2Schema(),
      });
    }

    setAnalysisStep("pricing");
    const pass3Result = await api.integrations.Core.InvokeLLM({
      prompt: buildPass3Prompt(finalPass2, priceTable),
      response_json_schema: getPass3Schema(),
    });

    setAnalysisStep("saving");
    const combinedNotes = [
      `סוג תכנית: ${pass1Result.plan_type}`, `אלמנטים: ${pass1Result.elements?.length || 0}`,
      pass1Result.unclear_items?.length > 0 ? `לא ברורים: ${pass1Result.unclear_items.join(", ")}` : null,
      pass1Result.confidence_notes,
      finalPass2.skipped_elements?.length > 0 ? `דולגו: ${finalPass2.skipped_elements.map(s => `${s.element_ref} (${s.reason})`).join(", ")}` : null,
      pass3Result.analysis_notes,
    ].filter(Boolean).join("\n\n");

    const itemsToCreate = (pass3Result.items || []).map(item => ({
      project_id: project.id, section: item.section, section_name_he: item.section_name_he,
      item_number: item.item_number, description: item.description, unit: item.unit,
      unit_name_he: item.unit_name_he, quantity: item.quantity, unit_price: item.unit_price,
      total_price: item.total_price, notes: item.notes, standard_reference: item.standard_reference,
    }));
    if (itemsToCreate.length > 0) await api.entities.QuantityItem.bulkCreate(itemsToCreate);

    await api.entities.Project.update(project.id, {
      status: "completed", analysis_notes: combinedNotes, total_estimated_cost: pass3Result.total_estimated_cost || 0,
      quantities_data: { item_count: itemsToCreate.length, plan_type: pass1Result.plan_type_category, elements_found: pass1Result.elements?.length || 0, skipped_elements: finalPass2.skipped_elements?.length || 0 },
    });

    setIsSubmitting(false);
    setTimeout(() => navigate(createPageUrl("ProjectView") + `?id=${project.id}`), 1500);
    } catch (err) {
      console.error("[Analysis] Pass 2/3 failed:", err);
      setAnalysisError(err.message || "שגיאה בחישוב כמויות ומחירים");
      setIsSubmitting(false);
      if (project?.id) {
        try { await api.entities.Project.update(project.id, { status: "error", analysis_notes: `Error in pricing: ${err.message}` }); } catch {}
      }
    }
  };

  // === RENDER ===

  if (step === "analyzing") {
    return (
      <div className="max-w-md mx-auto mt-4 sm:mt-8">
        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}>
          {analysisError ? (
            <div className="bg-white rounded-xl border border-red-200 p-6 text-center space-y-4">
              <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto">
                <Shield className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">שגיאה בניתוח</h3>
              <p className="text-sm text-slate-500">{analysisError}</p>
              <div className="flex gap-2 justify-center pt-2">
                <Button onClick={() => { setAnalysisError(null); setStep("wizard"); setWizardStep(3); }} variant="outline" className="h-9 text-sm rounded-lg">
                  חזור לאשף
                </Button>
                <Button onClick={() => { setAnalysisError(null); handleStartAnalysis(); }} className="bg-blue-600 hover:bg-blue-700 text-white h-9 text-sm rounded-lg">
                  נסה שוב
                </Button>
              </div>
            </div>
          ) : (
            <AnalysisProgress currentStep={analysisStep} pass1Summary={pass1Summary} />
          )}
        </motion.div>
      </div>
    );
  }

  if (step === "review" && planReadingData) {
    return (
      <div className="max-w-3xl mx-auto">
        <PlanReviewStep planReading={planReadingData} onApprove={handleApproveReading} onCorrections={handleCorrections} isSubmitting={isSubmitting} />
        {unclearData && (
          <UnclearItemsDialog open={!!unclearData} onClose={() => { setUnclearData(null); handleClarifications([]); }}
            unclearItems={unclearData.unclearItems} skippedElements={unclearData.skippedElements}
            onSubmitClarifications={handleClarifications} />
        )}
      </div>
    );
  }

  // WIZARD
  return (
    <div className="max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        {/* Hero */}
        <div className="text-center pt-4 sm:pt-8 pb-2">
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            כתב כמויות<span className="text-blue-600"> אוטומטי</span>
          </h1>
          <p className="text-base sm:text-lg text-slate-500 mt-2 max-w-md mx-auto">
            העלה תכניות וקבל כתב כמויות מלא — קונסטרוקציה וגמרים
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: FileSpreadsheet, title: "קונסטרוקציה", desc: "בטון, ברזל, תבניות" },
            { icon: Calculator, title: "גמרים", desc: "טיח, צבע, ריצוף, חלונות" },
            { icon: Shield, title: "מרובה קומות", desc: "תמיכה בקומות טיפוסיות" },
            { icon: Brain, title: "AI לומד", desc: "משתפר מתיקונים" },
          ].map((f, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.06 }}
              className="bg-white rounded-xl border border-slate-200/80 p-4 text-center">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mx-auto mb-2">
                <f.icon className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-semibold text-slate-800 text-sm">{f.title}</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">{f.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Pending projects */}
        {pendingProjects?.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <h3 className="text-sm font-bold text-amber-800 mb-2">ממתינים לסקירה</h3>
            <div className="space-y-2">
              {pendingProjects.map(p => (
                <button key={p.id} onClick={() => resumeProject(p.id)}
                  className="w-full flex items-center justify-between bg-white rounded-lg border border-amber-200 p-3 hover:bg-amber-50 transition-colors text-right">
                  <div className="flex items-center gap-3">
                    <Building2 className="w-4 h-4 text-amber-600" />
                    <span className="text-sm font-semibold text-slate-800">{p.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-blue-600">
                    <span className="text-xs font-medium">המשך סקירה</span>
                    <ArrowLeft className="w-4 h-4" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Wizard Card */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
          {/* Wizard Progress */}
          <div className="flex items-center border-b border-slate-100 px-5 py-3 gap-1 overflow-x-auto">
            {WIZARD_STEPS.map((ws, i) => (
              <React.Fragment key={ws.key}>
                <button
                  onClick={() => i < wizardStep && setWizardStep(i)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                    i === wizardStep
                      ? "bg-blue-600 text-white"
                      : i < wizardStep
                      ? "bg-green-50 text-green-700 cursor-pointer hover:bg-green-100"
                      : "text-slate-300"
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    i < wizardStep ? "bg-green-500 text-white" : i === wizardStep ? "bg-white/20 text-white" : "bg-slate-100 text-slate-400"
                  }`}>
                    {i < wizardStep ? <Check className="w-3 h-3" /> : i + 1}
                  </span>
                  {ws.label}
                </button>
                {i < WIZARD_STEPS.length - 1 && <div className="w-4 h-px bg-slate-200 shrink-0" />}
              </React.Fragment>
            ))}
          </div>

          {/* Step Content */}
          <div className="p-5 sm:p-6">
            {wizardStep === 0 && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 mb-1">פרטי פרויקט</h2>
                  <p className="text-sm text-slate-500">שם הפרויקט ישמש לזיהוי בדוחות</p>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-slate-700">שם הפרויקט</Label>
                  <Input
                    placeholder='לדוגמה: "בניין מגורים ברח׳ הרצל 15"'
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="h-11 text-sm rounded-lg"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-slate-700">תיאור (אופציונלי)</Label>
                  <Textarea
                    placeholder="פרטים נוספים: כתובת, מספר יחידות, מידע רלוונטי לניתוח..."
                    value={projectDescription}
                    onChange={(e) => setProjectDescription(e.target.value)}
                    rows={2}
                    className="text-sm rounded-lg"
                  />
                </div>
              </div>
            )}

            {wizardStep === 1 && (
              <WorkTypeStep workType={workType} setWorkType={setWorkType} categories={categories} setCategories={setCategories} />
            )}

            {wizardStep === 2 && (
              <FloorsStep floors={floors} setFloors={setFloors} />
            )}

            {wizardStep === 3 && (
              <PlansUploadStep floors={floors} setFloors={setFloors} workType={workType} />
            )}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100 bg-slate-50/50">
            <Button
              variant="outline"
              onClick={() => setWizardStep(Math.max(0, wizardStep - 1))}
              disabled={wizardStep === 0}
              className="gap-1.5 text-sm h-10 rounded-lg"
            >
              <ArrowRight className="w-4 h-4" />
              חזרה
            </Button>

            {wizardStep < WIZARD_STEPS.length - 1 ? (
              <Button
                onClick={() => setWizardStep(wizardStep + 1)}
                disabled={!canGoNext()}
                className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5 text-sm h-10 px-5 rounded-lg"
              >
                הבא
                <ArrowLeft className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={handleStartAnalysis}
                disabled={!canGoNext() || isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5 text-sm h-10 px-6 rounded-lg font-semibold"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                התחל ניתוח
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// === JSON SCHEMAS ===

function getPass0Schema() {
  return {
    type: "object",
    properties: {
      reinforcement_tables: { type: "array", items: { type: "object", properties: { row_number: { type: "number" }, bar_type: { type: "string" }, diameter_mm: { type: "number" }, length_cm: { type: "number" }, quantity: { type: "number" }, total_length_m: { type: "number" }, weight_kg: { type: "number" }, steel_grade: { type: "string" }, notes: { type: "string" } } } },
      door_tables: { type: "array", items: { type: "object", properties: { number: { type: "string" }, width_cm: { type: "number" }, height_cm: { type: "number" }, type: { type: "string" }, material: { type: "string" }, notes: { type: "string" } } } },
      window_tables: { type: "array", items: { type: "object", properties: { number: { type: "string" }, width_cm: { type: "number" }, height_cm: { type: "number" }, type: { type: "string" }, glazing: { type: "string" }, notes: { type: "string" } } } },
      other_tables: { type: "array", items: { type: "object", properties: { table_name: { type: "string" }, headers: { type: "array", items: { type: "string" } }, rows: { type: "array", items: { type: "object" } } } } },
    },
  };
}

function getPass1aSchema() {
  return {
    type: "object",
    properties: {
      plan_type: { type: "string" },
      plan_type_category: { type: "string" },
      scale: { type: "string" },
      title_info: { type: "object", properties: { project_name: { type: "string" }, plan_number: { type: "string" }, date: { type: "string" }, designer: { type: "string" } } },
      legend: { type: "object", properties: { column_symbols: { type: "object" }, beam_symbols: { type: "object" }, foundation_symbols: { type: "object" }, wall_symbols: { type: "object" }, slab_symbols: { type: "object" }, material_codes: { type: "object" }, reinforcement_codes: { type: "object" }, graphic_symbols: { type: "object" }, other_symbols: { type: "object" }, window_symbols: { type: "object" }, door_symbols: { type: "object" } } },
      material_codes: { type: "array", items: { type: "string" } },
      engineer_notes: { type: "array", items: { type: "string" } },
      structural_system: { type: "string" },
    },
  };
}

function getPass1Schema() {
  return {
    type: "object",
    properties: {
      plan_type: { type: "string" }, plan_type_category: { type: "string" }, scale: { type: "string" },
      title_info: { type: "object", properties: { project_name: { type: "string" }, plan_number: { type: "string" }, date: { type: "string" }, designer: { type: "string" } } },
      legend: { type: "object", properties: { column_symbols: { type: "object" }, beam_symbols: { type: "object" }, foundation_symbols: { type: "object" }, wall_symbols: { type: "object" }, slab_symbols: { type: "object" }, material_codes: { type: "object" }, reinforcement_codes: { type: "object" }, graphic_symbols: { type: "object" }, other_symbols: { type: "object" }, window_symbols: { type: "object" }, door_symbols: { type: "object" } } },
      elements: { type: "array", items: { type: "object", properties: { id: { type: "string" }, type: { type: "string" }, category: { type: "string" }, count: { type: "number" }, is_typical: { type: "boolean" }, grid_location: { type: "string" }, dimensions: { type: "object" }, material: { type: "object" }, reinforcement: { type: "object" }, notes: { type: "string" } } } },
      sections_cuts: { type: "array", items: { type: "object" } },
      reinforcement_schedule: { type: "array", items: { type: "object", properties: { row_number: { type: "number" }, bar_type: { type: "string" }, diameter_mm: { type: "number" }, length_cm: { type: "number" }, quantity: { type: "number" }, total_length_m: { type: "number" }, weight_kg: { type: "number" }, steel_grade: { type: "string" }, notes: { type: "string" } } } },
      tables: { type: "array", items: { type: "object" } },
      text_annotations: { type: "array", items: { type: "string" } },
      unclear_items: { type: "array", items: { type: "string" } },
      confidence_notes: { type: "string" },
      detected_patterns: { type: "array", items: { type: "string" } },
    },
  };
}

function getPass2Schema() {
  return {
    type: "object",
    properties: {
      calculated_items: { type: "array", items: { type: "object", properties: { element_ref: { type: "string" }, section: { type: "string" }, section_name_he: { type: "string" }, item_number: { type: "string" }, description: { type: "string" }, unit: { type: "string" }, unit_name_he: { type: "string" }, quantity: { type: "number" }, calculation_detail: { type: "string" }, notes: { type: "string" }, standard_reference: { type: "string" } } } },
      skipped_elements: { type: "array", items: { type: "object", properties: { element_ref: { type: "string" }, reason: { type: "string" } } } },
      calculation_notes: { type: "string" },
    },
  };
}

function getPass3Schema() {
  return {
    type: "object",
    properties: {
      items: { type: "array", items: { type: "object", properties: { section: { type: "string" }, section_name_he: { type: "string" }, item_number: { type: "string" }, description: { type: "string" }, unit: { type: "string" }, unit_name_he: { type: "string" }, quantity: { type: "number" }, unit_price: { type: "number" }, total_price: { type: "number" }, notes: { type: "string" }, standard_reference: { type: "string" } } } },
      analysis_notes: { type: "string" },
      total_estimated_cost: { type: "number" },
    },
  };
}