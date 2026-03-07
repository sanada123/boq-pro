import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, FileText, Loader2 } from "lucide-react";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";

const SECTION_LABELS = {
  earthworks: "01 - עבודות עפר",
  concrete_foundations: "02 - בטון ויסודות",
  skeleton: "03 - שלד",
  piles: "04 - כלונסאות",
  masonry: "05 - בנייה ובלוקים",
  plaster: "06 - טיח",
  paint: "07 - צבע",
  tiling: "08 - ריצוף",
  gypsum: "09 - גבס",
  windows_doors: "10 - חלונות ודלתות",
  acoustic_ceiling: "11 - תקרות אקוסטיות",
  misc: "99 - שונות",
};

const UNIT_LABELS = {
  m3: 'מ"ק',
  m2: 'מ"ר',
  ml: 'מ"א',
  kg: 'ק"ג',
  ton: "טון",
  unit: "יח'",
  lump_sum: "פאושלי",
};

function setCellStyle(ws, ref, style) {
  if (!ws[ref]) ws[ref] = { v: "", t: "s" };
  ws[ref].s = style;
}

function setCell(ws, row, col, value, style) {
  const ref = XLSX.utils.encode_cell({ r: row, c: col });
  const cell = { v: value };
  if (typeof value === "number") {
    cell.t = "n";
    cell.z = '#,##0';
  } else {
    cell.t = "s";
  }
  if (style) cell.s = style;
  ws[ref] = cell;
}

// Style presets
const STYLES = {
  title: {
    font: { bold: true, sz: 16, name: "Arial", color: { rgb: "1E3A5F" } },
    alignment: { horizontal: "center", vertical: "center", wrapText: true },
  },
  subtitle: {
    font: { sz: 10, color: { rgb: "666666" }, name: "Arial" },
    alignment: { horizontal: "center", vertical: "center" },
  },
  sectionHeader: {
    font: { bold: true, sz: 12, color: { rgb: "FFFFFF" }, name: "Arial" },
    fill: { fgColor: { rgb: "1E3A5F" } },
    alignment: { horizontal: "right", vertical: "center", wrapText: true },
    border: {
      top: { style: "thin", color: { rgb: "1E3A5F" } },
      bottom: { style: "thin", color: { rgb: "1E3A5F" } },
    },
  },
  colHeader: {
    font: { bold: true, sz: 10, color: { rgb: "1E3A5F" }, name: "Arial" },
    fill: { fgColor: { rgb: "E8EDF3" } },
    alignment: { horizontal: "center", vertical: "center", wrapText: true },
    border: {
      bottom: { style: "medium", color: { rgb: "1E3A5F" } },
      top: { style: "medium", color: { rgb: "1E3A5F" } },
    },
  },
  itemRow: {
    font: { sz: 10, name: "Arial" },
    alignment: { horizontal: "right", vertical: "center", wrapText: true },
    border: {
      bottom: { style: "hair", color: { rgb: "CCCCCC" } },
    },
  },
  itemRowAlt: {
    font: { sz: 10, name: "Arial" },
    fill: { fgColor: { rgb: "F8FAFC" } },
    alignment: { horizontal: "right", vertical: "center", wrapText: true },
    border: {
      bottom: { style: "hair", color: { rgb: "CCCCCC" } },
    },
  },
  numberCell: {
    font: { sz: 10, name: "Arial" },
    alignment: { horizontal: "center", vertical: "center" },
    border: {
      bottom: { style: "hair", color: { rgb: "CCCCCC" } },
    },
  },
  numberCellAlt: {
    font: { sz: 10, name: "Arial" },
    fill: { fgColor: { rgb: "F8FAFC" } },
    alignment: { horizontal: "center", vertical: "center" },
    border: {
      bottom: { style: "hair", color: { rgb: "CCCCCC" } },
    },
  },
  moneyCell: {
    font: { sz: 10, name: "Arial" },
    alignment: { horizontal: "left", vertical: "center" },
    numFmt: '₪#,##0',
    border: {
      bottom: { style: "hair", color: { rgb: "CCCCCC" } },
    },
  },
  moneyCellAlt: {
    font: { sz: 10, name: "Arial" },
    fill: { fgColor: { rgb: "F8FAFC" } },
    alignment: { horizontal: "left", vertical: "center" },
    numFmt: '₪#,##0',
    border: {
      bottom: { style: "hair", color: { rgb: "CCCCCC" } },
    },
  },
  sectionTotal: {
    font: { bold: true, sz: 10, color: { rgb: "1E3A5F" }, name: "Arial" },
    fill: { fgColor: { rgb: "EEF2F7" } },
    alignment: { horizontal: "right", vertical: "center" },
    border: {
      top: { style: "thin", color: { rgb: "1E3A5F" } },
      bottom: { style: "double", color: { rgb: "1E3A5F" } },
    },
  },
  sectionTotalMoney: {
    font: { bold: true, sz: 10, color: { rgb: "1E3A5F" }, name: "Arial" },
    fill: { fgColor: { rgb: "EEF2F7" } },
    alignment: { horizontal: "left", vertical: "center" },
    numFmt: '₪#,##0',
    border: {
      top: { style: "thin", color: { rgb: "1E3A5F" } },
      bottom: { style: "double", color: { rgb: "1E3A5F" } },
    },
  },
  grandTotal: {
    font: { bold: true, sz: 13, color: { rgb: "FFFFFF" }, name: "Arial" },
    fill: { fgColor: { rgb: "1E3A5F" } },
    alignment: { horizontal: "right", vertical: "center" },
    border: {
      top: { style: "medium", color: { rgb: "1E3A5F" } },
      bottom: { style: "medium", color: { rgb: "1E3A5F" } },
    },
  },
  grandTotalMoney: {
    font: { bold: true, sz: 13, color: { rgb: "FFFFFF" }, name: "Arial" },
    fill: { fgColor: { rgb: "1E3A5F" } },
    alignment: { horizontal: "left", vertical: "center" },
    numFmt: '₪#,##0',
    border: {
      top: { style: "medium", color: { rgb: "1E3A5F" } },
      bottom: { style: "medium", color: { rgb: "1E3A5F" } },
    },
  },
  notesStyle: {
    font: { sz: 9, color: { rgb: "888888" }, name: "Arial" },
    alignment: { horizontal: "right", vertical: "center", wrapText: true },
    border: {
      bottom: { style: "hair", color: { rgb: "CCCCCC" } },
    },
  },
};

