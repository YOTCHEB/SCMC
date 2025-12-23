import React, { useState, useEffect } from 'react';
import { User, Notification } from '../types';
import { api } from '../utils/api';
import { 
  Bell, 
  ArrowLeft, 
  Check, 
  Trash2, 
  CheckCheck, 
  Info, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  ExternalLink,
  Filter,
  Loader,
  Send,
  Clock,
  FileText
} from 'lucide-react';

interface NotificationsProps {
  user: User;
  onBack: () => void;
}

export const Notifications: React.FC<NotificationsProps> = ({ user, onBack }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [replyMessage, setReplyMessage] = useState<string>('');
  const [exerciseId, setExerciseId] = useState<string | null>(null);
  const [exerciseContent, setExerciseContent] = useState<string | null>(null);
  const [timeLimit, setTimeLimit] = useState<number>(600); // 10 minutes
  const [timeRemaining, setTimeRemaining] = useState<number>(600);
  const [exerciseAnswers, setExerciseAnswers] = useState<{[key: string]: string}>({});
  const [showExercise, setShowExercise] = useState<boolean>(false);
  const [exerciseStartTime, setExerciseStartTime] = useState<number | null>(null);

  useEffect(() => {
    loadNotifications();
  }, []);

  useEffect(() => {
    let timer: any;
    if (showExercise && exerciseStartTime) {
      timer = setInterval(() => {
        const elapsed = Math.floor((Date.now() - exerciseStartTime) / 1000);
        const remaining = Math.max(0, timeLimit - elapsed);
        setTimeRemaining(remaining);
        
        if (remaining === 0) {
          handleSubmitExercise();
        }
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [showExercise, exerciseStartTime, timeLimit]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.getNotifications(user.id, false);
      setNotifications(response.notifications || []);
    } catch (err) {
      setError('Failed to load notifications');
      console.error('Error loading notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartExercise = async (notificationId: string) => {
    try {
      const response = await api.generateExercise(user.id, user.template, user.template); // Using template as both category and topic
      setExerciseId(response.exercise_id);
      setExerciseContent(response.content);
      setTimeLimit(response.time_limit);
      setTimeRemaining(response.time_limit);
      setShowExercise(true);
      setExerciseStartTime(Date.now());
    } catch (err) {
      console.error('Error starting exercise:', err);
    }
  };

  const handleSubmitExercise = async () => {
    try {
      const timeTaken = timeLimit - timeRemaining;
      const response = await api.submitExercise(user.id, user.template, exerciseId || '', exerciseAnswers, timeTaken);
      console.log('Exercise submission result:', response);
      setShowExercise(false);
      setExerciseAnswers({});
      loadNotifications(); // Reload notifications to show results
    } catch (err) {
      console.error('Error submitting exercise:', err);
    }
  };

  const handleReply = async (notificationId: string, topic: string) => {
    try {
      const response = await api.replyToNotification(user.id, parseInt(notificationId), replyMessage, topic);
      console.log('AI Response:', response.ai_response);
      setReplyMessage(''); // Clear reply message after submission
      loadNotifications(); // Reload notifications to show AI response
    } catch (err) {
      console.error('Error replying to notification:', err);
    }
  };

  const handleExerciseAnswerChange = (questionId: string, answer: string) => {
    setExerciseAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
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

  const markAsRead = async (id: string) => {
    try {
      // Convert string ID to number for the API
      await api.markNotificationAsRead(parseInt(id));
      loadNotifications();
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.read);
      for (const notification of unreadNotifications) {
        // Convert string ID to number for the API
        await api.markNotificationAsRead(parseInt(notification.id));
      }
      loadNotifications();
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  const clearAllNotifications = () => {
    // Note: Backend doesn't support clearing all notifications yet
    // This will just reload the current notifications
    loadNotifications();
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} className="text-green-500" />;
      case 'warning':
        return <AlertTriangle size={20} className="text-yellow-500" />;
      case 'error':
        return <XCircle size={20} className="text-red-500" />;
      default:
        return <Info size={20} className="text-blue-500" />;
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.read;
    if (filter === 'read') return notification.read;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  // Format time for display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (showExercise) {
    return (
      <div className="h-full bg-gray-50 flex flex-col">
        {/* Exercise Header */}
        <div className={`bg-gradient-to-r ${getTemplateColor()} p-6 text-white`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowExercise(false)}
                className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
              >
                <ArrowLeft size={24} />
              </button>
              <div>
                <h1 className="text-2xl font-bold">Exercise</h1>
                <p className="text-white/80">Complete the exercise within the time limit</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Clock size={20} />
              <span className="text-xl font-mono">{formatTime(timeRemaining)}</span>
            </div>
          </div>
        </div>

        {/* Exercise Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {exerciseContent && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-bold mb-4">Exercise Instructions</h2>
              <div className="prose max-w-none">
                {exerciseContent.split('\n').map((line, index) => (
                  <p key={index} className="mb-2">{line}</p>
                ))}
              </div>
            </div>
          )}

          {/* Exercise Questions - Simple implementation */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Your Answers</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Question 1
                </label>
                <textarea
                  value={exerciseAnswers['q1'] || ''}
                  onChange={(e) => handleExerciseAnswerChange('q1', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Enter your answer here..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Question 2
                </label>
                <textarea
                  value={exerciseAnswers['q2'] || ''}
                  onChange={(e) => handleExerciseAnswerChange('q2', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Enter your answer here..."
                />
              </div>
            </div>
            <div className="mt-6">
              <button
                onClick={handleSubmitExercise}
                className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Submit Exercise
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-50 flex flex-col">
      {/* Header */}
      <div className={`bg-gradient-to-r ${getTemplateColor()} p-6 text-white`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Bell size={28} />
                {unreadCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold">Notifications</h1>
                <p className="text-white/80">
                  {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center space-x-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              >
                <CheckCheck size={16} />
                <span className="hidden sm:inline">Mark All Read</span>
              </button>
            )}
            <button
              onClick={clearAllNotifications}
              className="flex items-center space-x-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
            >
              <Trash2 size={16} />
              <span className="hidden sm:inline">Clear All</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center space-x-4">
          <Filter size={20} className="text-gray-500" />
          <div className="flex space-x-2">
            {[
              { value: 'all', label: 'All' },
              { value: 'unread', label: 'Unread' },
              { value: 'read', label: 'Read' }
            ].map((filterOption) => (
              <button
                key={filterOption.value}
                onClick={() => setFilter(filterOption.value as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === filterOption.value
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {filterOption.label}
                {filterOption.value === 'unread' && unreadCount > 0 && (
                  <span className="ml-2 bg-blue-500 text-white text-xs rounded-full px-2 py-1">
                    {unreadCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <Loader size={48} className="mb-4 opacity-50 animate-spin" />
            <h3 className="text-xl font-semibold mb-2">Loading notifications...</h3>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <XCircle size={64} className="mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">Error loading notifications</h3>
            <p className="text-center mb-4">{error}</p>
            <button
              onClick={loadNotifications}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <Bell size={64} className="mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">No notifications</h3>
            <p className="text-center">
              {filter === 'unread' 
                ? "You're all caught up! No unread notifications."
                : filter === 'read'
                ? "No read notifications to show."
                : "You don't have any notifications yet."}
            </p>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-white rounded-lg border shadow-sm transition-all hover:shadow-md ${
                  !notification.read 
                    ? 'border-l-4 border-l-blue-500 bg-blue-50/30' 
                    : 'border-gray-200'
                }`}
              >
                <div className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className={`text-sm font-semibold ${
                            !notification.read ? 'text-gray-900' : 'text-gray-700'
                          }`}>
                            {notification.title}
                          </h4>
                          <p className={`mt-1 text-sm ${
                            !notification.read ? 'text-gray-700' : 'text-gray-600'
                          }`}>
                            {notification.message}
                          </p>
                          <div className="flex items-center space-x-4 mt-2">
                            <span className="text-xs text-gray-500">
                              {new Date(notification.timestamp).toLocaleDateString()} at{' '}
                              {new Date(notification.timestamp).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                            {notification.actionUrl && (
                              <button className="text-xs text-blue-600 hover:text-blue-700 flex items-center space-x-1">
                                <span>View Details</span>
                                <ExternalLink size={12} />
                              </button>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          {!notification.read && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="text-blue-600 hover:text-blue-700 p-1 rounded transition-colors"
                              title="Mark as read"
                            >
                              <Check size={16} />
                            </button>
                          )}
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                      </div>
                      
                      {/* Reply Input - Only show for certain notification types */}
                      {notification.title.includes('Exercise') ? (
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                          <div className="flex items-center text-blue-700 mb-2">
                            <Clock size={16} className="mr-2" />
                            <span className="font-medium">Time limit: 10 minutes</span>
                          </div>
                          <button
                            onClick={() => handleStartExercise(notification.id)}
                            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                          >
                            <FileText size={16} className="mr-2" />
                            Start Exercise
                          </button>
                        </div>
                      ) : (
                        <div className="mt-3 flex">
                          <input
                            type="text"
                            value={replyMessage}
                            onChange={(e) => setReplyMessage(e.target.value)}
                            placeholder="Type your reply..."
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <button
                            onClick={() => handleReply(notification.id, user.template)}
                            className="px-4 py-2 bg-blue-500 text-white rounded-r-lg hover:bg-blue-600 transition-colors flex items-center"
                          >
                            <Send size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
