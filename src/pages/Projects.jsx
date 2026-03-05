import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/apiClient";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { Badge } from "@/components/ui/badge";
import { FolderOpen, Calendar, Building2, Plus, Loader2, Trash2, ArrowLeft, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import DeleteProjectDialog from "../components/projects/DeleteProjectDialog";

const STATUS_CONFIG = {
  completed: { label: "הושלם", icon: CheckCircle2, color: "bg-green-50 text-green-700 border-green-200" },
  analyzing: { label: "בעיבוד", icon: Loader2, color: "bg-blue-50 text-blue-700 border-blue-200" },
  review_pending: { label: "ממתין לסקירה", icon: Clock, color: "bg-amber-50 text-amber-700 border-amber-200" },
  uploaded: { label: "הועלה", icon: Clock, color: "bg-slate-50 text-slate-600 border-slate-200" },
  error: { label: "שגיאה", icon: AlertCircle, color: "bg-red-50 text-red-700 border-red-200" },
};

export default function Projects() {
  const queryClient = useQueryClient();
  const [deleteProject, setDeleteProject] = useState(null);
  const { data: user } = useQuery({ queryKey: ["currentUser"], queryFn: () => api.auth.me() });
  const { data: projects, isLoading } = useQuery({
    queryKey: ["projects", user?.email],
    queryFn: () => api.entities.Project.filter({ created_by: user.email }, "-created_date"),
    enabled: !!user?.email,
    initialData: [],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">פרויקטים</h1>
          <p className="text-sm text-slate-400">{projects.length} פרויקטים</p>
        </div>
        <Link to={createPageUrl("Home")}>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2 h-10 px-4 text-sm font-semibold rounded-xl">
            <Plus className="w-4 h-4" />
            פרויקט חדש
          </Button>
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200/80 text-center py-16">
          <FolderOpen className="w-14 h-14 text-slate-200 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-slate-600">אין פרויקטים עדיין</h2>
          <p className="text-sm text-slate-400 mt-1">התחל בהעלאת תכנית ראשונה</p>
          <Link to={createPageUrl("Home")}>
            <Button className="mt-5 bg-blue-600 hover:bg-blue-700 text-white gap-2 rounded-xl">
              <Plus className="w-4 h-4" />
              פרויקט חדש
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {projects.map((project, i) => {
            const statusConfig = STATUS_CONFIG[project.status] || STATUS_CONFIG.uploaded;
            const StatusIcon = statusConfig.icon;
            const isResumable = project.status === "review_pending";

            return (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <Link to={isResumable ? (createPageUrl("Home") + `?resume=${project.id}`) : (createPageUrl("ProjectView") + `?id=${project.id}`)}>
                  <div className="bg-white rounded-xl border border-slate-200/80 hover:border-blue-200 hover:shadow-md transition-all group">
                    <div className="flex items-center gap-4 p-4">
                      <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-blue-50 transition-colors">
                        <Building2 className="w-5 h-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-800 text-sm sm:text-base truncate">{project.name}</h3>
                        <div className="flex items-center gap-3 mt-1 flex-wrap">
                          <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border ${statusConfig.color}`}>
                            <StatusIcon className="w-3 h-3" />
                            {statusConfig.label}
                          </span>
                          <span className="text-xs text-slate-400 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(project.created_date).toLocaleDateString("he-IL")}
                          </span>
                          {project.total_estimated_cost > 0 && (
                            <span className="text-xs font-semibold text-slate-700">
                              ₪{project.total_estimated_cost.toLocaleString("he-IL")}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {isResumable && (
                          <span className="text-xs text-blue-600 font-medium hidden sm:flex items-center gap-1">
                            המשך סקירה
                            <ArrowLeft className="w-3.5 h-3.5" />
                          </span>
                        )}
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-300 hover:text-red-500"
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setDeleteProject(project); }}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}

      {deleteProject && (
        <DeleteProjectDialog
          project={deleteProject} open={!!deleteProject}
          onClose={() => setDeleteProject(null)}
          onDeleted={() => { setDeleteProject(null); queryClient.invalidateQueries({ queryKey: ["projects"] }); }}
        />
      )}
    </div>
  );
}