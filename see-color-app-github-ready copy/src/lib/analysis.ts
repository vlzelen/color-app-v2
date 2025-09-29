import { calculateChroma, getExpectedSkinTone } from './color';
import { createDownsampledCanvas, sampleCenteredEllipse, sampleCheekMasks } from './sampling';
import { detectFaceCheeks, fallbackSkinMask } from './face';

export type AnalysisResult = {
  image: {
    meanOKLab: { L: number; a: number; b: number };
    neutralState: "neutral" | "slightly_off" | "off";
    castLabel: string;
    recommendations: string[];
    exposureHint?: string;
  };
  skin?: {
    found: boolean;
    meanOKLab: { L: number; a: number; b: number };
    neutralState: "neutral" | "slightly_off" | "off";
    castLabel: string;
    recommendations: string[];
    exposureHint?: string;
  };
};

export async function analyzeBitmap(bitmap: ImageBitmap): Promise<AnalysisResult> {
  // Create downsampled canvas for analysis
  const canvas = createDownsampledCanvas(bitmap);
  
  // Analyze global image
  const imageResult = analyzeImage(canvas);
  
  // Try to detect and analyze skin
  let skinResult = null;
  try {
    const cheekMasks = await detectFaceCheeks(bitmap);
    
    if (cheekMasks && cheekMasks.length > 0) {
      const skinSample = sampleCheekMasks(canvas, cheekMasks);
      skinResult = analyzeSkin(skinSample.meanOKLab);
    } else {
      // Try fallback skin detection
      const fallbackMasks = fallbackSkinMask(canvas);
      
      if (fallbackMasks && fallbackMasks.length > 0) {
        const skinSample = sampleCheekMasks(canvas, fallbackMasks);
        skinResult = analyzeSkin(skinSample.meanOKLab);
      }
    }
  } catch (error) {
    console.warn('Skin detection failed:', error);
  }
  
  return {
    image: imageResult,
    skin: skinResult || undefined
  };
}

function analyzeImage(canvas: HTMLCanvasElement) {
  // Use centered ellipse for more representative sampling
  const sample = sampleCenteredEllipse(canvas);
  const { L, a, b } = sample.meanOKLab;
  
  // Calculate chroma
  const chroma = calculateChroma(a, b);
  
  // Determine neutral state
  let neutralState: "neutral" | "slightly_off" | "off";
  if (chroma < 0.02) {
    neutralState = "neutral";
  } else if (chroma < 0.04) {
    neutralState = "slightly_off";
  } else {
    neutralState = "off";
  }
  
  // Generate cast label
  const castLabel = generateCastLabel(a, b);
  
  // Generate recommendations
  const recommendations = generateRecommendations(a, b, chroma);
  
  // Check for exposure issues
  const exposureHint = checkExposureHint(L, a, b);
  
  return {
    meanOKLab: { L, a, b },
    neutralState,
    castLabel,
    recommendations,
    exposureHint
  };
}

function analyzeSkin(meanOKLab: { L: number; a: number; b: number }) {
  const { L, a, b } = meanOKLab;
  
  // Get expected healthy skin tone for this lightness
  const expected = getExpectedSkinTone(L);
  const deltaA = a - expected.a;
  const deltaB = b - expected.b;
  const skinChroma = Math.sqrt(deltaA * deltaA + deltaB * deltaB);
  
  // Determine neutral state for skin
  let neutralState: "neutral" | "slightly_off" | "off";
  if (skinChroma < 0.015) {
    neutralState = "neutral";
  } else if (skinChroma < 0.04) {
    neutralState = "slightly_off";
  } else {
    neutralState = "off";
  }
  
  // Generate cast label for skin
  const castLabel = generateCastLabel(deltaA, deltaB);
  
  // Generate recommendations for skin
  const recommendations = generateRecommendations(deltaA, deltaB, skinChroma);
  
  // Check for exposure issues
  const exposureHint = checkExposureHint(L, a, b);
  
  return {
    found: true,
    meanOKLab: { L, a, b },
    neutralState,
    castLabel,
    recommendations,
    exposureHint
  };
}

