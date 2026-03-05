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
      <AlertDialogContent dir="rtl" className="mx-3 sm:mx-auto">
        <AlertDialogHeader>
          <AlertDialogTitle>מחיקת פרויקט</AlertDialogTitle>
          <AlertDialogDescription>
            האם אתה בטוח שברצונך למחוק את הפרויקט "{project.name}"?
            <br />
            כל כתב הכמויות והנתונים ימחקו לצמיתות.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex gap-2 sm:gap-3">
          <AlertDialogCancel disabled={deleting}>ביטול</AlertDialogCancel>
          <Button
            onClick={handleDelete}
            disabled={deleting}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {deleting ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : null}
            מחק פרויקט
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}