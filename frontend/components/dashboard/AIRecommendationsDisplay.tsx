'use client';

import { useState, useEffect } from 'react';
import { fetchWithAuth } from '@/services/apiClient';
import { Wand2, TrendingDown, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';

type RecommendationData = {
  recommendations: string | null;
  created_at: string | null;
};

export default function AIRecommendationsDisplay() {
  const [isLoading, setIsLoading] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [data, setData] = useState<RecommendationData | null>(null);
  const [error, setError] = useState('');

  // Fetch latest recommendations on mount
  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetchWithAuth('/api/ai-recommendations/');
      if (!response.ok) throw new Error('Failed to fetch recommendations');
      const result = await response.json();
      setData(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunAnalysis = async () => {
    setIsRunning(true);
    setError('');
    try {
      console.log('🚀 Starting AI analysis...');
      const response = await fetchWithAuth('/api/run-optimization-agent/', {
        method: 'POST',
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('❌ Response error:', errorData);
        throw new Error(errorData.error || `Failed to start analysis (Status: ${response.status})`);
      }
      
      const data = await response.json();
      console.log('✅ Analysis started:', data);
      
      // Wait a few seconds then fetch results
      setTimeout(() => {
        fetchRecommendations();
        setIsRunning(false);
      }, 5000);

    } catch (err: any) {
      console.error('❌ Analysis failed:', err);
      setError(err.message);
      setIsRunning(false);
    }
  };

  const formatRecommendations = (text: string) => {
    // Split by numbered points or bullet points
    const lines = text.split('\n').filter(line => line.trim());
    const sections: { title: string; content: string[] }[] = [];
    let currentSection: { title: string; content: string[] } | null = null;

    lines.forEach(line => {
      // Check if it's a section header (contains numbers like "1.", "2." at start or has ":" at end)
      if (line.match(/^\d+\./) || line.endsWith(':')) {
        if (currentSection) sections.push(currentSection);
        currentSection = { title: line, content: [] };
      } else if (currentSection) {
        currentSection.content.push(line);
      } else {
        // First line before any section
        currentSection = { title: 'Overview', content: [line] };
      }
    });

    if (currentSection) sections.push(currentSection);
    return sections;
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-center mb-6">
        <div>
          <h3 className="font-bold text-xl text-gray-800 flex items-center">
            <Wand2 className="h-5 w-5 mr-2 text-purple-600" />
            AI-Powered License Optimization
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            AI-generated insights to reduce costs and optimize license usage
          </p>
        </div>
        <div className="flex space-x-2 mt-4 md:mt-0">
          <button 
            onClick={fetchRecommendations}
            disabled={isLoading || isRunning}
            className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 text-sm font-semibold rounded-md hover:bg-gray-200 disabled:bg-gray-50"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button 
            onClick={handleRunAnalysis}
            disabled={isLoading || isRunning}
            className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-semibold rounded-md hover:from-purple-700 hover:to-blue-700 disabled:from-purple-400 disabled:to-blue-400"
          >
            <Wand2 className={`h-4 w-4 mr-2 ${isRunning ? 'animate-pulse' : ''}`} />
            {isRunning ? 'Analyzing...' : 'Run New Analysis'}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-800 text-sm rounded-md border border-red-200 flex items-start">
          <AlertCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          <p className="mt-4 text-gray-500">Loading recommendations...</p>
        </div>
      )}

      {/* Running State */}
      {isRunning && (
        <div className="mb-4 p-4 bg-blue-50 text-blue-800 text-sm rounded-md border border-blue-200">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-3"></div>
            <div>
              <p className="font-semibold">AI Analysis in Progress</p>
              <p className="text-xs mt-1">This may take 10-30 seconds. Results will appear automatically.</p>
            </div>
          </div>
        </div>
      )}

      {/* No Data State */}
      {!isLoading && !isRunning && !data?.recommendations && (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
          <Wand2 className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">No recommendations yet</p>
          <p className="text-sm text-gray-500 mt-1">Click "Run New Analysis" to generate AI-powered insights</p>
        </div>
      )}

      {/* Recommendations Display */}
      {!isLoading && !isRunning && data?.recommendations && (
        <div className="space-y-4">
          {/* Timestamp */}
          <div className="text-xs text-gray-500 flex items-center">
            <CheckCircle className="h-3 w-3 mr-1 text-green-600" />
            Generated on {new Date(data.created_at!).toLocaleString()}
          </div>

          {/* Formatted Recommendations */}
          <div className="space-y-4">
            {formatRecommendations(data.recommendations).map((section, idx) => (
              <div key={idx} className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border border-purple-200">
                <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                  {section.title.includes('savings') || section.title.includes('cost') ? (
                    <TrendingDown className="h-4 w-4 mr-2 text-green-600" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-2 text-purple-600" />
                  )}
                  {section.title}
                </h4>
                <ul className="space-y-2">
                  {section.content.map((item, i) => (
                    <li key={i} className="text-sm text-gray-700 pl-4 border-l-2 border-purple-300">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Raw Text Fallback (if formatting doesn't work well) */}
          <details className="mt-4">
            <summary className="text-sm text-gray-600 cursor-pointer hover:text-gray-800">
              View raw recommendations
            </summary>
            <pre className="mt-2 p-4 bg-gray-50 rounded text-xs text-gray-700 whitespace-pre-wrap overflow-x-auto">
              {data.recommendations}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
}
