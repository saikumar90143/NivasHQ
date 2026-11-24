"use client";

import React, { useCallback, useState } from 'react';
import { UploadCloud, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface ImageUploaderProps {
  value?: string[];
  onChange: (urls: string[]) => void;
  maxFiles?: number;
}

export function ImageUploader({ value = [], onChange, maxFiles = 10 }: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const uploadFiles = async (files: File[]) => {
    if (files.length === 0) return;
    setIsUploading(true);

    const newUrls: string[] = [];
    
    try {
      for (const file of files) {
        // Get signature
        const signRes = await fetch('/api/upload/sign?folder=properties');
        if (!signRes.ok) throw new Error('Failed to get signature');
        const { timestamp, signature, apiKey, cloudName } = await signRes.json();

        // Upload to Cloudinary
        const formData = new FormData();
        formData.append('file', file);
        formData.append('api_key', apiKey);
        formData.append('timestamp', timestamp);
        formData.append('signature', signature);
        formData.append('folder', 'properties');

        const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: 'POST',
          body: formData,
        });

        if (!uploadRes.ok) throw new Error('Failed to upload image');
        const uploadData = await uploadRes.json();
        newUrls.push(uploadData.secure_url);
      }
      
      const updatedUrls = [...value, ...newUrls].slice(0, maxFiles);
      onChange(updatedUrls);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload images. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      uploadFiles(Array.from(e.dataTransfer.files));
    }
  }, [value, maxFiles]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      uploadFiles(Array.from(e.target.files));
    }
  };

  const removeImage = (indexToRemove: number) => {
    onChange(value.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className="space-y-4">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative flex flex-col items-center justify-center p-10 border-2 border-dashed rounded-xl transition-all duration-200",
          isDragging ? "border-amber-500 bg-amber-500/10 scale-[1.02]" : "border-slate-200 bg-slate-50 hover:bg-slate-100",
          isUploading && "opacity-50 cursor-not-allowed"
        )}
      >
        <input
          type="file"
          accept="image/*"
          multiple
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={handleFileChange}
          disabled={isUploading}
        />
        <div className="flex flex-col items-center text-slate-600">
          {isUploading ? (
            <Loader2 className="w-12 h-12 text-amber-500 animate-spin mb-4" />
          ) : (
            <div className="p-4 rounded-full bg-slate-200/50 mb-4 text-slate-400 group-hover:text-amber-500 transition-colors">
              <UploadCloud className="w-8 h-8" />
            </div>
          )}
          <p className="text-lg font-medium text-slate-900">
            {isUploading ? "Uploading to Cloudinary..." : "Click or drag images to upload"}
          </p>
          <p className="text-sm text-slate-500 mt-2">
            SVG, PNG, JPG or GIF (max. 10MB)
          </p>
        </div>
      </div>

      {value.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {value.map((url, idx) => (
            <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 group shadow-sm hover:shadow-md transition-shadow">
              <Image src={url} alt={`Uploaded ${idx}`} fill className="object-cover transition-transform duration-300 group-hover:scale-105" />
              <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/20 transition-colors" />
              <button
                type="button"
                onClick={() => removeImage(idx)}
                className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 transform scale-90 group-hover:scale-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
