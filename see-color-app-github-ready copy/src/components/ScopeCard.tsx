import { useAppStore } from '../store/useAppStore';

export default function ScopeCard() {
  const { analysisResult, grayConfidence, selectedPoint } = useAppStore();

  if (!analysisResult) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Scope</h2>
        <p className="text-sm text-gray-500">Run analysis to see color measurements</p>
      </div>
    );
  }

  const { image, skin } = analysisResult;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center space-x-2 mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Scope</h2>
        <div className="relative group">
          <div className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold cursor-help">
            i
          </div>
          <div className="absolute bottom-full left-0 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 max-w-sm">
            <div>
              <div className="font-semibold mb-1">Scope Measurements:</div>
              <div className="space-y-1">
                <div><strong>Image Mean OKLab:</strong> Overall color balance of the image</div>
                <div><strong>Skin Mean OKLab:</strong> Color analysis of detected skin regions</div>
                <div><strong>Gray Confidence:</strong> How neutral a clicked point is (0-100%)</div>
                <div className="text-yellow-600 font-medium">• Neutral values: a≈0, b≈0</div>
                <div className="text-yellow-600">• L can be any value (lightness)</div>
              </div>
            </div>
            <div className="absolute top-full left-4 border-4 border-transparent border-t-gray-800"></div>
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        {/* Image Measurements */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Image Mean OKLab</h3>
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div className="bg-gray-50 p-2 rounded">
              <div className="text-xs text-gray-500">L</div>
              <div className="font-mono">{image.meanOKLab.L.toFixed(3)}</div>
            </div>
            <div className="bg-gray-50 p-2 rounded">
              <div className="text-xs text-gray-500">a</div>
              <div className="font-mono">{image.meanOKLab.a.toFixed(3)}</div>
            </div>
            <div className="bg-gray-50 p-2 rounded">
              <div className="text-xs text-gray-500">b</div>
              <div className="font-mono">{image.meanOKLab.b.toFixed(3)}</div>
            </div>
          </div>
          
          {/* Show Skin Results in General Section if Available */}
          {skin && (
            <div className="mt-3">
              <h4 className="text-xs font-medium text-gray-600 mb-2">Skin Analysis (from general image):</h4>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div className="bg-green-50 p-2 rounded border border-green-200">
                  <div className="text-xs text-green-600">L</div>
                  <div className="font-mono text-green-700">{skin.meanOKLab.L.toFixed(3)}</div>
                </div>
                <div className="bg-green-50 p-2 rounded border border-green-200">
                  <div className="text-xs text-green-600">a</div>
                  <div className="font-mono text-green-700">{skin.meanOKLab.a.toFixed(3)}</div>
                </div>
                <div className="bg-green-50 p-2 rounded border border-green-200">
                  <div className="text-xs text-green-600">b</div>
                  <div className="font-mono text-green-700">{skin.meanOKLab.b.toFixed(3)}</div>
                </div>
              </div>
            </div>
          )}
          
          {/* Slider Recommendations */}
          <div className="mt-3 p-3 bg-blue-50 rounded-lg">
            <h4 className="text-xs font-semibold text-blue-800 mb-2">Slider Adjustments:</h4>
            <div className="space-y-1 text-xs">
              {Math.abs(image.meanOKLab.a) >= 0.01 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    {image.meanOKLab.a > 0 ? 'Magenta/Green:' : 'Green/Magenta:'}
                  </span>
                  <span className="font-mono text-blue-700">
                    {image.meanOKLab.a > 0 
                      ? `-${Math.abs(image.meanOKLab.a * 100).toFixed(0)}`
                      : `+${Math.abs(image.meanOKLab.a * 100).toFixed(0)}`
                    }
                  </span>
                </div>
              )}
              {Math.abs(image.meanOKLab.b) >= 0.01 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    {image.meanOKLab.b > 0 ? 'Yellow/Blue:' : 'Blue/Yellow:'}
                  </span>
                  <span className="font-mono text-blue-700">
                    {image.meanOKLab.b > 0 
                      ? `-${Math.abs(image.meanOKLab.b * 100).toFixed(0)}`
                      : `+${Math.abs(image.meanOKLab.b * 100).toFixed(0)}`
                    }
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Temperature:</span>
                <span className="font-mono text-blue-700">
                  {image.meanOKLab.b > 0 ? 'Cooler' : image.meanOKLab.b < -0.01 ? 'Warmer' : 'Neutral'}
                </span>
              </div>
            </div>
            
            {/* Software-Specific Tools */}
            <div className="mt-3 pt-3 border-t border-blue-200">
              <h5 className="text-xs font-semibold text-blue-800 mb-2">Software Tools:</h5>
              <div className="space-y-2 text-xs">
                <div>
                  <span className="font-medium text-gray-700">Lightroom:</span>
                  <div className="text-gray-600 ml-2">
                    • White Balance (Temp/Tint sliders)<br/>
                    • HSL Color Mixer<br/>
                    • Color Grading panel
                    {skin && (
                      <>
                        <br/>• HSL Orange/Red sliders (skin)
                      </>
                    )}
                  </div>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Photoshop:</span>
                  <div className="text-gray-600 ml-2">
                    • Color Balance adjustment<br/>
                    • Hue/Saturation<br/>
                    • Camera Raw Filter
                    {skin && (
                      <>
                        <br/>• Select → Color Range (skin)
                      </>
                    )}
                  </div>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Capture One:</span>
                  <div className="text-gray-600 ml-2">
                    • White Balance tool<br/>
                    • Color Editor<br/>
                    • Skin Tone tool
                    {skin && (
                      <>
                        <br/>• Skin Tone tool (dedicated)
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Skin Measurements */}
        {skin && (
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="text-sm font-medium text-gray-700">Skin Mean OKLab</h3>
              <div className="relative group">
                <div className="w-4 h-4 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-bold cursor-help">
                  i
                </div>
                <div className="absolute bottom-full left-0 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 max-w-sm">
                  <div>
                    <div className="font-semibold mb-1">Skin Analysis:</div>
                    <div className="space-y-1">
                      <div>• Detects face/skin regions automatically</div>
                      <div>• Compares to healthy skin tone ranges</div>
                      <div>• Provides targeted skin corrections</div>
                      <div>• Uses MediaPipe or color-based detection</div>
                    </div>
                  </div>
                  <div className="absolute top-full left-4 border-4 border-transparent border-t-gray-800"></div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div className="bg-gray-50 p-2 rounded">
                <div className="text-xs text-gray-500">L</div>
                <div className="font-mono">{skin.meanOKLab.L.toFixed(3)}</div>
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <div className="text-xs text-gray-500">a</div>
                <div className="font-mono">{skin.meanOKLab.a.toFixed(3)}</div>
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <div className="text-xs text-gray-500">b</div>
                <div className="font-mono">{skin.meanOKLab.b.toFixed(3)}</div>
              </div>
            </div>
            
            {/* Skin Slider Recommendations */}
            <div className="mt-3 p-3 bg-green-50 rounded-lg">
              <h4 className="text-xs font-semibold text-green-800 mb-2">Skin Adjustments:</h4>
              <div className="space-y-1 text-xs">
                {Math.abs(skin.meanOKLab.a) >= 0.01 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      {skin.meanOKLab.a > 0 ? 'Magenta/Green:' : 'Green/Magenta:'}
                    </span>
                    <span className="font-mono text-green-700">
                      {skin.meanOKLab.a > 0 
                        ? `-${Math.abs(skin.meanOKLab.a * 100).toFixed(0)}`
                        : `+${Math.abs(skin.meanOKLab.a * 100).toFixed(0)}`
                      }
                    </span>
                  </div>
                )}
                {Math.abs(skin.meanOKLab.b) >= 0.01 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      {skin.meanOKLab.b > 0 ? 'Yellow/Blue:' : 'Blue/Yellow:'}
                    </span>
                    <span className="font-mono text-green-700">
                      {skin.meanOKLab.b > 0 
                        ? `-${Math.abs(skin.meanOKLab.b * 100).toFixed(0)}`
                        : `+${Math.abs(skin.meanOKLab.b * 100).toFixed(0)}`
                      }
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Skin Tone:</span>
                  <span className="font-mono text-green-700">
                    {skin.meanOKLab.b > 0 ? 'Cooler' : skin.meanOKLab.b < -0.01 ? 'Warmer' : 'Neutral'}
                  </span>
                </div>
              </div>
              
              {/* Skin-Specific Software Tools */}
              <div className="mt-3 pt-3 border-t border-green-200">
                <h5 className="text-xs font-semibold text-green-800 mb-2">Skin Tools:</h5>
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="font-medium text-gray-700">Lightroom:</span>
                    <div className="text-gray-600 ml-2">
                      • HSL Orange/Red sliders<br/>
                      • Color Grading (Midtones)<br/>
                      • Masking → Select Subject
                    </div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Photoshop:</span>
                    <div className="text-gray-600 ml-2">
                      • Select → Color Range (skin)<br/>
                      • Color Balance (Midtones)<br/>
                      • Hue/Saturation (Reds/Oranges)
                    </div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Capture One:</span>
                    <div className="text-gray-600 ml-2">
                      • Skin Tone tool<br/>
                      • Color Editor (skin tones)<br/>
                      • Local adjustments with skin mask
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Gray Confidence */}
        {selectedPoint && grayConfidence !== null && (
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="text-sm font-medium text-gray-700">Gray Confidence</h3>
              <div className="relative group">
                <div className="w-4 h-4 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs font-bold cursor-help">
                  i
                </div>
                <div className="absolute bottom-full left-0 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 max-w-sm">
                  <div>
                    <div className="font-semibold mb-1">Gray Confidence:</div>
                    <div className="space-y-1">
                      <div>• Measures how neutral a clicked point is</div>
                      <div>• 100% = perfectly neutral gray</div>
                      <div>• 0% = strong color cast</div>
                      <div>• Based on OKLab chroma and RGB balance</div>
                    </div>
                  </div>
                  <div className="absolute top-full left-4 border-4 border-transparent border-t-gray-800"></div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 p-2 rounded">
              <div className="text-sm font-mono">{grayConfidence}%</div>
              <div className="text-xs text-gray-500">at clicked point</div>
            </div>
          </div>
        )}

        {/* Neutral States */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Image:</span>
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              image.neutralState === 'neutral' 
                ? 'bg-green-100 text-green-800' 
                : image.neutralState === 'slightly_off'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {image.neutralState.replace('_', ' ')}
            </span>
          </div>
          
          {skin && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Skin:</span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                skin.neutralState === 'neutral' 
                  ? 'bg-green-100 text-green-800' 
                  : skin.neutralState === 'slightly_off'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {skin.neutralState.replace('_', ' ')}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
