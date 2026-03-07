import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/apiClient";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { Badge } from "@/components/ui/badge";
import { FolderOpen, Calendar, Building2, Plus, Loader2, Trash2, ArrowLeft, Clock, CheckCircle2, AlertCircle, Hexagon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import DeleteProjectDialog from "../components/projects/DeleteProjectDialog";

const STATUS_CONFIG = {
  completed: { label: "הושלם", icon: CheckCircle2, color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
  analyzing: { label: "בעיבוד", icon: Loader2, color: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
  review_pending: { label: "ממתין לסקירה", icon: Clock, color: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30" },
  uploaded: { label: "הועלה", icon: Clock, color: "bg-slate-500/15 text-slate-400 border-slate-500/30" },
  error: { label: "שגיאה", icon: AlertCircle, color: "bg-rose-500/15 text-rose-400 border-rose-500/30" },
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
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-100">פרויקטים</h1>
          <p className="text-sm text-slate-500">{projects.length} פרויקטים</p>
        </div>
        <Link to={createPageUrl("Home")}>
          <button className="btn-eng-primary flex items-center gap-2 h-10 px-4 text-sm">
            <Plus className="w-4 h-4" />
            פרויקט חדש
          </button>
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="eng-card text-center py-16">
          <FolderOpen className="w-14 h-14 text-slate-600 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-slate-300">אין פרויקטים עדיין</h2>
          <p className="text-sm text-slate-500 mt-1">התחל בהעלאת תכנית ראשונה</p>
          <Link to={createPageUrl("Home")}>
            <button className="btn-eng-primary mt-5 flex items-center gap-2 mx-auto">
              <Plus className="w-4 h-4" />
              פרויקט חדש
            </button>
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
                  <div className="eng-card-glow group">
                    <div className="flex items-center gap-4 p-4">
                      <div className="w-10 h-10 bg-[#1e293b] rounded flex items-center justify-center shrink-0 group-hover:bg-amber-500/10 transition-colors">
                        <Building2 className="w-5 h-5 text-slate-500 group-hover:text-amber-400 transition-colors" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-200 text-sm sm:text-base truncate">{project.name}</h3>
                        <div className="flex items-center gap-3 mt-1 flex-wrap">
                          <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded border ${statusConfig.color}`}>
                            <StatusIcon className={`w-3 h-3 ${project.status === 'analyzing' ? 'animate-spin' : ''}`} />
                            {statusConfig.label}
                          </span>
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(project.created_date).toLocaleDateString("he-IL")}
                          </span>
                          {project.total_estimated_cost > 0 && (
                            <span className="text-xs font-semibold text-amber-400 eng-number">
                              ₪{project.total_estimated_cost.toLocaleString("he-IL")}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {isResumable && (
                          <span className="text-xs text-amber-400 font-medium hidden sm:flex items-center gap-1">
                            המשך סקירה
                            <ArrowLeft className="w-3.5 h-3.5" />
                          </span>
                        )}
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-600 hover:text-rose-400 hover:bg-rose-500/10"
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
