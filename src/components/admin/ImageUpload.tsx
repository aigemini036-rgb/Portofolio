import React, { useState, useRef } from 'react';
import { supabase } from '../../supabase';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  helpText?: string;
}

export default function ImageUpload({ value, onChange, label = "Gambar", helpText = "URL gambar atau upload dari perangkat" }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      // Upload ke Supabase bucket 'portfolio-images'
      const { error: uploadError } = await supabase.storage
        .from('portfolio-images')
        .upload(filePath, file);

      if (uploadError) {
        if (uploadError.message.includes('Bucket not found') || uploadError.message.includes('The resource was not found')) {
          throw new Error("Bucket 'portfolio-images' belum dibuat di Supabase. Silakan buat bucket dengan nama tersebut dan atur menjadi Public.");
        }
        throw uploadError;
      }

      // Ambil URL publik gambar
      const { data } = supabase.storage
        .from('portfolio-images')
        .getPublicUrl(filePath);

      onChange(data.publicUrl);
    } catch (error: any) {
      console.error("Upload error:", error);
      alert(`Gagal mengunggah gambar ke Supabase: ${error.message || "Pastikan bucket 'portfolio-images' sudah dibuat dan RLS mengizinkan upload."}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-400 mb-2">{label}</label>
      <div className="flex flex-col gap-3">
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://..."
          className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-all"
        />
        
        <div className="flex items-center gap-4">
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="bg-gray-800 hover:bg-gray-700 text-gray-200 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            {uploading ? 'Memproses...' : 'Unggah dari Perangkat'}
          </button>
        </div>
      </div>
      {helpText && <p className="text-xs text-gray-500 mt-2">{helpText}</p>}
      
      {value && (
        <div className="mt-4">
          <p className="text-xs text-gray-500 mb-2">Pratinjau:</p>
          <img src={value} alt="Preview" className="h-32 object-contain rounded-lg bg-gray-950 border border-gray-800" />
        </div>
      )}
    </div>
  );
}
