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
      <AlertDialogContent dir="rtl" className="mx-3 sm:mx-auto bg-white border-slate-200">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-slate-900">מחיקת פרויקט</AlertDialogTitle>
          <AlertDialogDescription className="text-slate-400">
            האם אתה בטוח שברצונך למחוק את הפרויקט "{project.name}"?
            <br />
            כל כתב הכמויות והנתונים ימחקו לצמיתות.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex gap-2 sm:gap-3">
          <AlertDialogCancel disabled={deleting} className="bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200">ביטול</AlertDialogCancel>
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