export default function ExportButton({ items, projectName }) {
  const [exporting, setExporting] = useState(false);

  const exportToExcel = () => {
    setExporting(true);

    const ws = {};
    let row = 0;
    const COLS = 8; // 0-7

    // ── Title ──
    setCell(ws, row, 0, `כתב כמויות — ${projectName}`, STYLES.title);
    ws["!merges"] = ws["!merges"] || [];
    ws["!merges"].push({ s: { r: row, c: 0 }, e: { r: row, c: COLS } });
    row++;

    setCell(ws, row, 0, `תאריך הפקה: ${new Date().toLocaleDateString("he-IL")} | הופק אוטומטית ע"י כתב כמויות PRO`, STYLES.subtitle);
    ws["!merges"].push({ s: { r: row, c: 0 }, e: { r: row, c: COLS } });
    row++;
    row++; // empty row

    // ── Column Headers ──
    const headers = ["מס' פריט", "תיאור העבודה", "יחידה", "כמות", "מחיר ליחידה (₪)", 'סה"כ (₪)', "תקן / הפניה", "הערות"];
    headers.forEach((h, col) => {
      setCell(ws, row, col, h, STYLES.colHeader);
    });
    row++;

    // ── Data rows ──
    const grouped = items.reduce((acc, item) => {
      const s = item.section || "misc";
      if (!acc[s]) acc[s] = [];
      acc[s].push(item);
      return acc;
    }, {});

    // Build section order: known sections first, then any unknown sections
    const knownSections = Object.keys(SECTION_LABELS);
    const unknownSections = Object.keys(grouped).filter(s => !knownSections.includes(s));
    const sectionOrder = [...knownSections, ...unknownSections];

    let grandTotal = 0;
    let globalItemIdx = 0;

    sectionOrder.forEach((section) => {
      const sItems = grouped[section];
      if (!sItems?.length) return;

      // Section header row — use section_name_he from items if available, fallback to label map
      const sectionLabel = SECTION_LABELS[section] || sItems[0]?.section_name_he || section;
      setCell(ws, row, 0, sectionLabel, STYLES.sectionHeader);
      for (let c = 1; c <= COLS; c++) {
        setCell(ws, row, c, "", STYLES.sectionHeader);
      }
      ws["!merges"].push({ s: { r: row, c: 0 }, e: { r: row, c: COLS } });
      row++;

      // Items
      sItems.forEach((item, idx) => {
        const total = item.total_price || 0;
        grandTotal += total;
        const isAlt = idx % 2 === 1;
        const baseStyle = isAlt ? STYLES.itemRowAlt : STYLES.itemRow;
        const numStyle = isAlt ? STYLES.numberCellAlt : STYLES.numberCell;
        const monStyle = isAlt ? STYLES.moneyCellAlt : STYLES.moneyCell;

        setCell(ws, row, 0, item.item_number || `${String(sectionOrder.indexOf(section) + 1).padStart(2, "0")}.${String(idx + 1).padStart(3, "0")}`, numStyle);
        setCell(ws, row, 1, item.description || "", baseStyle);
        setCell(ws, row, 2, item.unit_name_he || UNIT_LABELS[item.unit] || item.unit, numStyle);
        setCell(ws, row, 3, item.quantity || 0, numStyle);
        setCell(ws, row, 4, item.unit_price || 0, monStyle);
        setCell(ws, row, 5, total, monStyle);
        setCell(ws, row, 6, item.standard_reference || "", { ...STYLES.notesStyle, ...(isAlt ? { fill: { fgColor: { rgb: "F8FAFC" } } } : {}) });
        setCell(ws, row, 7, item.notes || "", { ...STYLES.notesStyle, ...(isAlt ? { fill: { fgColor: { rgb: "F8FAFC" } } } : {}) });
        row++;
        globalItemIdx++;
      });

      // Section subtotal
      const sectionTotal = sItems.reduce((s, i) => s + (i.total_price || 0), 0);
      setCell(ws, row, 0, "", STYLES.sectionTotal);
      setCell(ws, row, 1, "", STYLES.sectionTotal);
      setCell(ws, row, 2, "", STYLES.sectionTotal);
      setCell(ws, row, 3, "", STYLES.sectionTotal);
      setCell(ws, row, 4, `סה"כ ${sectionLabel}`, STYLES.sectionTotal);
      ws["!merges"].push({ s: { r: row, c: 0 }, e: { r: row, c: 4 } });
      setCell(ws, row, 5, sectionTotal, STYLES.sectionTotalMoney);
      setCell(ws, row, 6, "", STYLES.sectionTotal);
      setCell(ws, row, 7, "", STYLES.sectionTotal);
      row++;
      row++; // space between sections
    });

    // ── Grand Total ──
    setCell(ws, row, 0, "", STYLES.grandTotal);
    setCell(ws, row, 1, "", STYLES.grandTotal);
    setCell(ws, row, 2, "", STYLES.grandTotal);
    setCell(ws, row, 3, "", STYLES.grandTotal);
    setCell(ws, row, 4, 'סה"כ כללי (לפני מע"מ)', STYLES.grandTotal);
    ws["!merges"].push({ s: { r: row, c: 0 }, e: { r: row, c: 4 } });
    setCell(ws, row, 5, grandTotal, STYLES.grandTotalMoney);
    setCell(ws, row, 6, "", STYLES.grandTotal);
    setCell(ws, row, 7, "", STYLES.grandTotal);
    row++;

    // VAT row
    const vat = Math.round(grandTotal * 0.17);
    setCell(ws, row, 4, 'מע"מ (17%)', STYLES.sectionTotal);
    ws["!merges"].push({ s: { r: row, c: 0 }, e: { r: row, c: 4 } });
    setCell(ws, row, 5, vat, STYLES.sectionTotalMoney);
    row++;

    // Grand total with VAT
    setCell(ws, row, 0, "", STYLES.grandTotal);
    setCell(ws, row, 1, "", STYLES.grandTotal);
    setCell(ws, row, 2, "", STYLES.grandTotal);
    setCell(ws, row, 3, "", STYLES.grandTotal);
    setCell(ws, row, 4, 'סה"כ כולל מע"מ', STYLES.grandTotal);
    ws["!merges"].push({ s: { r: row, c: 0 }, e: { r: row, c: 4 } });
    setCell(ws, row, 5, grandTotal + vat, STYLES.grandTotalMoney);
    setCell(ws, row, 6, "", STYLES.grandTotal);
    setCell(ws, row, 7, "", STYLES.grandTotal);
    row++;
    row++;

    // ── Footer ──
    setCell(ws, row, 0, "* המחירים הינם אומדן בלבד ואינם מהווים הצעת מחיר מחייבת. יש לאמת מול קבלנים.", {
      font: { sz: 8, italic: true, color: { rgb: "999999" }, name: "Arial" },
      alignment: { horizontal: "right" },
    });
    ws["!merges"].push({ s: { r: row, c: 0 }, e: { r: row, c: COLS } });

    // ── Column widths ──
    ws["!cols"] = [
      { wch: 12 },  // מס' פריט
      { wch: 55 },  // תיאור
      { wch: 8 },   // יחידה
      { wch: 10 },  // כמות
      { wch: 16 },  // מחיר ליחידה
      { wch: 16 },  // סה"כ
      { wch: 14 },  // תקן
      { wch: 30 },  // הערות
    ];

    // Row heights
    ws["!rows"] = [];
    ws["!rows"][0] = { hpt: 30 }; // title
    ws["!rows"][1] = { hpt: 18 }; // subtitle

    // Set ref range
    ws["!ref"] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: row, c: COLS } });
    ws["!dir"] = "rtl";

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "כתב כמויות");

    // ── Summary Sheet ──
    const summaryRows = [
      ["סיכום כתב כמויות"],
      [`פרויקט: ${projectName}`],
      [`תאריך: ${new Date().toLocaleDateString("he-IL")}`],
      [],
      ["סעיף", "מספר פריטים", 'סה"כ (₪)'],
    ];
    let summaryTotal = 0;
    sectionOrder.forEach((section) => {
      const sItems = grouped[section];
      if (!sItems?.length) return;
      const sTotal = sItems.reduce((s, i) => s + (i.total_price || 0), 0);
      summaryTotal += sTotal;
      const label = SECTION_LABELS[section] || sItems[0]?.section_name_he || section;
      summaryRows.push([label, sItems.length, sTotal]);
    });
    summaryRows.push([]);
    summaryRows.push(['סה"כ לפני מע"מ', "", summaryTotal]);
    summaryRows.push(['מע"מ (17%)', "", Math.round(summaryTotal * 0.17)]);
    summaryRows.push(['סה"כ כולל מע"מ', "", summaryTotal + Math.round(summaryTotal * 0.17)]);

    const ws2 = XLSX.utils.aoa_to_sheet(summaryRows);
    ws2["!cols"] = [{ wch: 25 }, { wch: 14 }, { wch: 16 }];
    ws2["!dir"] = "rtl";
    XLSX.utils.book_append_sheet(wb, ws2, "סיכום");

    XLSX.writeFile(wb, `כתב_כמויות_${projectName}_${new Date().toISOString().split("T")[0]}.xlsx`);
    setExporting(false);
  };

  const exportToPdf = () => {
    setExporting(true);
    try {
      const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

      // Hebrew text requires special handling — use simple table layout
      const pageW = doc.internal.pageSize.getWidth();
      const margin = 10;
      let y = 15;

      // Title
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text(`BOQ - ${projectName}`, pageW - margin, y, { align: "right" });
      y += 8;
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text(`Date: ${new Date().toLocaleDateString("he-IL")} | Generated by BOQ Pro`, pageW - margin, y, { align: "right" });
      y += 10;

      // Table header
      const cols = [
        { label: "Item #", w: 22 },
        { label: "Description", w: 90 },
        { label: "Unit", w: 18 },
        { label: "Qty", w: 22 },
        { label: "Price/Unit", w: 28 },
        { label: "Total", w: 28 },
        { label: "Notes", w: 60 },
      ];
      const totalW = cols.reduce((s, c) => s + c.w, 0);
      let x = margin;

      const drawHeader = () => {
        doc.setFillColor(30, 58, 95);
        doc.rect(margin, y, totalW, 7, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        let hx = margin;
        cols.forEach(col => {
          doc.text(col.label, hx + 1, y + 5);
          hx += col.w;
        });
        y += 9;
        doc.setTextColor(0, 0, 0);
      };

      drawHeader();

      const knownSections = Object.keys(SECTION_LABELS);
      const grouped = items.reduce((acc, item) => {
        const s = item.section || "misc";
        if (!acc[s]) acc[s] = [];
        acc[s].push(item);
        return acc;
      }, {});
      const unknownSections = Object.keys(grouped).filter(s => !knownSections.includes(s));
      const sectionOrder = [...knownSections, ...unknownSections];

      let grandTotal = 0;

      sectionOrder.forEach(section => {
        const sItems = grouped[section];
        if (!sItems?.length) return;

        // Check page break
        if (y > doc.internal.pageSize.getHeight() - 25) {
          doc.addPage();
          y = 15;
          drawHeader();
        }

        // Section header
        const sectionLabel = SECTION_LABELS[section] || sItems[0]?.section_name_he || section;
        doc.setFillColor(232, 237, 243);
        doc.rect(margin, y, totalW, 6, "F");
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.text(sectionLabel, margin + 1, y + 4.5);
        y += 8;

        sItems.forEach((item, idx) => {
          if (y > doc.internal.pageSize.getHeight() - 20) {
            doc.addPage();
            y = 15;
            drawHeader();
          }

          const total = item.total_price || 0;
          grandTotal += total;
          const isAlt = idx % 2 === 1;
          if (isAlt) {
            doc.setFillColor(248, 250, 252);
            doc.rect(margin, y - 1, totalW, 6, "F");
          }

          doc.setFont("helvetica", "normal");
          doc.setFontSize(7);
          let cx = margin;
          const row = [
            item.item_number || `${String(sectionOrder.indexOf(section) + 1).padStart(2, "0")}.${String(idx + 1).padStart(3, "0")}`,
            (item.description || "").substring(0, 65),
            UNIT_LABELS[item.unit] || item.unit || "",
            String(item.quantity || 0),
            `${(item.unit_price || 0).toLocaleString()}`,
            `${total.toLocaleString()}`,
            (item.notes || "").substring(0, 40),
          ];
          row.forEach((val, ci) => {
            doc.text(String(val), cx + 1, y + 3);
            cx += cols[ci].w;
          });
          y += 6;
        });

        // Section subtotal
        const sTotal = sItems.reduce((s, i) => s + (i.total_price || 0), 0);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.text(`Subtotal: ${sTotal.toLocaleString()} NIS`, margin + totalW - 1, y + 3, { align: "right" });
        y += 8;
      });

      // Grand total
      if (y > doc.internal.pageSize.getHeight() - 25) {
        doc.addPage();
        y = 15;
      }
      doc.setFillColor(30, 58, 95);
      doc.rect(margin, y, totalW, 8, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text(`GRAND TOTAL: ${grandTotal.toLocaleString()} NIS`, margin + totalW - 2, y + 6, { align: "right" });
      y += 10;
      doc.setTextColor(0, 0, 0);

      const vat = Math.round(grandTotal * 0.17);
      doc.setFontSize(9);
      doc.text(`VAT (17%): ${vat.toLocaleString()} NIS`, margin + totalW - 2, y + 4, { align: "right" });
      y += 6;
      doc.setFont("helvetica", "bold");
      doc.text(`TOTAL + VAT: ${(grandTotal + vat).toLocaleString()} NIS`, margin + totalW - 2, y + 4, { align: "right" });

      doc.save(`BOQ_${projectName}_${new Date().toISOString().split("T")[0]}.pdf`);
    } catch (err) {
      console.error("PDF export failed:", err);
    }
    setExporting(false);
  };

  return (
    <div className="flex gap-2 w-full sm:w-auto">
      <Button
        onClick={exportToExcel}
        disabled={exporting || !items?.length}
        className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 sm:gap-2 h-9 sm:h-10 px-3 sm:px-5 text-xs sm:text-sm font-bold flex-1 sm:flex-none eng-mono tracking-wider rounded"
      >
        {exporting ? (
          <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
        ) : (
          <Download className="w-4 h-4 sm:w-5 sm:h-5" />
        )}
        Excel
      </Button>
      <Button
        onClick={exportToPdf}
        disabled={exporting || !items?.length}
        variant="outline"
        className="gap-1.5 sm:gap-2 h-9 sm:h-10 px-3 sm:px-5 text-xs sm:text-sm font-bold flex-1 sm:flex-none eng-mono tracking-wider border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 rounded"
      >
        {exporting ? (
          <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
        ) : (
          <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
        )}
        PDF
      </Button>
    </div>
  );
}