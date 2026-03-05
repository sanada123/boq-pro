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
      <DialogContent className="max-w-lg sm:max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
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
              className={`rounded-xl border p-4 ${
                issue.type === "unclear"
                  ? "border-amber-200 bg-amber-50/50"
                  : "border-slate-200 bg-slate-50/50"
              }`}
            >
              <div className="flex items-start gap-2 mb-2">
                {issue.type === "unclear" ? (
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
                ) : (
                  <MessageCircle className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                )}
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                    {issue.type === "unclear" ? "לא ברור" : "דולג"}
                  </span>
                  <p className="text-sm text-slate-700 mt-0.5">{issue.text}</p>
                </div>
              </div>
              <Textarea
                placeholder="הוסף הבהרה... (אופציונלי)"
                value={clarifications[issue.id] || ""}
                onChange={(e) =>
                  setClarifications({ ...clarifications, [issue.id]: e.target.value })
                }
                className="text-sm min-h-[60px] mt-1 rounded-lg"
              />
            </div>
          ))}
        </div>

        <DialogFooter className="flex gap-2 mt-4">
          <Button variant="outline" onClick={handleSkip} className="text-sm rounded-lg">
            דלג — המשך בלי הבהרות
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting || Object.values(clarifications).every((v) => !v?.trim())}
            className="bg-blue-600 hover:bg-blue-700 text-sm gap-1.5 rounded-lg"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            {submitting ? "מעדכן..." : "שלח הבהרות ועדכן"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}