import React, { useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { api } from "@/api/apiClient";
import { Loader2 } from "lucide-react";

export default function DeleteProjectDialog({ project, open, onClose, onDeleted }) {
  const [deleting, setDeleting] = useState(false);

  if (!project) return null;

  const handleDelete = async () => {
    setDeleting(true);
    const items = await api.entities.QuantityItem.filter({ project_id: project.id });
    for (const item of items) {
      await api.entities.QuantityItem.delete(item.id);
    }
    await api.entities.Project.delete(project.id);
    setDeleting(false);
    onDeleted();
  };

  return (
    <AlertDialog open={open} onOpenChange={(v) => { if (!v && !deleting) onClose(); }}>
      <AlertDialogContent dir="rtl" className="mx-3 sm:mx-auto bg-[#111827] border-[#1e293b]">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-slate-100">מחיקת פרויקט</AlertDialogTitle>
          <AlertDialogDescription className="text-slate-400">
            האם אתה בטוח שברצונך למחוק את הפרויקט "{project.name}"?
            <br />
            כל כתב הכמויות והנתונים ימחקו לצמיתות.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex gap-2 sm:gap-3">
          <AlertDialogCancel disabled={deleting} className="bg-[#1e293b] border-[#334155] text-slate-300 hover:bg-[#334155]">ביטול</AlertDialogCancel>
          <Button
            onClick={handleDelete}
            disabled={deleting}
            className="bg-rose-600 hover:bg-rose-700 text-white"
          >
            {deleting ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : null}
            מחק פרויקט
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
