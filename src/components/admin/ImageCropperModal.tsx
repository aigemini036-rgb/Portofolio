import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Crop, ZoomIn, ZoomOut, RotateCw, RotateCcw, Check, X, RefreshCw, Move } from 'lucide-react';

interface ImageCropperModalProps {
  isOpen: boolean;
  imageSrc: string;
  onClose: () => void;
  onCropComplete: (croppedDataUrl: string) => void;
  onSkipCrop?: () => void;
  defaultAspect?: number; // e.g. 4/3 or 1/1
  title?: string;
}

interface AspectOption {
  label: string;
  ratio: number;
  description: string;
}

const ASPECT_OPTIONS: AspectOption[] = [
  { label: '4:3 (Pas Profil)', ratio: 4 / 3, description: 'Ukuran ideal untuk foto Tentang Saya / Profil' },
  { label: '1:1 (Persegi)', ratio: 1, description: 'Ukuran kotak untuk avatar / kartu' },
  { label: '3:4 (Potret)', ratio: 3 / 4, description: 'Ukuran tegak foto setengah badan' },
  { label: '16:9 (Lanskap)', ratio: 16 / 9, description: 'Ukuran lebar banner / sampul' },
  { label: 'Bebas (Asli)', ratio: 0, description: 'Mempertahankan rasio asli foto' },
];

