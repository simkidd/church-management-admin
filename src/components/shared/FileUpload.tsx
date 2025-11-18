"use client";

import { useCallback, useMemo } from "react";
import { Accept, FileRejection, useDropzone } from "react-dropzone";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  X,
  Upload,
  File,
  Video,
  FileText,
  ImageIcon,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

interface FileUploadProps {
  accept?: Record<string, string[]>;
  maxSize?: number; // in bytes
  maxFiles?: number;
  onFileChange: (file: File | null) => void;
  preview?: string;
  previewIcon?: React.ReactNode;
  uploadText?: string;
  dragText?: string;
  supportedFormats?: string;
  className?: string;
  disabled?: boolean;
  value?: File | null;
  error?: boolean;
  errorMessage?: string;
  loading?: boolean;
}

// Video upload configuration matching backend
export const VIDEO_CONFIG = {
  accept: {
    "video/mp4": [".mp4"],
    "video/quicktime": [".mov"],
    "video/x-msvideo": [".avi"],
    "video/x-matroska": [".mkv"],
    "video/webm": [".webm"],
  },
  maxSize: 500 * 1024 * 1024, // 500MB
  supportedFormats: "MP4, MOV, AVI, MKV, WebM",
};

// Image upload configuration matching backend
export const IMAGE_CONFIG = {
  accept: {
    "image/jpeg": [".jpeg", ".jpg"],
    "image/png": [".png"],
    "image/gif": [".gif"],
    "image/webp": [".webp"],
  },
  maxSize: 5 * 1024 * 1024, // 5MB
  supportedFormats: "JPEG, PNG, GIF, WebP",
};

// Document upload configuration
export const DOCUMENT_CONFIG = {
  accept: {
    "application/pdf": [".pdf"],
    "application/msword": [".doc"],
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
      ".docx",
    ],
    "text/plain": [".txt"],
  },
  maxSize: 10 * 1024 * 1024, // 10MB
  supportedFormats: "PDF, DOC, DOCX, TXT",
};

export const FileUpload = ({
  accept = IMAGE_CONFIG.accept,
  maxSize = IMAGE_CONFIG.maxSize,
  maxFiles = 1,
  onFileChange,
  preview,
  previewIcon,
  uploadText = "Upload File",
  dragText = "Drag file here or click to browse",
  supportedFormats,
  className,
  disabled = false,
  value,
  error,
  errorMessage,
  loading,
}: FileUploadProps) => {
  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith("video/")) {
      return <Video className="h-8 w-8 text-blue-500" />;
    } else if (fileType.startsWith("image/")) {
      return <ImageIcon className="h-8 w-8 text-green-500" />;
    } else {
      return <FileText className="h-8 w-8 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      if (disabled) return;

      // Handle rejected files
      if (rejectedFiles.length > 0) {
        const rejection = rejectedFiles[0];
        if (rejection.errors[0].code === "file-too-large") {
          toast.error("File too large", {
            description: `File must be less than ${formatFileSize(maxSize)}`,
          });
        } else if (rejection.errors[0].code === "file-invalid-type") {
          toast.error("Invalid file type", {
            description: `Supported formats: ${
              supportedFormats || Object.values(accept).flat().join(", ")
            }`,
          });
        } else {
          toast.error("Upload failed", {
            description: rejection.errors[0].message,
          });
        }
        return;
      }

      // Handle accepted files
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        onFileChange(file);
      }
    },
    [onFileChange, maxSize, accept, supportedFormats, disabled]
  );

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragReject,
    acceptedFiles,
  } = useDropzone({
    onDrop,
    accept: accept as Accept, // react-dropzone expects a different format
    maxSize,
    maxFiles,
    disabled,
    multiple: maxFiles > 1,
  });

  const currentFile = useMemo(() => {
    return value || acceptedFiles[0] || null;
  }, [value, acceptedFiles]);

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFileChange(null);
  };

  const dropzoneClassName = useMemo(
    () =>
      cn(
        "border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer",
        isDragActive && "border-primary bg-primary/5",
        isDragReject && "border-destructive bg-destructive/5",
        disabled && "opacity-50 cursor-not-allowed",
        !disabled &&
          !isDragActive &&
          !isDragReject &&
          "hover:border-primary/50 hover:bg-muted/50",
        error && "border-destructive bg-destructive/5"
      ),
    [isDragActive, isDragReject, disabled, error]
  );

  return (
    <div className={cn("space-y-4", className)}>
      {/* Dropzone Area */}
      <div {...getRootProps({ className: dropzoneClassName })}>
        <input {...getInputProps()} aria-invalid={error} />

        {loading ? (
          <div className="space-y-3">
            <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center">
              <Loader2 className="h-6 w-6 text-muted-foreground animate-spin" />
            </div>
            <p className="text-sm text-muted-foreground">Uploading...</p>
          </div>
        ) : preview || currentFile ? (
          <div className="space-y-3">
            {/* Preview */}
            <div className="relative mx-auto w-32 h-32">
              {previewIcon || getFileIcon(currentFile?.type || "image/*")}
              {!disabled && (
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                  onClick={handleRemove}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
            <div className="text-sm text-muted-foreground">
              {currentFile?.name || "Selected file"}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={(e) => e.stopPropagation()}
              disabled={disabled}
            >
              Change File
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center">
              <Upload className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="font-medium text-sm">
                {isDragActive ? "Drop the file here" : uploadText}
              </p>
              <p className="text-xs text-muted-foreground">
                {isDragReject ? "File type not supported" : dragText}
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={(e) => e.stopPropagation()}
              disabled={disabled}
            >
              Browse Files
            </Button>
          </div>
        )}
      </div>

      {/* File Info */}
      {currentFile && (
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <File className="h-4 w-4 text-muted-foreground shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{currentFile.name}</p>
              <p className="text-xs text-muted-foreground">
                {formatFileSize(currentFile.size)}
              </p>
            </div>
          </div>
          {!disabled && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleRemove}
              className="h-6 w-6 shrink-0"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      )}

      {/* Help Text */}
      <div className="text-xs text-muted-foreground space-y-1">
        {supportedFormats && <p>Supported formats: {supportedFormats}</p>}
        <p>Maximum file size: {formatFileSize(maxSize)}</p>
        {maxFiles > 1 && <p>Maximum files: {maxFiles}</p>}
      </div>
    </div>
  );
};
