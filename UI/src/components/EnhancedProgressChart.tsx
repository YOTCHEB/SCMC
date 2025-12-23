import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { User } from '../types';

interface ProgressData {
  category: string;
  score: number;
  total_questions: number;
  percentage: number;
}

interface EnhancedProgressChartProps {
  user: User;
}

export const EnhancedProgressChart: React.FC<EnhancedProgressChartProps> = ({ user }) => {
  const [progressData, setProgressData] = useState<ProgressData[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProgressData();
  }, [user.id]);

  const fetchProgressData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getUserProgress(user.id);
      
      console.log('Raw progress data from API:', data);
      
      // Transform data to include percentage with validation
      const transformedData = data.map((item: any) => {
        // Validate data to prevent division by zero and invalid percentages
        const totalQuestions = Math.max(1, item.total_questions || 1);
        const score = Math.max(0, Math.min(item.score || 0, totalQuestions));
        
        const percentage = Math.round((score / totalQuestions) * 100);
        
        console.log(`Category: ${item.category}, Score: ${score}, Total: ${totalQuestions}, Percentage: ${percentage}%`);
        
        return {
          ...item,
          score,
          total_questions: totalQuestions,
          percentage
        };
      });
      
      setProgressData(transformedData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch progress data';
      setError(errorMessage);
      console.error('Error fetching progress data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-blue-500';
    if (percentage >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getProgressRating = (percentage: number) => {
    if (percentage >= 90) return 'Excellent';
    if (percentage >= 75) return 'Very Good';
    if (percentage >= 60) return 'Good';
    if (percentage >= 40) return 'Average';
    return 'Needs Improvement';
  };

  const getOverallProgress = () => {
    if (!progressData || progressData.length === 0) return 0;
    
    // Calculate weighted average based on number of attempts per category
    const validData = progressData.filter(item => item.total_questions > 0);
    if (validData.length === 0) return 0;
    
    const totalWeightedScore = validData.reduce((sum, item) => {
      return sum + (item.percentage * item.total_questions);
    }, 0);
    
    const totalQuestions = validData.reduce((sum, item) => sum + item.total_questions, 0);
    
    return Math.round(totalWeightedScore / totalQuestions);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
            <div className="h-4 bg-gray-200 rounded w-3/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <div className="text-red-600 text-center">
          <div className="flex justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-xl font-semibold mb-2">Error loading progress data</p>
          <p className="mb-4">{error}</p>
          <button
            onClick={fetchProgressData}
            className="mt-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!progressData || progressData.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-lg text-center">
        <div className="flex justify-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">No Progress Data Yet</h3>
        <p className="text-gray-600">Complete some quizzes to see your progress here.</p>
      </div>
    );
  }

  const overallProgress = getOverallProgress();

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Learning Progress</h2>
          <p className="text-gray-600">Track your performance across different categories</p>
        </div>
        <div className="mt-4 md:mt-0">
          <div className="flex items-center">
            <div className="relative">
              <div className="w-24 h-24 rounded-full border-8 border-gray-200 flex items-center justify-center">
                <span className="text-2xl font-bold text-gray-800">{overallProgress}%</span>
              </div>
              <div 
                className="absolute top-0 left-0 w-24 h-24 rounded-full border-8 border-blue-500 clip-progress"
                style={{ 
                  clipPath: `polygon(50% 50%, 50% 0%, ${overallProgress > 0 ? 100 : 0}% 0%, ${overallProgress > 25 ? 100 : 25 + overallProgress} ${overallProgress > 25 ? 0 : 100 - overallProgress}%, ${overallProgress > 50 ? 50 + (overallProgress - 50) * 2 : 50}% ${overallProgress > 50 ? 100 : 50 + overallProgress}%, ${overallProgress > 75 ? 0 : 100 - overallProgress}% ${overallProgress > 75 ? 100 - (overallProgress - 75) * 2 : 100}%, 0% ${overallProgress > 75 ? 100 : 75 + overallProgress}%, 0% 50%)`
                }}
              ></div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-800">Overall Progress</h3>
              <p className="text-gray-600">Average performance</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {progressData.map((item, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-lg font-semibold text-gray-800 capitalize">{item.category}</h4>
              <span className="text-lg font-bold text-gray-800">{item.percentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
              <div 
                className={`h-3 rounded-full ${getProgressColor(item.percentage)}`}
                style={{ width: `${item.percentage}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Score: {item.score}/{item.total_questions}</span>
              <span>
                {getProgressRating(item.percentage)}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 pt-6 border-t border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Progress Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-green-500 mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-gray-800 font-semibold">{progressData.filter(item => item.percentage >= 90).length} categories</p>
            <p className="text-gray-600 text-sm">Excellent</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-blue-500 mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <p className="text-gray-800 font-semibold">{progressData.filter(item => item.percentage >= 75 && item.percentage < 90).length} categories</p>
            <p className="text-gray-600 text-sm">Very Good</p>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="text-yellow-500 mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-gray-800 font-semibold">{progressData.filter(item => item.percentage >= 60 && item.percentage < 75).length} categories</p>
            <p className="text-gray-600 text-sm">Good</p>
          </div>
          <div className="bg-red-50 rounded-lg p-4">
            <div className="text-red-500 mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <p className="text-gray-800 font-semibold">{progressData.filter(item => item.percentage < 60).length} categories</p>
            <p className="text-gray-600 text-sm">Needs Improvement</p>
          </div>
        </div>
      </div>
    </div>
  );
};