export default function ImageCropperModal({
  isOpen,
  imageSrc,
  onClose,
  onCropComplete,
  onSkipCrop,
  defaultAspect = 4 / 3,
  title = 'Sesuaikan & Potong Foto (Crop)'
}: ImageCropperModalProps) {
  const [aspectRatio, setAspectRatio] = useState<number>(defaultAspect);
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset state whenever a new image or modal opens
  useEffect(() => {
    if (isOpen) {
      setZoom(1);
      setRotation(0);
      setPan({ x: 0, y: 0 });
      setAspectRatio(defaultAspect);
      setImageLoaded(false);
      setIsProcessing(false);
    }
  }, [isOpen, imageSrc, defaultAspect]);

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  // Drag handling (Mouse)
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Drag handling (Touch)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      setIsDragging(true);
      setDragStart({ x: touch.clientX - pan.x, y: touch.clientY - pan.y });
    }
  };

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    const touch = e.touches[0];
    setPan({
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y
    });
  }, [isDragging, dragStart]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleTouchEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  // Wheel to zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY * -0.002;
    setZoom(prev => Math.min(3.5, Math.max(0.8, prev + delta)));
  };

  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setRotation(0);
  };

  const rotateLeft = () => setRotation(prev => (prev - 90 + 360) % 360);
  const rotateRight = () => setRotation(prev => (prev + 90) % 360);

  // Compute crop box dimensions
  // Max preview box width/height
  const maxBoxWidth = 440;
  const maxBoxHeight = 360;

  let effectiveRatio = aspectRatio;
  if (effectiveRatio === 0 && imgRef.current) {
    effectiveRatio = (imgRef.current.naturalWidth || 4) / (imgRef.current.naturalHeight || 3);
  } else if (effectiveRatio === 0) {
    effectiveRatio = 4 / 3;
  }

  let frameWidth = maxBoxWidth;
  let frameHeight = Math.round(frameWidth / effectiveRatio);

  if (frameHeight > maxBoxHeight) {
    frameHeight = maxBoxHeight;
    frameWidth = Math.round(frameHeight * effectiveRatio);
  }

  // Execute crop via canvas
  const handleApplyCrop = async () => {
    if (!imgRef.current || !containerRef.current) return;
    setIsProcessing(true);

    try {
      const img = imgRef.current;
      const naturalW = img.naturalWidth;
      const naturalH = img.naturalHeight;

      if (!naturalW || !naturalH) {
        throw new Error('Gambar belum siap.');
      }

      // Desired output size (high quality, clamped to max 1200 for fast loading)
      const targetOutputWidth = Math.min(1200, Math.max(800, Math.round(frameWidth * 2.2)));
      const targetOutputHeight = Math.round(targetOutputWidth / effectiveRatio);

      const canvas = document.createElement('canvas');
      canvas.width = targetOutputWidth;
      canvas.height = targetOutputHeight;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('Gagal menyiapkan kanvas.');
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Base scaling factor: how display frame translates to output canvas
      const scaleFactor = targetOutputWidth / frameWidth;

      // Unscaled rendered dimensions of the image in the preview container:
      // In CSS, the image has max-w-none, and we can determine its base rendered size:
      // Let's compute based on natural dimensions vs frame
      const isRotated90or270 = rotation === 90 || rotation === 270;
      const rotNaturalW = isRotated90or270 ? naturalH : naturalW;
      const rotNaturalH = isRotated90or270 ? naturalW : naturalH;

      // Base scale that makes the image cover the frame
      const coverScale = Math.max(frameWidth / rotNaturalW, frameHeight / rotNaturalH);
      const baseDisplayW = naturalW * coverScale;
      const baseDisplayH = naturalH * coverScale;

      // Center of canvas
      ctx.translate(
        (targetOutputWidth / 2) + (pan.x * scaleFactor),
        (targetOutputHeight / 2) + (pan.y * scaleFactor)
      );
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(zoom, zoom);

      // Draw the image centered
      const drawW = baseDisplayW * scaleFactor;
      const drawH = baseDisplayH * scaleFactor;

      ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);

      // Export compressed high-quality JPEG
      const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.88);
      onCropComplete(croppedDataUrl);
      onClose();
    } catch (err: any) {
      console.error('Crop export error:', err);
      // Fallback to original image if crossOrigin or canvas issue
      alert('Catatan: Gambar digunakan dalam format langsung.');
      onCropComplete(imageSrc);
      onClose();
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl max-w-xl w-full p-5 sm:p-6 shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl">
              <Crop size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white leading-tight">{title}</h3>
              <p className="text-xs text-gray-400">Sesuaikan posisi, rasio, dan perbesaran agar pas di profil</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Aspect Ratio Selector Chips */}
        <div className="py-3 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {ASPECT_OPTIONS.map((opt) => (
            <button
              key={opt.label}
              type="button"
              onClick={() => {
                setAspectRatio(opt.ratio);
                setPan({ x: 0, y: 0 });
              }}
              title={opt.description}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1 ${
                aspectRatio === opt.ratio
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 ring-1 ring-indigo-400'
                  : 'bg-gray-950/80 text-gray-400 hover:text-gray-200 border border-gray-800 hover:border-gray-700'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Crop Viewport Box */}
        <div className="relative my-2 flex-1 min-h-[300px] max-h-[380px] bg-gray-950 rounded-xl border border-gray-800 flex items-center justify-center overflow-hidden select-none">
          {/* Visual instructions banner */}
          <div className="absolute top-2 left-2 z-20 pointer-events-none flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-sm border border-white/10 text-[11px] text-gray-300">
            <Move size={12} className="text-indigo-400" />
            <span>Tahan & geser untuk atur posisi</span>
          </div>

          {/* The Crop Frame */}
          <div
            ref={containerRef}
            style={{ width: `${frameWidth}px`, height: `${frameHeight}px` }}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            onWheel={handleWheel}
            className={`relative overflow-hidden cursor-grab active:cursor-grabbing border-2 border-indigo-500/80 rounded-lg shadow-2xl transition-all ${
              isDragging ? 'ring-2 ring-indigo-400/40' : ''
            }`}
          >
            {/* Rule of Thirds Grid Guidelines */}
            <div className="absolute inset-0 pointer-events-none z-10 grid grid-cols-3 grid-rows-3">
              <div className="border-r border-b border-white/15" />
              <div className="border-r border-b border-white/15" />
              <div className="border-b border-white/15" />
              <div className="border-r border-b border-white/15" />
              <div className="border-r border-b border-white/15" />
              <div className="border-b border-white/15" />
              <div className="border-r border-white/15" />
              <div className="border-r border-white/15" />
              <div />
            </div>

            {/* Rendered Transformable Image */}
            <div
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) rotate(${rotation}deg) scale(${zoom})`,
                transformOrigin: 'center center',
                transition: isDragging ? 'none' : 'transform 0.12s ease-out'
              }}
              className="w-full h-full flex items-center justify-center pointer-events-none"
            >
              <img
                ref={imgRef}
                src={imageSrc}
                alt="Crop preview"
                onLoad={handleImageLoad}
                crossOrigin="anonymous"
                className="max-w-none object-cover min-w-full min-h-full"
                draggable={false}
              />
            </div>
          </div>
        </div>

        {/* Controls Toolbar: Zoom, Rotate, Reset */}
        <div className="pt-3 pb-1 space-y-3">
          {/* Zoom Slider */}
          <div className="flex items-center gap-3 bg-gray-950/60 p-2.5 rounded-xl border border-gray-800/80">
            <ZoomOut size={16} className="text-gray-400 shrink-0" />
            <input
              type="range"
              min="0.8"
              max="3.0"
              step="0.05"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="w-full accent-indigo-500 h-1.5 bg-gray-800 rounded-lg cursor-pointer"
            />
            <ZoomIn size={16} className="text-gray-400 shrink-0" />
            <span className="text-xs font-mono text-indigo-400 shrink-0 w-12 text-right">
              {Math.round(zoom * 100)}%
            </span>

            <div className="h-4 w-[1px] bg-gray-800 mx-1" />

            {/* Rotate buttons */}
            <button
              type="button"
              onClick={rotateLeft}
              title="Putar ke Kiri 90°"
              className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              <RotateCcw size={15} />
            </button>
            <button
              type="button"
              onClick={rotateRight}
              title="Putar ke Kanan 90°"
              className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              <RotateCw size={15} />
            </button>

            {/* Reset position button */}
            <button
              type="button"
              onClick={handleReset}
              title="Kembalikan Posisi Semula"
              className="p-1.5 text-gray-400 hover:text-amber-400 rounded-lg hover:bg-gray-800 transition-colors"
            >
              <RefreshCw size={15} />
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-gray-800 flex items-center justify-between gap-3">
          {onSkipCrop ? (
            <button
              type="button"
              onClick={onSkipCrop}
              className="px-3.5 py-2 text-xs font-medium text-gray-400 hover:text-gray-200 transition-colors"
            >
              Gunakan Tanpa Crop
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-medium text-gray-400 hover:text-gray-200 transition-colors"
            >
              Batal
            </button>
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleApplyCrop}
              disabled={isProcessing || !imageLoaded}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs py-2 px-4 rounded-xl transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2"
            >
              {isProcessing ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Check size={16} />
              )}
              <span>Terapkan & Simpan Crop</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
