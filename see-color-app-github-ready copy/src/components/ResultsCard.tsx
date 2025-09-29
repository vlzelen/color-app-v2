import { useAppStore } from '../store/useAppStore';

export default function ResultsCard() {
  const { analysisResult, analysisError } = useAppStore();

  if (analysisError) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Results</h2>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{analysisError}</p>
        </div>
      </div>
    );
  }

  if (!analysisResult) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Results</h2>
        <p className="text-sm text-gray-500">Run analysis to see results</p>
      </div>
    );
  }

  const { image, skin } = analysisResult;

  // Check if everything is neutral
  const isEverythingNeutral = image.neutralState === 'neutral' && 
    (!skin || skin.neutralState === 'neutral');

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Results</h2>
      
      {isEverythingNeutral ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <div className="text-green-600">✓</div>
            <p className="text-green-800 font-medium">Looks neutral</p>
          </div>
          <p className="text-green-700 text-sm mt-1">
            No significant color cast detected in image{skin ? ' or skin' : ''}.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Image Analysis */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Image Analysis</h3>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm text-gray-800 mb-2">
                <strong>Cast:</strong> {image.castLabel}
              </p>
              {image.exposureHint && (
                <p className="text-sm text-amber-700 mb-2">
                  <strong>Exposure:</strong> {image.exposureHint}
                </p>
              )}
              {image.recommendations.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Fixes:</p>
                  <ul className="text-sm text-gray-800 space-y-1">
                    {image.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="text-blue-600 mt-0.5">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Skin Analysis */}
          {skin && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Skin Analysis</h3>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-800 mb-2">
                  <strong>Cast:</strong> {skin.castLabel}
                </p>
                {skin.exposureHint && (
                  <p className="text-sm text-amber-700 mb-2">
                    <strong>Exposure:</strong> {skin.exposureHint}
                  </p>
                )}
                {skin.recommendations.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Fixes:</p>
                    <ul className="text-sm text-gray-800 space-y-1">
                      {skin.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <span className="text-blue-600 mt-0.5">•</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Combined Recommendations */}
          {(image.recommendations.length > 0 || (skin && skin.recommendations.length > 0)) && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm font-medium text-blue-800 mb-2">Quick Summary</p>
              <p className="text-sm text-blue-700">
                {image.neutralState !== 'neutral' && skin && skin.neutralState !== 'neutral'
                  ? 'Both image and skin show color casts. Focus on skin corrections first, then re-evaluate.'
                  : image.neutralState !== 'neutral'
                  ? 'Image shows color cast. Adjust global color balance.'
                  : 'Skin shows color cast. Make targeted skin tone adjustments.'
                }
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
