'use client';

import { useState } from 'react';
import { fetchWithAuth } from '@/services/apiClient';
import { Wand2 } from 'lucide-react';

export default function RecommendationsPanel() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleRunAgent = async () => {
    setIsLoading(true);
    setMessage('');
    try {
      console.log('🚀 Starting AI optimization agent...');
      // This is the "phone call" to the backend to start the job.
      const response = await fetchWithAuth('http://127.0.0.1:8000/api/run-optimization-agent/', {
        method: 'POST',
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('❌ Response error:', errorData);
        throw new Error(errorData.error || `Failed to start the AI agent analysis (Status: ${response.status})`);
      }
      
      const data = await response.json();
      console.log('✅ Agent started:', data);
      setMessage(data.message); // Show a success message like "Task has been started."
      
      if (data.warning) {
        console.warn('⚠️', data.warning);
      }
      
      setTimeout(() => {
        setMessage('Check your Celery worker terminal for the agent\'s detailed report.');
      }, 3000);

    } catch (error: any) {
      console.error('❌ Agent failed:', error);
      setMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex flex-col md:flex-row justify-between md:items-center">
        <div>
          <h3 className="font-bold text-xl text-gray-800">AI-Powered Recommendations</h3>
          <p className="text-sm text-gray-500 mt-1">
            Analyze license usage data to find actionable cost-saving opportunities.
          </p>
        </div>
        <button 
          onClick={handleRunAgent}
          disabled={isLoading}
          className="flex items-center justify-center mt-4 md:mt-0 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-md hover:bg-blue-700 disabled:bg-blue-400"
        >
          <Wand2 className="h-4 w-4 mr-2" />
          {isLoading ? 'Agent is Running...' : 'Run Analysis'}
        </button>
      </div>
      {message && (
        <div className="mt-4 p-3 bg-blue-50 text-blue-800 text-sm rounded-md border border-blue-200">
          {message}
        </div>
      )}
    </div>
  );
}

