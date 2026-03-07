import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle, MessageCircle, CheckCircle2 } from "lucide-react";

export default function UnclearItemsDialog({ open, onClose, unclearItems, skippedElements, onSubmitClarifications }) {
  const [clarifications, setClarifications] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const allIssues = [
    ...(unclearItems || []).map((item, i) => ({
      id: `unclear_${i}`,
      type: "unclear",
      text: item,
    })),
    ...(skippedElements || []).map((el, i) => ({
      id: `skipped_${i}`,
      type: "skipped",
      text: `${el.element_ref} — ${el.reason}`,
    })),
  ];

  if (allIssues.length === 0) return null;

  const handleSubmit = async () => {
    setSubmitting(true);
    const filledClarifications = Object.entries(clarifications)
      .filter(([, v]) => v.trim())
      .map(([key, value]) => {
        const issue = allIssues.find((i) => i.id === key);
        return { issue: issue?.text, clarification: value };
      });
    await onSubmitClarifications(filledClarifications);
    setSubmitting(false);
  };

  const handleSkip = () => {
    onSubmitClarifications([]);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg sm:max-w-2xl max-h-[85vh] overflow-y-auto bg-[#111827] border-[#1e293b]" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg text-slate-100">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            פריטים שדורשים הבהרה
          </DialogTitle>
        </DialogHeader>

        <p className="text-sm text-slate-500 -mt-2">
          זיהינו כמה פריטים שלא היו ברורים בתכנית או שדולגו עקב חוסר מידע.
          תוכל להוסיף הבהרות כדי לשפר את הדיוק, או לדלג.
        </p>

        <div className="space-y-3 mt-2">
          {allIssues.map((issue) => (
            <div
              key={issue.id}
              className={`rounded border p-4 ${
                issue.type === "unclear"
                  ? "border-amber-500/25 bg-amber-500/5"
                  : "border-[#1e293b] bg-[#0d1320]"
              }`}
            >
              <div className="flex items-start gap-2 mb-2">
                {issue.type === "unclear" ? (
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
                ) : (
                  <MessageCircle className="w-3.5 h-3.5 text-slate-500 mt-0.5 shrink-0" />
                )}
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                    {issue.type === "unclear" ? "לא ברור" : "דולג"}
                  </span>
                  <p className="text-sm text-slate-300 mt-0.5">{issue.text}</p>
                </div>
              </div>
              <Textarea
                placeholder="הוסף הבהרה... (אופציונלי)"
                value={clarifications[issue.id] || ""}
                onChange={(e) =>
                  setClarifications({ ...clarifications, [issue.id]: e.target.value })
                }
                className="text-sm min-h-[60px] mt-1 bg-[#0d1320] border-[#1e293b] text-slate-200 placeholder:text-slate-600"
              />
            </div>
          ))}
        </div>

        <DialogFooter className="flex gap-2 mt-4">
          <Button variant="outline" onClick={handleSkip} className="text-sm bg-[#1e293b] border-[#334155] text-slate-300 hover:bg-[#334155]">
            דלג — המשך בלי הבהרות
          </Button>
          <button
            onClick={handleSubmit}
            disabled={submitting || Object.values(clarifications).every((v) => !v?.trim())}
            className="btn-eng-primary h-10 px-4 text-sm font-semibold gap-1.5 flex items-center disabled:opacity-50"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            {submitting ? "מעדכן..." : "שלח הבהרות ועדכן"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
