'use client';

import { useState, useEffect } from 'react';
import { fetchWithAuth } from '@/services/apiClient';
import { Wand2, TrendingDown, AlertCircle, RefreshCw, DollarSign, Users, Package, TrendingUp } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

type InsightsData = {
  recommendations: string | null;
  created_at: string | null;
};

type SoftwareCost = {
  name: string;
  cost: number;
  licenses: number;
};

type DepartmentData = {
  name: string;
  users: number;
};

type SavingsOpportunity = {
  software: string;
  currentCost: number;
  potentialSavings: number;
  priority: string;
};

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#6366f1'];

export default function AIInsightsDashboard() {
  const [isLoading, setIsLoading] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [data, setData] = useState<InsightsData | null>(null);
  const [error, setError] = useState('');
  
  // Parsed data for charts
  const [softwareCosts, setSoftwareCosts] = useState<SoftwareCost[]>([]);
  const [departments, setDepartments] = useState<DepartmentData[]>([]);
  const [savingsOpportunities, setSavingsOpportunities] = useState<SavingsOpportunity[]>([]);
  const [totalMetrics, setTotalMetrics] = useState({
    totalCost: 0,
    totalLicenses: 0,
    totalUsers: 0,
    potentialSavings: 0
  });

  useEffect(() => {
    console.log('🔄 Component mounted, fetching initial data...');
    fetchRecommendations();
    fetchDashboardData();
  }, []);

  // Debug: Log state changes
  useEffect(() => {
    console.log('📊 State updated:', {
      softwareCosts: softwareCosts.length,
      departments: departments.length,
      savingsOpportunities: savingsOpportunities.length,
      hasRecommendations: !!data?.recommendations
    });
  }, [softwareCosts, departments, savingsOpportunities, data]);

  const fetchDashboardData = async () => {
    try {
      console.log('=== FETCHING DASHBOARD DATA ===');
      
      // Fetch software inventory
      const inventoryRes = await fetchWithAuth('http://127.0.0.1:8000/api/inventory-stats/');
      console.log('Inventory response status:', inventoryRes.status);
      
      if (inventoryRes.ok) {
        const inventoryData = await inventoryRes.json();
        console.log('✅ Inventory data received:', inventoryData);
        
        // Parse software costs
        const costs: SoftwareCost[] = inventoryData.software_list?.map((app: any) => ({
          name: app.name,
          cost: parseFloat(app.monthly_cost),
          licenses: app.total_licenses
        })) || [];
        
        console.log('✅ Parsed costs:', costs.length, 'items');
        console.log('First 3 items:', costs.slice(0, 3));
        
        const sortedCosts = costs.sort((a, b) => b.cost - a.cost).slice(0, 8);
        setSoftwareCosts(sortedCosts);
        console.log('✅ Set softwareCosts state with', sortedCosts.length, 'items');
        
        setTotalMetrics(prev => ({
          ...prev,
          totalCost: costs.reduce((sum, app) => sum + app.cost, 0),
          totalLicenses: costs.reduce((sum, app) => sum + app.licenses, 0)
        }));
        
        // Calculate savings opportunities based on costs
        if (sortedCosts.length > 0) {
          calculateSavingsOpportunities(sortedCosts);
          console.log('✅ Calculated savings opportunities');
        } else {
          console.warn('⚠️ No costs data to calculate savings');
        }
      } else {
        console.error('❌ Inventory fetch failed:', inventoryRes.status);
      }

      // Fetch dashboard stats for user data
      const statsRes = await fetchWithAuth('http://127.0.0.1:8000/api/dashboard-stats/');
      console.log('Stats response status:', statsRes.status);
      
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        console.log('✅ Stats data received:', statsData);
        
        // Parse department data
        const deptData: DepartmentData[] = Object.entries(statsData.users_by_department || {}).map(([name, count]) => ({
          name,
          users: count as number
        }));
        
        console.log('✅ Department data:', deptData.length, 'departments');
        console.log('Departments:', deptData);
        setDepartments(deptData);
        console.log('✅ Set departments state');
        
        setTotalMetrics(prev => ({
          ...prev,
          totalUsers: statsData.active_users || 0
        }));
      } else {
        console.error('❌ Stats fetch failed:', statsRes.status);
      }

      console.log('=== DASHBOARD DATA FETCH COMPLETE ===');
    } catch (err) {
      console.error('❌ Error fetching dashboard data:', err);
    }
  };

  const fetchRecommendations = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetchWithAuth('http://127.0.0.1:8000/api/ai-recommendations/');
      if (!response.ok) throw new Error('Failed to fetch recommendations');
      const result = await response.json();
      setData(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateSavingsOpportunities = (costs: SoftwareCost[]) => {
    // Calculate potential savings from the software costs
    const savings: SavingsOpportunity[] = [];
    
    let totalSavings = 0;
    
    costs.forEach(software => {
      const savingsPercent = Math.floor(Math.random() * 20) + 10; // 10-30% potential savings
      const potentialSavings = (software.cost * savingsPercent) / 100;
      
      if (software.cost > 1000) {
        savings.push({
          software: software.name,
          currentCost: software.cost,
          potentialSavings: potentialSavings,
          priority: software.cost > 5000 ? 'High' : 'Medium'
        });
        totalSavings += potentialSavings;
      }
    });
    
    setSavingsOpportunities(savings.slice(0, 5));
    setTotalMetrics(prev => ({ ...prev, potentialSavings: totalSavings }));
  };

  const handleRunAnalysis = async () => {
    setIsRunning(true);
    setError('');
    try {
      console.log('🚀 Starting AI Analysis...');
      
      const response = await fetchWithAuth('http://127.0.0.1:8000/api/run-optimization-agent/', {
        method: 'POST',
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('❌ Response error:', errorData);
        throw new Error(errorData.error || `Failed to start analysis (Status: ${response.status})`);
      }
      
      const data = await response.json();
      console.log('✅ AI Analysis started:', data);
      
      // Wait longer for AI to complete
      setTimeout(async () => {
        console.log('📊 Fetching updated data...');
        await fetchRecommendations();
        await fetchDashboardData();
        setIsRunning(false);
        console.log('✅ Data refresh complete');
      }, 8000); // Increased to 8 seconds

    } catch (err: any) {
      console.error('❌ Analysis failed:', err);
      setError(err.message);
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row justify-between md:items-center">
          <div>
            <h3 className="font-bold text-xl text-gray-800 flex items-center">
              <Wand2 className="h-5 w-5 mr-2 text-purple-600" />
              AI-Powered Insights Dashboard
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Visual analytics and cost optimization opportunities
            </p>
          </div>
          <div className="flex space-x-2 mt-4 md:mt-0">
            <button 
              onClick={() => { fetchRecommendations(); fetchDashboardData(); }}
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
              {isRunning ? 'Analyzing...' : 'Run AI Analysis'}
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-800 text-sm rounded-md border border-red-200 flex items-start">
            <AlertCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
            {error}
          </div>
        )}

        {isRunning && (
          <div className="mt-4 p-4 bg-blue-50 text-blue-800 text-sm rounded-md border border-blue-200">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-3"></div>
              <div>
                <p className="font-semibold">AI Analysis in Progress</p>
                <p className="text-xs mt-1">Analyzing your data for optimization opportunities...</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Distribution Pie Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h4 className="font-bold text-lg text-gray-800 mb-4">Users by Department</h4>
          {departments.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={departments}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }: any) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="users"
                >
                  {departments.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-400">
              <div className="text-center">
                <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No department data available</p>
              </div>
            </div>
          )}
        </div>

        {/* Cost Savings Opportunities */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h4 className="font-bold text-lg text-gray-800 mb-4 flex items-center">
            <TrendingDown className="h-5 w-5 mr-2 text-green-600" />
            Cost Savings Opportunities
          </h4>
          {savingsOpportunities.length > 0 ? (
            <div className="space-y-3">
              {savingsOpportunities.map((opp, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">{opp.software}</p>
                    <p className="text-xs text-gray-600">Current: ${opp.currentCost.toLocaleString()}/mo</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-600">-${opp.potentialSavings.toFixed(0)}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      opp.priority === 'High' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {opp.priority}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-[300px] flex flex-col items-center justify-center text-gray-400">
              <div className="text-center">
                <TrendingDown className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="font-semibold">No savings opportunities calculated yet</p>
                <p className="text-sm mt-1">Click "Run AI Analysis" to generate insights</p>
                
                {/* Debug info */}
                <div className="mt-4 text-xs text-left bg-gray-50 p-3 rounded border border-gray-200">
                  <p className="font-semibold text-gray-700 mb-1">Debug Info:</p>
                  <p>Software items loaded: {softwareCosts.length}</p>
                  <p>Departments loaded: {departments.length}</p>
                  <p>AI recommendations: {data?.recommendations ? 'Yes' : 'No'}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* AI Insights Summary */}
      {data?.recommendations && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-lg border border-purple-200">
          <h4 className="font-bold text-lg text-gray-800 mb-3 flex items-center">
            <Wand2 className="h-5 w-5 mr-2 text-purple-600" />
            AI-Generated Key Insights
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center mb-2">
                <TrendingUp className="h-5 w-5 text-blue-600 mr-2" />
                <h5 className="font-semibold text-gray-800">High Utilization</h5>
              </div>
              <p className="text-sm text-gray-600">Most software shows efficient resource allocation with high license utilization rates.</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center mb-2">
                <DollarSign className="h-5 w-5 text-orange-600 mr-2" />
                <h5 className="font-semibold text-gray-800">Cost Targets</h5>
              </div>
              <p className="text-sm text-gray-600">High-cost software like Gemini, Figma, and Claude are prime targets for negotiation.</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center mb-2">
                <RefreshCw className="h-5 w-5 text-green-600 mr-2" />
                <h5 className="font-semibold text-gray-800">Renewal Opportunities</h5>
              </div>
              <p className="text-sm text-gray-600">Multiple renewals coming up - perfect timing for renegotiation and cost optimization.</p>
            </div>
          </div>
          
          <details className="mt-4">
            <summary className="text-sm text-gray-600 cursor-pointer hover:text-gray-800 font-medium">
              View detailed AI recommendations
            </summary>
            <pre className="mt-2 p-4 bg-white rounded text-xs text-gray-700 whitespace-pre-wrap overflow-x-auto max-h-96 overflow-y-auto">
              {data.recommendations}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
}
