import { User, UserSettings, Notification } from '../types';

export const storage = {
  // --- Users ---
  saveUser(user: User): void {
    localStorage.setItem('mentorAI_user', JSON.stringify(user));
  },

  getUser(): User | null {
    const userData = localStorage.getItem('mentorAI_user');
    return userData ? JSON.parse(userData) : null;
  },

  clearUser(): void {
    localStorage.removeItem('mentorAI_user');
  },

  // --- Token ---
  saveToken(token: string): void {
    localStorage.setItem('mentorAI_token', token);
  },

  getToken(): string | null {
    return localStorage.getItem('mentorAI_token');
  },

  clearToken(): void {
    localStorage.removeItem('mentorAI_token');
  },

  // --- Generic storage helpers (pour PostRegistrationFlow) ---
  setItem(key: string, value: any): void {
    localStorage.setItem(key, JSON.stringify(value));
  },

  getItem<T>(key: string): T | null {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  },

  removeItem(key: string): void {
    localStorage.removeItem(key);
  },

  // --- ID generation ---
  generateCardId(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 12; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  },

  // --- Settings ---
  saveSettings(settings: UserSettings): void {
    localStorage.setItem('mentorAI_settings', JSON.stringify(settings));
  },

  getSettings(): UserSettings | null {
    const settingsData = localStorage.getItem('mentorAI_settings');
    return settingsData ? JSON.parse(settingsData) : null;
  },

  getDefaultSettings(): UserSettings {
    return {
      theme: 'light',
      language: 'en',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      notifications: {
        emailNotifications: true,
        pushNotifications: true,
        mentorUpdates: true,
        weeklyReports: false,
        soundEnabled: true,
      },
      privacy: {
        profileVisibility: 'private',
        shareProgress: false,
        allowAnalytics: true,
      },
    };
  },

  // --- Notifications ---
  saveNotifications(notifications: Notification[]): void {
    localStorage.setItem('mentorAI_notifications', JSON.stringify(notifications));
  },

  getNotifications(): Notification[] {
    const notificationsData = localStorage.getItem('mentorAI_notifications');
    return notificationsData ? JSON.parse(notificationsData) : [];
  },

  addNotification(notification: Omit<Notification, 'id' | 'timestamp'>): void {
    const notifications = this.getNotifications();
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
    };
    notifications.unshift(newNotification);
    this.saveNotifications(notifications.slice(0, 50)); // keep last 50
  },

  markNotificationAsRead(id: string): void {
    const notifications = this.getNotifications();
    const updated = notifications.map(n => (n.id === id ? { ...n, read: true } : n));
    this.saveNotifications(updated);
  },

  clearAllNotifications(): void {
    this.saveNotifications([]);
  },
};

