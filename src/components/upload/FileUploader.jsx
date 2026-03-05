import React, { useState, useRef } from "react";
import { Upload, FileText, Loader2, X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/api/apiClient";
import { motion, AnimatePresence } from "framer-motion";

const ACCEPTED_TYPES = ".pdf,.png,.jpg,.jpeg,.dwg,.dxf";

export default function FileUploader({ onUploadComplete }) {
  const [file, setFile] = useState(null);
  const [projectName, setProjectName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) setFile(dropped);
  };

  const getFileType = (fileName) => {
    const ext = fileName.split(".").pop().toLowerCase();
    if (ext === "pdf") return "pdf";
    if (ext === "dwg" || ext === "dxf") return "dwg";
    if (["png", "jpg", "jpeg"].includes(ext)) return "image";
    return "other";
  };

  const handleSubmit = async () => {
    if (!file || !projectName.trim()) {
      setError("יש להזין שם פרויקט ולהעלות קובץ");
      return;
    }
    setError("");
    setUploading(true);

    const { file_url } = await api.integrations.Core.UploadFile({ file });
    const fileType = getFileType(file.name);

    const project = await api.entities.Project.create({
      name: projectName.trim(),
      file_url,
      file_type: fileType,
      status: "uploaded",
    });

    setUploading(false);
    onUploadComplete(project);
  };

  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <Label className="text-sm font-medium text-slate-700">שם הפרויקט</Label>
        <Input
          placeholder='לדוגמה: "בניין מגורים ברח׳ הרצל 15"'
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          className="text-right h-11 text-sm rounded-lg border-slate-200 focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative cursor-pointer border-2 border-dashed rounded-xl p-8 sm:p-10 text-center transition-all duration-200 ${
          dragOver
            ? "border-blue-400 bg-blue-50/50"
            : file
            ? "border-green-400 bg-green-50/30"
            : "border-slate-200 hover:border-blue-300 hover:bg-blue-50/30"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES}
          className="hidden"
          onChange={(e) => setFile(e.target.files[0])}
        />

        <AnimatePresence mode="wait">
          {file ? (
            <motion.div
              key="file"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center gap-3"
            >
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-slate-800 text-sm truncate max-w-[250px]">{file.name}</p>
                <p className="text-xs text-slate-400 mt-0.5">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); setFile(null); }}
                className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
              >
                <X className="w-3 h-3" /> הסר קובץ
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center gap-3"
            >
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
                <Upload className="w-6 h-6 text-slate-400" />
              </div>
              <div>
                <p className="font-semibold text-slate-600 text-sm">גרור לכאן או לחץ לבחירת קובץ</p>
                <p className="text-xs text-slate-400 mt-0.5">PDF, DWG, DXF, PNG, JPG</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 rounded-lg p-3">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <Button
        onClick={handleSubmit}
        disabled={uploading || !file || !projectName.trim()}
        className="w-full h-12 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all"
      >
        {uploading ? (
          <><Loader2 className="w-5 h-5 ml-2 animate-spin" /> מעלה...</>
        ) : (
          <><Upload className="w-5 h-5 ml-2" /> העלה ונתח תכנית</>
        )}
      </Button>
    </div>
  );
}