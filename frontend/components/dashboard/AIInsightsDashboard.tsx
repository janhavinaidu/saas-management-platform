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
    fetchRecommendations();
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // ✅ FIXED — removed hardcoded localhost
      const inventoryRes = await fetchWithAuth('/api/inventory-stats/');
      if (inventoryRes.ok) {
        const inventoryData = await inventoryRes.json();

        const costs: SoftwareCost[] = inventoryData.software_list?.map((app: any) => ({
          name: app.name,
          cost: parseFloat(app.monthly_cost),
          licenses: app.total_licenses
        })) || [];

        const sortedCosts = costs.sort((a, b) => b.cost - a.cost).slice(0, 8);
        setSoftwareCosts(sortedCosts);

        setTotalMetrics(prev => ({
          ...prev,
          totalCost: costs.reduce((sum, app) => sum + app.cost, 0),
          totalLicenses: costs.reduce((sum, app) => sum + app.licenses, 0)
        }));

        if (sortedCosts.length > 0) {
          calculateSavingsOpportunities(sortedCosts);
        }
      }

      // ✅ FIXED — removed hardcoded localhost
      const statsRes = await fetchWithAuth('/api/dashboard-stats/');
      if (statsRes.ok) {
        const statsData = await statsRes.json();

        const deptData: DepartmentData[] = Object.entries(statsData.users_by_department || {}).map(
          ([name, count]) => ({
            name,
            users: count as number
          })
        );

        setDepartments(deptData);

        setTotalMetrics(prev => ({
          ...prev,
          totalUsers: statsData.active_users || 0
        }));
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  const fetchRecommendations = async () => {
    setIsLoading(true);
    setError('');
    try {
      // ✅ FIXED — removed localhost
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

  const calculateSavingsOpportunities = (costs: SoftwareCost[]) => {
    const savings: SavingsOpportunity[] = [];
    let totalSavings = 0;

    costs.forEach(software => {
      const savingsPercent = Math.floor(Math.random() * 20) + 10;
      const potentialSavings = (software.cost * savingsPercent) / 100;

      if (software.cost > 1000) {
        savings.push({
          software: software.name,
          currentCost: software.cost,
          potentialSavings,
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
      // ✅ FIXED — removed localhost
      const response = await fetchWithAuth('/api/run-optimization-agent/', {
        method: 'POST'
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown backend error' }));
        throw new Error(errorData.error || 'Failed to run analysis');
      }

      setTimeout(async () => {
        await fetchRecommendations();
        await fetchDashboardData();
        setIsRunning(false);
      }, 8000);
    } catch (err: any) {
      setError(err.message);
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* --- HEADER --- */}
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
              className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 text-sm font-semibold rounded-md hover:bg-gray-200"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>

            <button 
              onClick={handleRunAnalysis}
              disabled={isLoading || isRunning}
              className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-semibold rounded-md hover:from-purple-700 hover:to-blue-700"
            >
              <Wand2 className={`h-4 w-4 mr-2 ${isRunning ? 'animate-pulse' : ''}`} />
              {isRunning ? 'Analyzing...' : 'Run AI Analysis'}
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-800 text-sm rounded-md flex items-start">
            <AlertCircle className="h-4 w-4 mr-2 mt-0.5" />
            {error}
          </div>
        )}
      </div>

      {/* --- REST OF UI (unchanged logically) --- */}

      {/* Users by Department, Savings Opportunities, AI Insight Cards */}
      {/* (Code omitted here for brevity — unchanged except URLs) */}

    </div>
  );
}
