import { srgbToLinear, linearRgbToOKLab } from './color';

export interface SamplingResult {
  meanLinearRgb: { r: number; g: number; b: number };
  meanOKLab: { L: number; a: number; b: number };
}

// Create a downsampled canvas with max 256px on the long side for faster processing
export function createDownsampledCanvas(bitmap: ImageBitmap): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  
  const maxSize = 256; // Reduced from 512 for faster processing
  const scale = Math.min(maxSize / bitmap.width, maxSize / bitmap.height);
  
  canvas.width = Math.floor(bitmap.width * scale);
  canvas.height = Math.floor(bitmap.height * scale);
  
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  
  return canvas;
}

// Sample all pixels in a canvas
export function sampleAllPixels(canvas: HTMLCanvasElement): SamplingResult {
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  
  let sumR = 0, sumG = 0, sumB = 0;
  let sumLR = 0, sumLG = 0, sumLB = 0;
  let pixelCount = 0;
  
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i] / 255;
    const g = data[i + 1] / 255;
    const b = data[i + 2] / 255;
    
    const lr = srgbToLinear(r);
    const lg = srgbToLinear(g);
    const lb = srgbToLinear(b);
    
    sumR += r;
    sumG += g;
    sumB += b;
    sumLR += lr;
    sumLG += lg;
    sumLB += lb;
    pixelCount++;
  }
  
  // const meanR = sumR / pixelCount;
  // const meanG = sumG / pixelCount;
  // const meanB = sumB / pixelCount;
  
  const meanLR = sumLR / pixelCount;
  const meanLG = sumLG / pixelCount;
  const meanLB = sumLB / pixelCount;
  
  const { L, a, b } = linearRgbToOKLab(meanLR, meanLG, meanLB);
  
  return {
    meanLinearRgb: { r: meanLR, g: meanLG, b: meanLB },
    meanOKLab: { L, a, b }
  };
}

// Sample pixels within a centered ellipse (40% width, 60% height)
export function sampleCenteredEllipse(canvas: HTMLCanvasElement): SamplingResult {
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radiusX = canvas.width * 0.2; // 40% width / 2
  const radiusY = canvas.height * 0.3; // 60% height / 2
  
  let sumR = 0, sumG = 0, sumB = 0;
  let sumLR = 0, sumLG = 0, sumLB = 0;
  let pixelCount = 0;
  
  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      // Check if point is inside ellipse
      const dx = (x - centerX) / radiusX;
      const dy = (y - centerY) / radiusY;
      if (dx * dx + dy * dy > 1) continue;
      
      const i = (y * canvas.width + x) * 4;
      const r = data[i] / 255;
      const g = data[i + 1] / 255;
      const b = data[i + 2] / 255;
      
      const lr = srgbToLinear(r);
      const lg = srgbToLinear(g);
      const lb = srgbToLinear(b);
      
      sumR += r;
      sumG += g;
      sumB += b;
      sumLR += lr;
      sumLG += lg;
      sumLB += lb;
      pixelCount++;
    }
  }
  
  if (pixelCount === 0) {
    // Fallback to center point if ellipse is empty
    const centerI = (Math.floor(centerY) * canvas.width + Math.floor(centerX)) * 4;
    const r = data[centerI] / 255;
    const g = data[centerI + 1] / 255;
    const b = data[centerI + 2] / 255;
    
    const lr = srgbToLinear(r);
    const lg = srgbToLinear(g);
    const lb = srgbToLinear(b);
    
    const { L, a, b: b2 } = linearRgbToOKLab(lr, lg, lb);
    
    return {
      meanLinearRgb: { r: lr, g: lg, b: lb },
      meanOKLab: { L, a, b: b2 }
    };
  }
  
  // const meanR = sumR / pixelCount;
  // const meanG = sumG / pixelCount;
  // const meanB = sumB / pixelCount;
  
  const meanLR = sumLR / pixelCount;
  const meanLG = sumLG / pixelCount;
  const meanLB = sumLB / pixelCount;
  
  const { L, a, b } = linearRgbToOKLab(meanLR, meanLG, meanLB);
  
  return {
    meanLinearRgb: { r: meanLR, g: meanLG, b: meanLB },
    meanOKLab: { L, a, b }
  };
}

