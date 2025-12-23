import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { User } from '../types';

interface ProgressChartProps {
  user: User;
}

export const ProgressChart: React.FC<ProgressChartProps> = ({ user }) => {
  const [progressData, setProgressData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProgressData();
  }, [user.id]);

  const fetchProgressData = async () => {
    try {
      setLoading(true);
      const data = await api.getUserProgress(user.id);
      setProgressData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch progress data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-md">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-md">
        <div className="text-red-600 text-center">
          <p>Error loading progress data: {error}</p>
          <button
            onClick={fetchProgressData}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!progressData) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-md">
        <p className="text-gray-600 text-center">No progress data available yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-6 shadow-md">
      <h3 className="text-lg font-semibold mb-4">Learning Progress</h3>
      <p className="text-gray-600">Progress data loaded successfully</p>
      <ul className="mt-4">
        {progressData.map((item: any, index: number) => (
          <li key={index} className="mb-2">
            <strong>{item.category}:</strong> {item.score} (Total Questions: {item.total_questions})
          </li>
        ))}
      </ul>
    </div>
  );
};
