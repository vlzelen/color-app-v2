import { create } from 'zustand';
import { AnalysisResult } from '../lib/analysis';

interface AppState {
  // Image state
  imageBitmap: ImageBitmap | null;
  imageUrl: string | null;
  
  // Analysis state
  analysisResult: AnalysisResult | null;
  isAnalyzing: boolean;
  analysisError: string | null;
  
  // UI state
  selectedPoint: { x: number; y: number } | null;
  grayConfidence: number | null;
  
  // Actions
  setImageBitmap: (bitmap: ImageBitmap | null) => void;
  setImageUrl: (url: string | null) => void;
  setAnalysisResult: (result: AnalysisResult | null) => void;
  setIsAnalyzing: (analyzing: boolean) => void;
  setAnalysisError: (error: string | null) => void;
  setSelectedPoint: (point: { x: number; y: number } | null) => void;
  setGrayConfidence: (confidence: number | null) => void;
  
  // Reset
  reset: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Initial state
  imageBitmap: null,
  imageUrl: null,
  analysisResult: null,
  isAnalyzing: false,
  analysisError: null,
  selectedPoint: null,
  grayConfidence: null,
  
  // Actions
  setImageBitmap: (bitmap) => set({ imageBitmap: bitmap }),
  setImageUrl: (url) => set({ imageUrl: url }),
  setAnalysisResult: (result) => set({ analysisResult: result }),
  setIsAnalyzing: (analyzing) => set({ isAnalyzing: analyzing }),
  setAnalysisError: (error) => set({ analysisError: error }),
  setSelectedPoint: (point) => set({ selectedPoint: point }),
  setGrayConfidence: (confidence) => set({ grayConfidence: confidence }),
  
  // Reset
  reset: () => set({
    imageBitmap: null,
    imageUrl: null,
    analysisResult: null,
    isAnalyzing: false,
    analysisError: null,
    selectedPoint: null,
    grayConfidence: null
  })
}));
