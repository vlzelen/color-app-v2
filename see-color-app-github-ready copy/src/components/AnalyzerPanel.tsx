import { useAppStore } from '../store/useAppStore';
import { analyzeBitmap } from '../lib/analysis';

export default function AnalyzerPanel() {
  const { 
    imageBitmap, 
    isAnalyzing, 
    analysisResult,
    setAnalysisResult, 
    setIsAnalyzing, 
    setAnalysisError,
    reset
  } = useAppStore();

  const handleAnalyze = async () => {
    if (!imageBitmap) {
      alert('Please upload an image first');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      const result = await analyzeBitmap(imageBitmap);
      setAnalysisResult(result);
    } catch (error) {
      console.error('Analysis failed:', error);
      setAnalysisError('Analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    reset();
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Analysis</h2>
      
      <div className="space-y-4">
        <button
          onClick={handleAnalyze}
          disabled={!imageBitmap || isAnalyzing}
          className={`
            w-full py-3 px-4 rounded-lg font-medium transition-colors
            ${!imageBitmap || isAnalyzing
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
            }
          `}
        >
          {isAnalyzing ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Analyzing color cast...</span>
            </div>
          ) : (
            'Analyze Color Cast'
          )}
        </button>

        {isAnalyzing && (
          <div className="text-xs text-gray-600 text-center">
            Processing image and detecting skin tones...
          </div>
        )}

        {analysisResult && (
          <button
            onClick={handleReset}
            className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
          >
            Reset Analysis
          </button>
        )}

        {!imageBitmap && (
          <p className="text-sm text-gray-500 text-center">
            Upload an image to begin analysis
          </p>
        )}
      </div>
    </div>
  );
}
