import React, { useCallback, useRef, useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { calculateGrayConfidence } from '../lib/analysis';
// import { srgbToOKLab, oklabToSrgb } from '../lib/color'; // Not currently used
import ImageDrop from '../components/ImageDrop';
import AnalyzerPanel from '../components/AnalyzerPanel';
import ScopeCard from '../components/ScopeCard';
import ResultsCard from '../components/ResultsCard';

export default function App() {
  const { 
    imageBitmap, 
    imageUrl, 
    setImageBitmap, 
    setSelectedPoint, 
    setGrayConfidence 
  } = useAppStore();
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showNeutralPreview, setShowNeutralPreview] = useState(false);
  const [showColorCast, setShowColorCast] = useState(false);

  const handleImageLoad = useCallback((bitmap: ImageBitmap) => {
    setImageBitmap(bitmap);
  }, [setImageBitmap]);

  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!imageBitmap || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);

    setSelectedPoint({ x, y });
    
    // Calculate gray confidence for the clicked point
    const confidence = calculateGrayConfidence(canvas, x, y);
    setGrayConfidence(confidence);
  }, [imageBitmap, setSelectedPoint, setGrayConfidence]);

  // Create neutral preview by neutralizing the image
  const createNeutralPreview = useCallback((canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    // Simple, reliable approach - apply a gentle healthy skin correction
    // This simulates what the image would look like with proper skin tones
    
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      // Apply gentle healthy skin correction
      // Slightly warm and balance the colors for natural skin tones
      const newR = Math.max(0, Math.min(255, r * 1.06)); // Gentle warm boost
      const newG = Math.max(0, Math.min(255, g * 1.02)); // Slight green balance
      const newB = Math.max(0, Math.min(255, b * 0.97)); // Reduce cool cast
      
      data[i] = Math.round(newR);
      data[i + 1] = Math.round(newG);
      data[i + 2] = Math.round(newB);
    }
    
    ctx.putImageData(imageData, 0, 0);
  }, []);

  // Create color cast overlay to visualize color shifts
  const createColorCastOverlay = useCallback((canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    // Simple approach: enhance saturation to make color casts more visible
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      // Calculate luminance
      const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
      
      // Enhance saturation by 20% to make color casts more visible
      const saturationBoost = 0.2;
      const newR = Math.max(0, Math.min(255, luminance + (r - luminance) * (1 + saturationBoost)));
      const newG = Math.max(0, Math.min(255, luminance + (g - luminance) * (1 + saturationBoost)));
      const newB = Math.max(0, Math.min(255, luminance + (b - luminance) * (1 + saturationBoost)));
      
      data[i] = Math.round(newR);
      data[i + 1] = Math.round(newG);
      data[i + 2] = Math.round(newB);
    }
    
    ctx.putImageData(imageData, 0, 0);
  }, []);

  // Draw image on canvas when it loads or preview mode changes
  React.useEffect(() => {
    if (imageBitmap && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
      
      // Set canvas size to match image
      canvas.width = imageBitmap.width;
      canvas.height = imageBitmap.height;
      
      // Always start with original image
      ctx.drawImage(imageBitmap, 0, 0);
      
      // Apply preview effects if enabled
      if (showNeutralPreview) {
        createNeutralPreview(canvas);
      } else if (showColorCast) {
        createColorCastOverlay(canvas);
      }
      
      // Canvas redrawn with preview modes
    }
  }, [imageBitmap, showNeutralPreview, showColorCast, createNeutralPreview, createColorCastOverlay]);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900">See Color</h1>
          <p className="text-sm text-gray-600">Color Cast Analysis for Photographers</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Image Upload */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Upload Image</h2>
              <ImageDrop onImageLoad={handleImageLoad} />
            </div>

            {/* Canvas Preview */}
            {imageUrl && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">Preview</h2>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setShowNeutralPreview(!showNeutralPreview);
                        setShowColorCast(false);
                      }}
                      className={`px-3 py-1 text-xs rounded-md transition-colors ${
                        showNeutralPreview 
                          ? 'bg-green-100 text-green-800 border border-green-300' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {showNeutralPreview ? '✓ Healthy Skin' : 'Healthy Skin'}
                    </button>
                    <button
                      onClick={() => {
                        setShowColorCast(!showColorCast);
                        setShowNeutralPreview(false);
                      }}
                      className={`px-3 py-1 text-xs rounded-md transition-colors ${
                        showColorCast 
                          ? 'bg-blue-100 text-blue-800 border border-blue-300' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {showColorCast ? '✓ Color Cast' : 'Color Cast'}
                    </button>
                  </div>
                </div>
                <div className="relative">
                  <canvas
                    ref={canvasRef}
                    onClick={handleCanvasClick}
                    className="max-w-full h-auto border border-gray-200 rounded-lg cursor-crosshair"
                    style={{ maxHeight: '400px' }}
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Click on the image to analyze color at that point
                    {showNeutralPreview && (
                      <span className="text-green-600 font-medium"> • Showing healthy skin tones</span>
                    )}
                    {showColorCast && (
                      <span className="text-blue-600 font-medium"> • Showing color cast overlay</span>
                    )}
                  </p>
                </div>
              </div>
            )}

            {/* Scope Card */}
            <ScopeCard />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Analyzer Panel */}
            <AnalyzerPanel />

            {/* Results Card */}
            <ResultsCard />
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">How to Use</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>
              <h4 className="font-medium mb-2">1. Upload Your Image</h4>
              <p>Drag and drop or click to upload a JPG or PNG image. Try the sample images to get started.</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">2. Analyze Color Cast</h4>
              <p>Click "Analyze Color Cast" to detect neutral issues and get specific recommendations.</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">3. Check Specific Points</h4>
              <p>Click anywhere on the image to see gray confidence at that point.</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">4. Apply Fixes</h4>
              <p>Use the recommendations to adjust your image in your photo editor.</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-sm text-gray-500 text-center">
            See Color - Privacy-first color cast analysis. All processing happens in your browser.
          </p>
        </div>
      </footer>
    </div>
  );
}
