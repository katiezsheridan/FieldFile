"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { cn } from "@/lib/utils";

interface FileUploaderProps {
  onUpload: (files: File[]) => void;
}

export function FileUploader({ onUpload }: FileUploaderProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      onUpload(acceptedFiles);
    },
    [onUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"],
      "application/pdf": [".pdf"],
    },
  });

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
        {isDragActive
          ? "Drop the files here..."
          : "Drop files here or click to upload"}
      </p>
      <p className="text-sm text-field-ink/60 mt-2">
        Accepts images and PDFs
      </p>
    </div>
  );
}