function generateCastLabel(a: number, b: number): string {
  const absA = Math.abs(a);
  const absB = Math.abs(b);
  
  if (absA < 0.01 && absB < 0.01) {
    return "neutral";
  }
  
  const labels: string[] = [];
  
  // Determine dominant axis
  if (absA >= absB) {
    // Magenta/Green axis is dominant
    if (a > 0) {
      labels.push("leans magenta");
    } else {
      labels.push("leans green");
    }
  } else {
    // Yellow/Blue axis is dominant
    if (b > 0) {
      labels.push("leans yellow");
    } else {
      labels.push("leans blue");
    }
  }
  
  // Add secondary axis if significant
  if (absA >= 0.01 && absB >= 0.01 && Math.abs(absA - absB) < 0.01) {
    if (b > 0) {
      labels.push("and yellow");
    } else {
      labels.push("and blue");
    }
  }
  
  return labels.join(" ");
}

function generateRecommendations(a: number, b: number, chroma: number): string[] {
  const recommendations: string[] = [];
  
  // Determine recommendation size
  let size: string;
  if (chroma < 0.02) {
    size = "small";
  } else if (chroma < 0.05) {
    size = "medium";
  } else {
    size = "large";
  }
  
  // Generate recommendations based on axis
  if (Math.abs(a) >= 0.01) {
    if (a > 0) {
      recommendations.push(`Add Green or reduce Magenta. ${size.charAt(0).toUpperCase() + size.slice(1)} move.`);
    } else {
      recommendations.push(`Add Magenta or reduce Green. ${size.charAt(0).toUpperCase() + size.slice(1)} move.`);
    }
  }
  
  if (Math.abs(b) >= 0.01) {
    if (b > 0) {
      recommendations.push(`Add Blue or reduce Yellow. ${size.charAt(0).toUpperCase() + size.slice(1)} move.`);
    } else {
      recommendations.push(`Add Yellow or reduce Blue. ${size.charAt(0).toUpperCase() + size.slice(1)} move.`);
    }
  }
  
  // Add general white balance recommendation that matches the neutral preview
  if (chroma > 0.02) {
    recommendations.push(`Adjust white balance for healthy skin tones (like the "Healthy Skin" preview shows).`);
  }
  
  // Add Red/Cyan recommendations if needed
  if (Math.abs(a) < 0.01 && Math.abs(b) < 0.01 && chroma > 0.02) {
    // Check for red/cyan cast via RGB balance
    recommendations.push(`Check Red/Cyan balance. ${size.charAt(0).toUpperCase() + size.slice(1)} move.`);
  }
  
  return recommendations;
}

function checkExposureHint(L: number, _a: number, b: number): string | undefined {
  // Check for underexposure with blue cast
  if (L < 0.45 && b < 0) {
    return "Increase exposure slightly, then re-check color.";
  }
  
  // Check for overexposure
  if (L > 0.85) {
    return "Consider reducing exposure slightly, then re-check color.";
  }
  
  return undefined;
}

// Calculate gray confidence for a specific point
export function calculateGrayConfidence(canvas: HTMLCanvasElement, x: number, y: number): number {
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  const imageData = ctx.getImageData(Math.floor(x), Math.floor(y), 1, 1);
  const data = imageData.data;
  
  const r = data[0] / 255;
  const g = data[1] / 255;
  const b = data[2] / 255;
  
  // Calculate chroma in OKLab
  const { a, b: b2 } = srgbToOKLab(r, g, b);
  const chroma = calculateChroma(a, b2);
  
  // Calculate channel spread in sRGB
  const channelSpread = Math.max(r, g, b) - Math.min(r, g, b);
  
  // Gray confidence calculation
  const chromaConfidence = 1 - Math.min(1, chroma / 0.05);
  const channelConfidence = 1 - Math.min(1, channelSpread / 0.08);
  
  return Math.round(100 * chromaConfidence * channelConfidence);
}

// Import srgbToOKLab for gray confidence calculation
import { srgbToOKLab } from './color';
