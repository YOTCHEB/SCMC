export interface User {
  id: string;
  name: string;
  birthday: string;
  sex: 'male' | 'female' | 'other';
  email: string;
  phone: string;
  profilePicture: string;
  template: 'career' | 'business' | 'education' | 'finance';
  cardId: string;
  createdAt: string;
  // Enhanced fields
  cvFile?: string;
  cvFileName?: string;
  programName?: string;
  programStartDate?: string;
  programEndDate?: string;
  dailySchedule?: string;
  programDurationUnit?: string;
  programDurationLength?: string;
  expectedCompletionDate?: string;
  isConfirmed?: boolean;
}

export interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: string;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  mentorUpdates: boolean;
  weeklyReports: boolean;
  soundEnabled: boolean;
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
  notifications: NotificationSettings;
  privacy: {
    profileVisibility: 'public' | 'private';
    shareProgress: boolean;
    allowAnalytics: boolean;
  };
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}