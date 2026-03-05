import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { api } from "@/api/apiClient";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { ArrowRight, FileText, Calendar, Hash, AlertCircle, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import QuantitiesTable from "../components/quantities/QuantitiesTable";
import ExportButton from "../components/quantities/ExportButton";
import DeleteProjectDialog from "../components/projects/DeleteProjectDialog";

export default function ProjectView() {
  const navigate = useNavigate();
  const [showDelete, setShowDelete] = useState(false);
  const params = new URLSearchParams(window.location.search);
  const projectId = params.get("id");
  const queryClient = useQueryClient();

  const { data: project, isLoading: loadingProject } = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => api.entities.Project.filter({ id: projectId }),
    select: (data) => data[0],
    enabled: !!projectId,
  });

  const { data: items, isLoading: loadingItems } = useQuery({
    queryKey: ["quantities", projectId],
    queryFn: () => api.entities.QuantityItem.filter({ project_id: projectId }),
    enabled: !!projectId,
    initialData: [],
  });

  const handleItemUpdated = () => {
    queryClient.invalidateQueries({ queryKey: ["quantities", projectId] });
  };

  if (loadingProject || loadingItems) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-20">
        <AlertCircle className="w-12 h-12 text-slate-200 mx-auto mb-4" />
        <h2 className="text-lg font-semibold text-slate-700">פרויקט לא נמצא</h2>
        <Link to={createPageUrl("Home")} className="text-blue-600 hover:underline mt-4 inline-block text-sm">
          חזרה לדף הבית
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5">
        <div className="flex items-start gap-3">
          <Link to={createPageUrl("Projects")} className="text-slate-400 hover:text-slate-600 mt-1">
            <ArrowRight className="w-5 h-5" />
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 truncate">
              {project.name}
            </h1>
            <div className="flex flex-wrap items-center gap-3 mt-2">
              <span className="flex items-center gap-1.5 text-xs text-slate-400">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(project.created_date).toLocaleDateString("he-IL")}
              </span>
              <span className="flex items-center gap-1.5 text-xs text-slate-400">
                <Hash className="w-3.5 h-3.5" />
                {items.length} פריטים
              </span>
              <Badge className={`text-[11px] rounded-full ${
                project.status === "completed" ? "bg-green-50 text-green-700 border border-green-200" : "bg-amber-50 text-amber-700 border border-amber-200"
              }`}>
                {project.status === "completed" ? "הושלם" : "בעיבוד"}
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100">
          <ExportButton items={items} projectName={project.name} />
          <Button
            variant="outline"
            className="gap-1.5 border-red-200 text-red-600 hover:bg-red-50 h-9 px-3 text-xs font-medium rounded-lg"
            onClick={() => setShowDelete(true)}
          >
            <Trash2 className="w-3.5 h-3.5" />
            מחק
          </Button>
        </div>
      </div>

      {/* Analysis Notes */}
      {project.analysis_notes && (
        <div className="bg-white rounded-xl border border-slate-200/80 border-r-4 border-r-amber-400 p-4">
          <div className="flex items-start gap-2.5">
            <FileText className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
            <div>
              <h3 className="font-semibold text-slate-800 text-sm mb-1">הערות ניתוח</h3>
              <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">{project.analysis_notes}</p>
            </div>
          </div>
        </div>
      )}

      {/* Quantities Table */}
      <QuantitiesTable items={items} onItemUpdated={handleItemUpdated} />

      {showDelete && (
        <DeleteProjectDialog
          project={project} open={showDelete}
          onClose={() => setShowDelete(false)}
          onDeleted={() => navigate(createPageUrl("Projects"))}
        />
      )}
    </div>
  );
}