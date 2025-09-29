// Color conversion utilities for RGB, Linear RGB, and OKLab color spaces

export function srgbToLinear(c: number): number {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

export function linearToSrgb(c: number): number {
  return c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
}

// Linear sRGB [0..1] to OKLab
export function linearRgbToOKLab(r: number, g: number, b: number) {
  // LMS from Linear sRGB
  const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
  const m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
  const s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;

  const l_ = Math.cbrt(l);
  const m_ = Math.cbrt(m);
  const s_ = Math.cbrt(s);

  const L = 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_;
  const a = 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_;
  const b2 = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_;
  return { L, a, b: b2 };
}

// OKLab to Linear sRGB [0..1]
export function oklabToLinearRgb(L: number, a: number, b: number) {
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.2914855480 * b;

  const l = l_ * l_ * l_;
  const m = m_ * m_ * m_;
  const s = s_ * s_ * s_;

  const r = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const b2 = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s;

  return { r: Math.max(0, Math.min(1, r)), g: Math.max(0, Math.min(1, g)), b: Math.max(0, Math.min(1, b2)) };
}

// Convert sRGB to OKLab
export function srgbToOKLab(r: number, g: number, b: number) {
  const rLinear = srgbToLinear(r);
  const gLinear = srgbToLinear(g);
  const bLinear = srgbToLinear(b);
  return linearRgbToOKLab(rLinear, gLinear, bLinear);
}

// Convert OKLab to sRGB
export function oklabToSrgb(L: number, a: number, b: number) {
  const { r, g, b: b2 } = oklabToLinearRgb(L, a, b);
  return {
    r: linearToSrgb(r),
    g: linearToSrgb(g),
    b: linearToSrgb(b2)
  };
}

// Calculate chroma (color intensity) from OKLab
export function calculateChroma(a: number, b: number): number {
  return Math.sqrt(a * a + b * b);
}

// Calculate distance between two OKLab colors
export function oklabDistance(lab1: { L: number; a: number; b: number }, lab2: { L: number; a: number; b: number }): number {
  const dL = lab1.L - lab2.L;
  const da = lab1.a - lab2.a;
  const db = lab1.b - lab2.b;
  return Math.sqrt(dL * dL + da * da + db * db);
}

// Check if a color is in the healthy skin tone range
export function isHealthySkinTone(L: number, a: number, b: number): boolean {
  // More lenient skin detection to catch more skin tones
  return L >= 0.35 && L <= 0.90 && 
         a >= 0.02 && a <= 0.35 && 
         b >= 0.02 && b <= 0.40;
}

// Get expected healthy skin tone for a given lightness
export function getExpectedSkinTone(L: number): { a: number; b: number } {
  // Approximate healthy skin line: b ≈ 0.8a + 0.02
  const a = Math.max(0.10, Math.min(0.24, (L - 0.5) * 0.3 + 0.15));
  const b = Math.max(0.10, Math.min(0.28, 0.8 * a + 0.02));
  return { a, b };
}
