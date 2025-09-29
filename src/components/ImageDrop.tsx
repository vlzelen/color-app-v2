import React, { useCallback, useRef } from 'react';
import { useAppStore } from '../store/useAppStore';

interface ImageDropProps {
  onImageLoad: (bitmap: ImageBitmap) => void;
}

export default function ImageDrop({ onImageLoad }: ImageDropProps) {
  const { imageUrl, setImageUrl } = useAppStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = React.useState(false);

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (JPG, PNG, etc.)');
      return;
    }

    try {
      const bitmap = await createImageBitmap(file);
      const url = URL.createObjectURL(file);
      setImageUrl(url);
      onImageLoad(bitmap);
    } catch (error) {
      console.error('Error loading image:', error);
      alert('Error loading image. Please try again.');
    }
  }, [onImageLoad, setImageUrl]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const loadSampleImage = useCallback(async (sampleName: string) => {
    try {
      const response = await fetch(`/samples/${sampleName}`);
      const blob = await response.blob();
      const bitmap = await createImageBitmap(blob);
      const url = URL.createObjectURL(blob);
      setImageUrl(url);
      onImageLoad(bitmap);
    } catch (error) {
      console.error('Error loading sample image:', error);
      alert('Error loading sample image. Please try uploading your own image.');
    }
  }, [onImageLoad, setImageUrl]);

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragOver 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInput}
          className="hidden"
        />
        
        {imageUrl ? (
          <div className="space-y-2">
            <img
              src={imageUrl}
              alt="Uploaded photo preview"
              className="max-w-full max-h-64 mx-auto rounded-lg shadow-md"
            />
            <p className="text-sm text-gray-600">Click to change image</p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-4xl text-gray-400">📷</div>
            <p className="text-lg font-medium text-gray-700">
              Drop an image here or click to browse
            </p>
            <p className="text-sm text-gray-500">
              Supports JPG, PNG, and other image formats
            </p>
          </div>
        )}
      </div>

      {/* Sample Images */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-700">Or try a sample:</p>
        <div className="flex gap-2">
          <button
            onClick={() => loadSampleImage('portrait.jpg')}
            className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            Sample Portrait
          </button>
          <button
            onClick={() => loadSampleImage('gray-card.jpg')}
            className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            Gray Card
          </button>
        </div>
      </div>
    </div>
  );
}
