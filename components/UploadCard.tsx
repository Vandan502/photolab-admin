"use client";

import { useState, useCallback } from "react";
import { UploadCloud, X, File, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";
import Image from "next/image";

export default function UploadCard() {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (newFiles: File[]) => {
    // Validate files
    const validFiles = newFiles.filter((file) => {
      const isValidType = ["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type);
      
      if (!isValidType) toast.error(`${file.name} is not a valid image format.`);
      
      return isValidType;
    });

    setFiles((prev) => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    
    setIsUploading(true);
    setUploadProgress(10);
    
    try {
      // 1. Get upload signature from our backend
      const sigRes = await fetch("/api/upload/signature");
      if (!sigRes.ok) throw new Error("Failed to get upload signature");
      const sigData = await sigRes.json();
      
      const { timestamp, signature, cloudName, apiKey, folder } = sigData;
      const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
      
      // Simulate progress for UI
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 500);

      // 2. Upload all files concurrently directly to Cloudinary
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("api_key", apiKey);
        formData.append("timestamp", timestamp.toString());
        formData.append("signature", signature);
        formData.append("folder", folder);
        
        const res = await fetch(uploadUrl, {
          method: "POST",
          body: formData,
        });
        
        if (!res.ok) throw new Error(`Upload failed for ${file.name}`);
        return res.json();
      });

      await Promise.all(uploadPromises);

      clearInterval(progressInterval);
      setUploadProgress(100);

      toast.success(`${files.length} image(s) uploaded successfully!`);
      setFiles([]);
      // Optional: trigger a refresh event so gallery updates
      window.dispatchEvent(new Event("imagesUploaded"));
    } catch (error) {
      toast.error("An error occurred during upload.");
      console.error(error);
    } finally {
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 1000);
    }
  };

  return (
    <div className="glass-card rounded-2xl p-6 sm:p-8 w-full max-w-3xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800">Upload Images</h2>
        <p className="text-sm text-gray-500 mt-1">
          Drag & drop images here or click to browse. (JPG, PNG, WEBP, GIF)
        </p>
      </div>

      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${
          isDragging
            ? "border-primary bg-primary/5"
            : "border-gray-300 hover:border-primary/50 hover:bg-gray-50"
        }`}
      >
        <input
          type="file"
          multiple
          accept="image/jpeg, image/png, image/webp, image/gif"
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isUploading}
        />
        
        <div className="flex flex-col items-center justify-center space-y-4 pointer-events-none">
          <div className={`p-4 rounded-full ${isDragging ? "bg-primary text-white" : "bg-primary/10 text-primary"}`}>
            <UploadCloud className="w-8 h-8" />
          </div>
          <div>
            <p className="text-lg font-medium text-gray-700">
              <span className="text-primary">Click to upload</span> or drag and drop
            </p>
            <p className="text-sm text-gray-500 mt-1">SVG, PNG, JPG or GIF</p>
          </div>
        </div>
      </div>

      {/* File Previews */}
      {files.length > 0 && (
        <div className="mt-8 space-y-4">
          <h3 className="text-sm font-medium text-gray-700">Selected Files ({files.length})</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {files.map((file, index) => (
              <div key={`${file.name}-${index}`} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="relative w-12 h-12 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                  <Image
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                  <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  disabled={isUploading}
                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="pt-4 flex items-center justify-end">
            <button
              onClick={handleUpload}
              disabled={isUploading}
              className="bg-primary hover:bg-secondary text-white px-6 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isUploading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Uploading... {uploadProgress}%
                </>
              ) : (
                <>
                  <UploadCloud className="w-5 h-5" />
                  Upload to Drive
                </>
              )}
            </button>
          </div>
          
          {/* Progress Bar */}
          {isUploading && (
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2 overflow-hidden">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
