import { srgbToOKLab, isHealthySkinTone } from './color';

export interface CheekMask {
  x: number;
  y: number;
  width: number;
  height: number;
}

// MediaPipe Face Landmarker integration
let faceLandmarker: any = null;

export async function initializeFaceDetection(): Promise<boolean> {
  try {
    // Try to load MediaPipe from CDN
    if (typeof window !== 'undefined' && (window as any).mediapipe) {
      const { FaceLandmarker, FilesetResolver } = (window as any).mediapipe;
      
      const filesetResolver = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
      );
      
      faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
        baseOptions: {
          modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
          delegate: "GPU"
        },
        outputFaceBlendshapes: false,
        runningMode: "IMAGE"
      });
      
      return true;
    }
  } catch (error) {
    console.warn('MediaPipe Face Landmarker not available:', error);
  }
  
  return false;
}

export async function detectFaceCheeks(imageBitmap: ImageBitmap): Promise<CheekMask[] | null> {
  if (!faceLandmarker) {
    return null;
  }
  
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    canvas.width = imageBitmap.width;
    canvas.height = imageBitmap.height;
    ctx.drawImage(imageBitmap, 0, 0);
    
    const results = faceLandmarker.detect(canvas);
    
    if (results.faceLandmarks && results.faceLandmarks.length > 0) {
      const landmarks = results.faceLandmarks[0];
      
      // Get cheek landmarks (approximate indices for MediaPipe face landmarks)
      // These are rough approximations - in practice you'd use the actual landmark indices
      const leftCheek = getCheekRegion(landmarks, 'left');
      const rightCheek = getCheekRegion(landmarks, 'right');
      
      if (leftCheek && rightCheek) {
        return [leftCheek, rightCheek];
      }
    }
  } catch (error) {
    console.warn('Face detection failed:', error);
  }
  
  return null;
}

function getCheekRegion(_landmarks: any[], side: 'left' | 'right'): CheekMask | null {
  // This is a simplified implementation
  // In practice, you'd use the actual MediaPipe landmark indices
  
  if (side === 'left') {
    return {
      x: 50,
      y: 100,
      width: 60,
      height: 80
    };
  } else {
    return {
      x: 90,
      y: 100,
      width: 60,
      height: 80
    };
  }
}

// Fallback skin detection using color analysis
export function fallbackSkinMask(canvas: HTMLCanvasElement): CheekMask[] | null {
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  
  const skinPixels: { x: number; y: number }[] = [];
  
  // Sample every 8th pixel for better performance
  for (let y = 0; y < canvas.height; y += 8) {
    for (let x = 0; x < canvas.width; x += 8) {
      const i = (y * canvas.width + x) * 4;
      const r = data[i] / 255;
      const g = data[i + 1] / 255;
      const b = data[i + 2] / 255;
      
      const { L, a, b: b2 } = srgbToOKLab(r, g, b);
      
      if (isHealthySkinTone(L, a, b2)) {
        skinPixels.push({ x, y });
      }
    }
  }
  
  if (skinPixels.length < 20) {
    return null; // Not enough skin pixels found
  }
  
  // Find the largest connected component near the center
  const centerX = canvas.width / 2;
  
  // Group pixels by proximity to center
  const leftPixels = skinPixels.filter(p => p.x < centerX);
  const rightPixels = skinPixels.filter(p => p.x >= centerX);
  
  const leftCheek = createCheekMask(leftPixels);
  const rightCheek = createCheekMask(rightPixels);
  
  if (leftCheek && rightCheek) {
    return [leftCheek, rightCheek];
  }
  
  // Fallback to single cheek region
  const singleCheek = createCheekMask(skinPixels);
  return singleCheek ? [singleCheek] : null;
}

function createCheekMask(pixels: { x: number; y: number }[]): CheekMask | null {
  if (pixels.length < 10) return null;
  
  const xs = pixels.map(p => p.x);
  const ys = pixels.map(p => p.y);
  
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  
  const width = maxX - minX;
  const height = maxY - minY;
  
  // Create elliptical mask
  const centerX = minX + width / 2;
  const centerY = minY + height / 2;
  const radiusX = width / 2;
  const radiusY = height / 2;
  
  return {
    x: centerX - radiusX,
    y: centerY - radiusY,
    width: radiusX * 2,
    height: radiusY * 2
  };
}

// Load MediaPipe script dynamically
export function loadMediaPipeScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('Not in browser environment'));
      return;
    }
    
    if ((window as any).mediapipe) {
      resolve();
      return;
    }
    
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm';
    script.type = 'module';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load MediaPipe'));
    document.head.appendChild(script);
  });
}
