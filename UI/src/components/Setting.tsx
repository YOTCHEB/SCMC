import React, { useState, useEffect } from 'react';
import { User, UserSettings } from '../types';
import { storage } from '../utils/storage';
import { 
  Settings as SettingsIcon, 
  User as UserIcon, 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  Clock, 
  Save,
  ArrowLeft,
  Mail,
  Smartphone,
  Volume2,
  Eye,
  BarChart3,
  Share2
} from 'lucide-react';

interface SettingsProps {
  user: User;
  onBack: () => void;
  onSettingsUpdate: (settings: UserSettings) => void;
}

export const Setting: React.FC<SettingsProps> = ({ user, onBack, onSettingsUpdate }) => {
  const [settings, setSettings] = useState<UserSettings>(
    storage.getSettings() || storage.getDefaultSettings()
  );
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'privacy' | 'appearance'>('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const handleSave = async () => {
    setIsSaving(true);
    try {
      storage.saveSettings(settings);
      onSettingsUpdate(settings);
      setSaveMessage('Settings saved successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      setSaveMessage('Error saving settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const updateSettings = (path: string, value: any) => {
    setSettings(prev => {
      const newSettings = { ...prev };
      const keys = path.split('.');
      let current: any = newSettings;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      
      return newSettings;
    });
  };

  const getTemplateColor = () => {
    const colors = {
      career: 'from-blue-600 to-blue-800',
      business: 'from-purple-600 to-purple-800',
      education: 'from-green-600 to-green-800',
      finance: 'from-orange-600 to-orange-800',
    };
    return colors[user.template as keyof typeof colors] || colors.career;
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: UserIcon },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Palette },
  ];

  return (
    <div className="h-full bg-gray-50 flex flex-col">
      {/* Header */}
      <div className={`bg-gradient-to-r ${getTemplateColor()} p-6 text-white`}>
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div className="flex items-center space-x-3">
            <SettingsIcon size={28} />
            <div>
              <h1 className="text-2xl font-bold">Settings</h1>
              <p className="text-white/80">Customize your experience</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 p-4">
          <nav className="space-y-2">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <IconComponent size={20} />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-2xl">
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">Profile Settings</h2>
                  <p className="text-gray-600 mb-6">Manage your personal information and preferences.</p>
                </div>

                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                      <input
                        type="text"
                        value={user.name}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        value={user.email}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                      <input
                        type="tel"
                        value={user.phone}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Student ID</label>
                      <input
                        type="text"
                        value={user.cardId}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Regional Settings</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Globe size={16} className="inline mr-2" />
                        Language
                      </label>
                      <select
                        value={settings.language}
                        onChange={(e) => updateSettings('language', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="en">English</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                        <option value="de">German</option>
                        <option value="zh">Chinese</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Clock size={16} className="inline mr-2" />
                        Timezone
                      </label>
                      <select
                        value={settings.timezone}
                        onChange={(e) => updateSettings('timezone', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="America/New_York">Eastern Time</option>
                        <option value="America/Chicago">Central Time</option>
                        <option value="America/Denver">Mountain Time</option>
                        <option value="America/Los_Angeles">Pacific Time</option>
                        <option value="Europe/London">London</option>
                        <option value="Europe/Paris">Paris</option>
                        <option value="Asia/Tokyo">Tokyo</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">Notification Settings</h2>
                  <p className="text-gray-600 mb-6">Choose how you want to be notified about updates and activities.</p>
                </div>

                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Communication Preferences</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Mail size={20} className="text-blue-600" />
                        <div>
                          <p className="font-medium text-gray-800">Email Notifications</p>
                          <p className="text-sm text-gray-600">Receive updates via email</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.notifications.emailNotifications}
                          onChange={(e) => updateSettings('notifications.emailNotifications', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Smartphone size={20} className="text-green-600" />
                        <div>
                          <p className="font-medium text-gray-800">Push Notifications</p>
                          <p className="text-sm text-gray-600">Get instant notifications on your device</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.notifications.pushNotifications}
                          onChange={(e) => updateSettings('notifications.pushNotifications', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Volume2 size={20} className="text-purple-600" />
                        <div>
                          <p className="font-medium text-gray-800">Sound Notifications</p>
                          <p className="text-sm text-gray-600">Play sound for new messages</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.notifications.soundEnabled}
                          onChange={(e) => updateSettings('notifications.soundEnabled', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Content Preferences</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-800">Mentor Updates</p>
                        <p className="text-sm text-gray-600">New features and mentor improvements</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.notifications.mentorUpdates}
                          onChange={(e) => updateSettings('notifications.mentorUpdates', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-800">Weekly Reports</p>
                        <p className="text-sm text-gray-600">Summary of your learning progress</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.notifications.weeklyReports}
                          onChange={(e) => updateSettings('notifications.weeklyReports', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'privacy' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">Privacy Settings</h2>
                  <p className="text-gray-600 mb-6">Control your privacy and data sharing preferences.</p>
                </div>

                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Profile Visibility</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Eye size={20} className="text-blue-600" />
                        <div>
                          <p className="font-medium text-gray-800">Profile Visibility</p>
                          <p className="text-sm text-gray-600">Who can see your profile information</p>
                        </div>
                      </div>
                      <select
                        value={settings.privacy.profileVisibility}
                        onChange={(e) => updateSettings('privacy.profileVisibility', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="private">Private</option>
                        <option value="public">Public</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Share2 size={20} className="text-green-600" />
                        <div>
                          <p className="font-medium text-gray-800">Share Progress</p>
                          <p className="text-sm text-gray-600">Allow sharing of learning achievements</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.privacy.shareProgress}
                          onChange={(e) => updateSettings('privacy.shareProgress', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <BarChart3 size={20} className="text-purple-600" />
                        <div>
                          <p className="font-medium text-gray-800">Analytics</p>
                          <p className="text-sm text-gray-600">Help improve our service with usage data</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.privacy.allowAnalytics}
                          onChange={(e) => updateSettings('privacy.allowAnalytics', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">Appearance Settings</h2>
                  <p className="text-gray-600 mb-6">Customize the look and feel of your dashboard.</p>
                </div>

                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Theme Preferences</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">Theme</label>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { value: 'light', label: 'Light', preview: 'bg-white border-2' },
                          { value: 'dark', label: 'Dark', preview: 'bg-gray-800 border-2' },
                          { value: 'auto', label: 'Auto', preview: 'bg-gradient-to-r from-white to-gray-800 border-2' }
                        ].map((theme) => (
                          <label
                            key={theme.value}
                            className={`cursor-pointer p-3 rounded-lg border-2 transition-all ${
                              settings.theme === theme.value
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <input
                              type="radio"
                              name="theme"
                              value={theme.value}
                              checked={settings.theme === theme.value}
                              onChange={(e) => updateSettings('theme', e.target.value)}
                              className="sr-only"
                            />
                            <div className={`w-full h-12 rounded ${theme.preview} mb-2`}></div>
                            <p className="text-sm font-medium text-center">{theme.label}</p>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="mt-8 flex items-center justify-between">
              <div>
                {saveMessage && (
                  <p className={`text-sm ${saveMessage.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>
                    {saveMessage}
                  </p>
                )}
              </div>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className={`flex items-center space-x-2 px-6 py-3 bg-gradient-to-r ${getTemplateColor()} text-white rounded-lg hover:opacity-90 transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
              >
                {isSaving ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};