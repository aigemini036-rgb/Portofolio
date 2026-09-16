import React, { useState, useRef } from 'react';
import { Crop, Upload, Image as ImageIcon } from 'lucide-react';
import ImageCropperModal from './ImageCropperModal';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  helpText?: string;
  defaultAspect?: number;
}

export default function ImageUpload({
  value,
  onChange,
  label = "Gambar",
  helpText = "URL gambar atau upload dari perangkat",
  defaultAspect = 4 / 3
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [cropperOpen, setCropperOpen] = useState(false);
  const [rawImageForCrop, setRawImageForCrop] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setRawImageForCrop(dataUrl);
      setCropperOpen(true);
      setUploading(false);
      // Reset input value so re-selecting same file triggers onChange
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.onerror = () => {
      alert("Gagal membaca file gambar.");
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = (croppedUrl: string) => {
    onChange(croppedUrl);
  };

  const handleSkipCrop = () => {
    if (!rawImageForCrop) return;
    // Resize image to max 1200px width/height to keep Firestore compact
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      const maxDimension = 1200;

      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        onChange(canvas.toDataURL('image/jpeg', 0.85));
      } else {
        onChange(rawImageForCrop);
      }
      setCropperOpen(false);
    };
    img.onerror = () => {
      onChange(rawImageForCrop);
      setCropperOpen(false);
    };
    img.src = rawImageForCrop;
  };

  const openCropperForCurrent = () => {
    if (!value) return;
    setRawImageForCrop(value);
    setCropperOpen(true);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-400 mb-2">{label}</label>
      <div className="flex flex-col gap-3">
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://... atau pilih file di bawah"
          className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-all text-sm"
        />
        
        <div className="flex flex-wrap items-center gap-3">
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
            className="bg-gray-800 hover:bg-gray-700 text-gray-200 px-4 py-2 rounded-xl text-xs font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <Upload size={14} />
            <span>{uploading ? 'Membaca file...' : 'Unggah & Potong dari Perangkat'}</span>
          </button>

          {value && (
            <button
              type="button"
              onClick={openCropperForCurrent}
              className="bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 px-3.5 py-2 rounded-xl text-xs font-medium transition-colors flex items-center gap-1.5"
            >
              <Crop size={14} />
              <span>Potong / Atur Crop Foto</span>
            </button>
          )}
        </div>
      </div>
      {helpText && <p className="text-xs text-gray-500 mt-2">{helpText}</p>}
      
      {value && (
        <div className="mt-4 p-3 bg-gray-950/70 border border-gray-800 rounded-xl flex items-start gap-4">
          <div className="relative group overflow-hidden rounded-lg border border-gray-800 bg-gray-900 shrink-0">
            <img 
              src={value} 
              alt="Preview" 
              className="h-28 w-36 object-cover rounded-lg" 
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <button
              type="button"
              onClick={openCropperForCurrent}
              title="Klik untuk crop / sesuaikan"
              className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 text-white text-xs font-medium"
            >
              <Crop size={18} className="text-indigo-400" />
              <span>Crop Foto</span>
            </button>
          </div>

          <div className="flex-1 min-w-0 text-xs text-gray-400 py-1">
            <p className="font-medium text-gray-300 mb-1 flex items-center gap-1.5">
              <ImageIcon size={14} className="text-indigo-400" />
              <span>Pratinjau Foto Profil</span>
            </p>
            <p className="line-clamp-2 text-gray-500 break-all text-[11px] mb-2">{value.startsWith('data:') ? 'Foto tersimpan secara lokal/canvas (format Base64)' : value}</p>
            <button
              type="button"
              onClick={openCropperForCurrent}
              className="text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1 font-medium text-xs transition-colors"
            >
              <Crop size={13} />
              <span>Buka Alat Crop & Penyesuaian &rarr;</span>
            </button>
          </div>
        </div>
      )}

      {/* Image Cropper Modal */}
      {cropperOpen && (
        <ImageCropperModal
          isOpen={cropperOpen}
          imageSrc={rawImageForCrop}
          defaultAspect={defaultAspect}
          title={`Sesuaikan & Potong ${label}`}
          onClose={() => setCropperOpen(false)}
          onCropComplete={handleCropComplete}
          onSkipCrop={handleSkipCrop}
        />
      )}
    </div>
  );
}
