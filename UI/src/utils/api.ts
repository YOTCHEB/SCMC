const API_BASE_URL = 'http://localhost:8000';

interface EnhancedUserRegistration {
  name: string;
  birthday: string;
  sex: string;
  email: string;
  phone: string;
  profilePicture: string;
  template: string;
  cvFile?: string;
  cvFileName?: string;
  programName?: string;
  programStartDate?: string;
  programEndDate?: string;
  dailyStartTime?: string;
  dailyEndTime?: string;
  customProgramName?: string;
  programDurationUnit?: string;
  programDurationLength?: string;
  expectedCompletionDate?: string;
}

interface RegistrationResponse {
  message: string;
  user_id: string;
  card_id: string;
  email_sent: boolean;
  requires_confirmation: boolean;
}

interface ConfirmationResponse {
  message: string;
  confirmed: boolean;
  card_id?: string;
}

interface UserStatusResponse {
  is_confirmed: boolean;
  card_id: string;
}

export const api = {
  async registerUser(userData: EnhancedUserRegistration): Promise<RegistrationResponse> {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Registration failed');
    }

    return response.json();
  },

  async confirmEmail(userId: string, confirmationCode: string): Promise<ConfirmationResponse> {
    const response = await fetch(`${API_BASE_URL}/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: userId,
        confirmation_code: confirmationCode,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Confirmation failed');
    }

    return response.json();
  },

  async resendConfirmation(userId: string): Promise<{ message: string; email_sent: boolean }> {
    const response = await fetch(`${API_BASE_URL}/resend-confirmation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to resend confirmation');
    }

    return response.json();
  },

  async getUserStatus(userId: string): Promise<UserStatusResponse> {
    const response = await fetch(`${API_BASE_URL}/user/${userId}/status`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to get user status');
    }

    return response.json();
  },

  async generateInterview(userId: string, topic: string) {
    const response = await fetch(`${API_BASE_URL}/tools/generate-interview`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, topic }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Failed to generate interview' }));
      throw new Error(error.detail || 'Failed to generate interview');
    }

    return response.json();
  },

  async generateQuiz(userId: string, topic: string) {
    const response = await fetch(`${API_BASE_URL}/tools/generate-quiz`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, topic }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Failed to generate quiz' }));
      throw new Error(error.detail || 'Failed to generate quiz');
    }

    return response.json();
  },

  async submitAnswers(userId: string, topic: string, answers: Record<string, any>) {
    const response = await fetch(`${API_BASE_URL}/tools/submit-answers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, topic, answers }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Failed to submit answers' }));
      throw new Error(error.detail || 'Failed to submit answers');
    }

    return response.json();
  },



  async sendMessage(template: string, message: string, userId: string) {
    const response = await fetch(`${API_BASE_URL}/tools/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category: template, user_input: message, user_id: userId }),
    });

    if (!response.ok) {
      throw new Error(`Failed to send message: ${response.status}`);
    }

    return response.json();
  },

  // Progress Tracking APIs
  async trackQuizScore(userId: string, category: string, score: number, totalQuestions: number) {
    const response = await fetch(`${API_BASE_URL}/tools/progress/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, category, score, total_questions: totalQuestions }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Failed to track quiz score' }));
      throw new Error(error.detail || 'Failed to track quiz score');
    }

    return response.json();
  },

  async trackConversationMetrics(userId: string, category: string, messageCount: number, avgResponseLength: number) {
    const response = await fetch(`${API_BASE_URL}/tools/progress/conversation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, category, message_count: messageCount, avg_response_length: avgResponseLength }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Failed to track conversation metrics' }));
      throw new Error(error.detail || 'Failed to track conversation metrics');
    }

    return response.json();
  },

  async getUserProgress(userId: string) {
    const response = await fetch(`${API_BASE_URL}/tools/progress/${userId}`);
    if (!response.ok) {
      throw new Error(`Failed to get user progress: ${response.status}`);
    }
    return response.json();
  },

  async trainProgressModel() {
    const response = await fetch(`${API_BASE_URL}/tools/progress/train-model`, {
      method: 'POST',
    });
    return response.json();
  },

  // Notification APIs
  async getNotifications(userId: string, unreadOnly: boolean = false) {
    const response = await fetch(`${API_BASE_URL}/tools/notifications/${userId}?unread_only=${unreadOnly}`);
    if (!response.ok) {
      throw new Error(`Failed to get notifications: ${response.status}`);
    }
    return response.json();
  },

  async markNotificationAsRead(notificationId: number) {
    const response = await fetch(`${API_BASE_URL}/tools/notifications/${notificationId}/read`, {
      method: 'POST',
    });
    return response.json();
  },

  async replyToNotification(userId: string, notificationId: number, replyMessage: string, topic: string) {
    const response = await fetch(`${API_BASE_URL}/tools/notifications/reply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, notification_id: notificationId, reply_message: replyMessage, topic }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Failed to reply to notification' }));
      throw new Error(error.detail || 'Failed to reply to notification');
    }

    return response.json();
  },

  // Exercise APIs
  async generateExercise(userId: string, category: string, topic?: string) {
    const params = new URLSearchParams({ user_id: userId, category, ...(topic && { topic }) });
    const response = await fetch(`${API_BASE_URL}/tools/exercise/generate?${params}`, {
      method: 'POST',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Failed to generate exercise' }));
      throw new Error(error.detail || 'Failed to generate exercise');
    }

    return response.json();
  },

  async submitExercise(userId: string, category: string, exerciseId: string, answers: Record<string, any>, timeTaken: number) {
    const response = await fetch(`${API_BASE_URL}/tools/exercise/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, category, exercise_id: exerciseId, answers, time_taken: timeTaken }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Failed to submit exercise' }));
      throw new Error(error.detail || 'Failed to submit exercise');
    }

    return response.json();
  },

  // Personalized Suggestions API
  async getPersonalizedSuggestions(userId: string) {
    const response = await fetch(`${API_BASE_URL}/tools/suggestions/${userId}`);
    if (!response.ok) {
      throw new Error(`Failed to get personalized suggestions: ${response.status}`);
    }
    return response.json();
  },

  // Timetable Generation API
  async generateTimetable(userId: string, category: string, level: string) {
    const response = await fetch(`${API_BASE_URL}/tools/generate-timetable`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, category, level }),
    });
    if (!response.ok) {
      throw new Error(`Failed to generate timetable: ${response.status}`);
    }
    return response.json();
  },
};
