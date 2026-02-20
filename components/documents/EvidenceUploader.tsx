"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { cn } from "@/lib/utils";

interface EvidenceUploaderProps {
  onUpload: (file: File, type: "photo" | "receipt" | "note", date?: string) => void;
  uploading?: boolean;
}

export function EvidenceUploader({ onUpload, uploading }: EvidenceUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [docType, setDocType] = useState<"photo" | "receipt" | "note">("photo");
  const [date, setDate] = useState("");

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setSelectedFile(file);

      // Auto-detect type based on file
      if (file.type === "application/pdf") {
        setDocType("receipt");
      } else if (file.type.startsWith("image/")) {
        setDocType("photo");
      }

      // Create preview for images
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = () => setPreview(reader.result as string);
        reader.readAsDataURL(file);
      } else {
        setPreview(null);
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"],
      "application/pdf": [".pdf"],
    },
    multiple: false,
  });

  const handleUpload = () => {
    if (selectedFile) {
      onUpload(selectedFile, docType, date || undefined);
      // Reset after upload
      setSelectedFile(null);
      setPreview(null);
      setDate("");
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    setPreview(null);
    setDate("");
  };

  if (!selectedFile) {
    return (
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
          "border-field-sage hover:border-field-forest hover:bg-field-cream/50",
          isDragActive && "border-field-forest bg-field-sage/10"
        )}
      >
        <input {...getInputProps()} />
        <p className="text-field-ink">
          {isDragActive ? "Drop the file here..." : "Drop file here or click to upload"}
        </p>
        <p className="text-sm text-field-ink/60 mt-2">Accepts images and PDFs</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* File preview */}
      <div className="flex items-start gap-4 p-4 bg-field-cream/50 rounded-lg">
        {preview ? (
          <img src={preview} alt="Preview" className="w-20 h-20 object-cover rounded" />
        ) : (
          <div className="w-20 h-20 bg-field-wheat rounded flex items-center justify-center">
            <svg className="w-8 h-8 text-field-ink/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
            </svg>
          </div>
        )}
        <div className="flex-1">
          <p className="font-medium text-field-ink text-sm truncate">{selectedFile.name}</p>
          <p className="text-xs text-field-ink/60">{(selectedFile.size / 1024).toFixed(1)} KB</p>
          <button
            type="button"
            onClick={handleClear}
            className="text-xs text-red-600 hover:underline mt-1"
          >
            Remove
          </button>
        </div>
      </div>

      {/* Type selector */}
      <div>
        <label className="block text-sm font-medium text-field-ink mb-2">Evidence Type</label>
        <div className="flex gap-2">
          {(["photo", "receipt", "note"] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setDocType(type)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                docType === type
                  ? "bg-field-forest text-white"
                  : "bg-field-cream text-field-ink hover:bg-field-wheat"
              )}
            >
              {type === "photo" ? "Photo" : type === "receipt" ? "Receipt" : "Note"}
            </button>
          ))}
        </div>
      </div>

      {/* Optional date */}
      <div>
        <label className="block text-sm font-medium text-field-ink mb-2">
          Date (optional)
        </label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full p-2 border border-field-wheat rounded-lg focus:outline-none focus:ring-2 focus:ring-field-forest/20"
        />
      </div>

      {/* Upload button */}
      <button
        type="button"
        onClick={handleUpload}
        disabled={uploading}
        className="w-full px-4 py-2 bg-field-forest text-white font-medium rounded-lg hover:bg-field-forest/90 disabled:opacity-50"
      >
        {uploading ? "Uploading..." : "Upload Evidence"}
      </button>
    </div>
  );
}
