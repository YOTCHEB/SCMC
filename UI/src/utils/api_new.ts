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
  dailySchedule?: string;
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

  async getUserProgress(userId: string): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/tools/progress/${userId}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch user progress');
    }

    return response.json();
  },

  async generateTimetable(userId: string, category: string, level: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/tools/generate-timetable`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, category, level }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to generate timetable');
    }

    return response.json();
  },
};