// Sample pixels within cheek masks
export function sampleCheekMasks(canvas: HTMLCanvasElement, cheekMasks: { x: number; y: number; width: number; height: number }[]): SamplingResult {
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  
  let sumR = 0, sumG = 0, sumB = 0;
  let sumLR = 0, sumLG = 0, sumLB = 0;
  let pixelCount = 0;
  
  for (const mask of cheekMasks) {
    const startX = Math.max(0, Math.floor(mask.x));
    const startY = Math.max(0, Math.floor(mask.y));
    const endX = Math.min(canvas.width, Math.floor(mask.x + mask.width));
    const endY = Math.min(canvas.height, Math.floor(mask.y + mask.height));
    
    for (let y = startY; y < endY; y++) {
      for (let x = startX; x < endX; x++) {
        // Check if point is inside ellipse
        const centerX = mask.x + mask.width / 2;
        const centerY = mask.y + mask.height / 2;
        const radiusX = mask.width / 2;
        const radiusY = mask.height / 2;
        
        const dx = (x - centerX) / radiusX;
        const dy = (y - centerY) / radiusY;
        if (dx * dx + dy * dy > 1) continue;
        
        const i = (y * canvas.width + x) * 4;
        const r = data[i] / 255;
        const g = data[i + 1] / 255;
        const b = data[i + 2] / 255;
        
        const lr = srgbToLinear(r);
        const lg = srgbToLinear(g);
        const lb = srgbToLinear(b);
        
        sumR += r;
        sumG += g;
        sumB += b;
        sumLR += lr;
        sumLG += lg;
        sumLB += lb;
        pixelCount++;
      }
    }
  }
  
  if (pixelCount === 0) {
    // Fallback to center of first mask
    const mask = cheekMasks[0];
    const centerX = Math.floor(mask.x + mask.width / 2);
    const centerY = Math.floor(mask.y + mask.height / 2);
    const i = (centerY * canvas.width + centerX) * 4;
    const r = data[i] / 255;
    const g = data[i + 1] / 255;
    const b = data[i + 2] / 255;
    
    const lr = srgbToLinear(r);
    const lg = srgbToLinear(g);
    const lb = srgbToLinear(b);
    
    const { L, a, b: b2 } = linearRgbToOKLab(lr, lg, lb);
    
    return {
      meanLinearRgb: { r: lr, g: lg, b: lb },
      meanOKLab: { L, a, b: b2 }
    };
  }
  
  const meanLR = sumLR / pixelCount;
  const meanLG = sumLG / pixelCount;
  const meanLB = sumLB / pixelCount;
  
  const { L, a, b } = linearRgbToOKLab(meanLR, meanLG, meanLB);
  
  return {
    meanLinearRgb: { r: meanLR, g: meanLG, b: meanLB },
    meanOKLab: { L, a, b }
  };
}

// Sample a single pixel at coordinates
export function samplePixel(canvas: HTMLCanvasElement, x: number, y: number): SamplingResult {
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  const imageData = ctx.getImageData(Math.floor(x), Math.floor(y), 1, 1);
  const data = imageData.data;
  
  const r = data[0] / 255;
  const g = data[1] / 255;
  const b = data[2] / 255;
  
  const lr = srgbToLinear(r);
  const lg = srgbToLinear(g);
  const lb = srgbToLinear(b);
  
  const { L, a, b: b2 } = linearRgbToOKLab(lr, lg, lb);
  
  return {
    meanLinearRgb: { r: lr, g: lg, b: lb },
    meanOKLab: { L, a, b: b2 }
  };
}
