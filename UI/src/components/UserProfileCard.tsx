import React, { useState, useEffect } from 'react';
import { StudentIDCard } from './StudentIDCard';

interface Course {
  category: string;
  latest_score: number;
  sessions_completed: number;
}

interface ProgramInfo {
  program_name: string;
  start_date: string;
  end_date: string;
  daily_schedule: string;
}

interface UserProfile {
  user_id: string;
  name: string;
  email: string;
  phone: string;
  birthday: string;
  sex: string;
  template: string;
  profile_picture: string;
  card_id: string;
  is_confirmed: boolean;
  program_info: ProgramInfo | null;
  courses_taken: Course[];
  overall_stats: {
    total_sessions: number;
    average_score: number;
    quiz_accuracy: number;
  };
}

interface UserProfileCardProps {
  userId: string;
  apiBaseUrl?: string;
}

export const UserProfileCard: React.FC<UserProfileCardProps> = ({
  userId,
  apiBaseUrl = 'http://localhost:8000'
}) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${apiBaseUrl}/user/${userId}/profile`);

        if (!response.ok) {
          throw new Error(`Failed to fetch profile: ${response.status}`);
        }

        const data = await response.json();
        setProfile(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserProfile();
    }
  }, [userId, apiBaseUrl]);

  if (loading) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md p-6">
        <div className="animate-pulse">
          <div className="flex items-center space-x-4">
            <div className="h-24 w-24 bg-gray-200 rounded-lg"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md p-6">
        <div className="text-center text-red-600">
          <p className="text-lg font-semibold">Error Loading Profile</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md p-6">
        <div className="text-center text-gray-500">
          <p className="text-lg font-semibold">Profile Not Found</p>
          <p className="text-sm">Unable to load user profile information.</p>
        </div>
      </div>
    );
  }

  return (
    <StudentIDCard
      name={profile.name}
      cardId={profile.card_id}
      profilePicture={profile.profile_picture}
      template={profile.template}
      email={profile.email}
      phone={profile.phone}
      birthday={profile.birthday}
      sex={profile.sex}
      coursesTaken={profile.courses_taken}
      programInfo={profile.program_info}
      isConfirmed={profile.is_confirmed}
    />
  );
};
