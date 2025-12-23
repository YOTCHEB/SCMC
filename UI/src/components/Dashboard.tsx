import React, { useState, useRef, useEffect } from 'react';
import { User, Message, ChatState, Notification } from '../types';
import { api } from '../utils/api';
import { 
  Send, 
  LogOut, 
  User as UserIcon, 
  MessageCircle, 
  BookOpen, 
  Briefcase, 
  GraduationCap, 
  DollarSign,
  Menu,
  X,
  Bot,
  Settings,
  HelpCircle,
  TrendingUp,
  Bell
} from 'lucide-react';
import  {Setting}  from "./Setting";
import { Notifications } from "./Notifications";
import { EnhancedProgressChart } from "./EnhancedProgressChart";
import { EnhancedHelpSupport } from "./EnhancedHelpSupport";

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    isLoading: false,
  });
  const [inputMessage, setInputMessage] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showSetting, setShowSetting] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const [showHelpSupport, setShowHelpSupport] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // for Setting 

  const displaySetting = () => {
    setShowSetting((prev) => !prev); 
  };

  const displayNotifications = () => {
    setShowNotifications((prev) => !prev);
  };

  const displayProgress = () => {
    setShowProgress((prev) => !prev);
    // Close other views when opening progress
    if (!showProgress) {
      setShowSetting(false);
      setShowNotifications(false);
      setShowHelpSupport(false);
    }
  };

  const displayHelpSupport = () => {
    setShowHelpSupport((prev) => !prev);
    // Close other views when opening help & support
    if (!showHelpSupport) {
      setShowSetting(false);
      setShowNotifications(false);
      setShowProgress(false);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatState.messages]);

  // Function to handle suggestion click
  const handleSuggestionClick = async (suggestion: string) => {
    // Create user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: suggestion,
      isUser: true,
      timestamp: new Date().toISOString(),
    };

    // Add user message to chat
    setChatState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isLoading: true,
    }));

    try {
      // Send message to AI
      const response = await api.sendMessage(user.template, suggestion, user.id);
      
      // Create AI message
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.message || response.response || 'I apologize, but I encountered an error. Please try again.',
        isUser: false,
        timestamp: new Date().toISOString(),
      };

      // Add AI message to chat
      setChatState(prev => ({
        ...prev,
        messages: [...prev.messages, aiMessage],
        isLoading: false,
      }));
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'I apologize, but I\'m having trouble connecting right now. Please ensure the backend server is running and try again.',
        isUser: false,
        timestamp: new Date().toISOString(),
      };

      setChatState(prev => ({
        ...prev,
        messages: [...prev.messages, errorMessage],
        isLoading: false,
      }));
    }
  };

  useEffect(() => {
    // Load personalized suggestions from API
    const loadPersonalizedSuggestions = async () => {
      try {
        const response = await api.getPersonalizedSuggestions(user.id);
        const suggestions = response.suggestions || [];

        // Create welcome message content with clickable suggestions
        let welcomeContent = `Hello ${user.name}! I'm your ${user.template} mentor. How can I help you today?`;

        // Add suggestions to the content in a structured way
        suggestions.forEach((suggestion: string, index: number) => {
          welcomeContent += `\n${index + 1}. ${suggestion}`;
        });

        const welcomeMessage: Message = {
          id: Date.now().toString(),
          content: welcomeContent,
          isUser: false,
          timestamp: new Date().toISOString()
        };

        setChatState(prev => ({
          ...prev,
          messages: [welcomeMessage]
        }));
      } catch (error) {
        console.error('Error loading personalized suggestions:', error);

        // Fallback to basic welcome message if API fails
        const fallbackMessage: Message = {
          id: Date.now().toString(),
          content: `Hello ${user.name}! I'm your ${user.template} mentor. How can I help you today? Feel free to ask me any questions about ${user.template} topics.`,
          isUser: false,
          timestamp: new Date().toISOString()
        };

        setChatState(prev => ({
          ...prev,
          messages: [fallbackMessage]
        }));
      }
    };

    loadPersonalizedSuggestions();
  }, [user]);

  useEffect(() => {
    // Load notifications
    const loadNotifications = async () => {
      try {
        const response = await api.getNotifications(user.id, true);
        setNotifications(response.notifications || []);
        setUnreadCount(response.notifications?.length || 0);
      } catch (err) {
        console.error('Error loading notifications:', err);
      }
    };

    loadNotifications();
  }, [user.id]);

  const getTemplateIcon = () => {
    const icons = {
      career: Briefcase,
      business: DollarSign,
      education: GraduationCap,
      finance: BookOpen,
    };
    const IconComponent = icons[user.template as keyof typeof icons] || Briefcase;
    return <IconComponent size={24} />;
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

  const getTemplateAccent = () => {
    const colors = {
      career: 'blue',
      business: 'purple',
      education: 'green',
      finance: 'orange',
    };
    return colors[user.template as keyof typeof colors] || colors.career;
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputMessage.trim() || chatState.isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage.trim(),
      isUser: true,
      timestamp: new Date().toISOString(),
    };

    setChatState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isLoading: true,
    }));

    setInputMessage('');

    try {
      const response = await api.sendMessage(user.template, userMessage.content, user.id);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.message || response.response || 'I apologize, but I encountered an error. Please try again.',
        isUser: false,
        timestamp: new Date().toISOString(),
      };

      setChatState(prev => ({
        ...prev,
        messages: [...prev.messages, aiMessage],
        isLoading: false,
      }));
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'I apologize, but I\'m having trouble connecting right now. Please ensure the backend server is running and try again.',
        isUser: false,
        timestamp: new Date().toISOString(),
      };

      setChatState(prev => ({
        ...prev,
        messages: [...prev.messages, errorMessage],
        isLoading: false,
      }));
    }
  };

  // Function to render message content
  const renderMessageContent = (message: Message) => {
    // Check if this is a welcome message with suggestions
    if (message.content.startsWith(`Hello ${user.name}! I'm your ${user.template} mentor.`) && message.content.includes("\n1.")) {
      // Split the content into lines
      const lines = message.content.split("\n");
      // The first line is the welcome message
      const welcomeMessage = lines[0];
      // The rest are the suggestions
      const suggestions = lines.slice(1);
      
      return (
        <div className="space-y-3">
          {/* Greeting message */}
          <div className="mb-4">
            <p className="text-lg font-semibold text-gray-800">{welcomeMessage}</p>
            <p className="text-gray-600 mt-2">Here are some suggestions to get you started:</p>
          </div>
          
          {/* Suggestions grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {suggestions.map((suggestion, index) => {
              // Remove the number prefix from the suggestion
              const cleanSuggestion = suggestion.replace(/^\d+\.\s*/, '').trim();
              return (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(cleanSuggestion)}
                  className="text-left p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold mr-3 mt-0.5">
                      {index + 1}
                    </div>
                    <p className="text-gray-700 font-medium">{cleanSuggestion}</p>
                  </div>
                </button>
              );
            })}
          </div>
          
          {/* Additional message */}
          <p className="text-sm text-gray-500 mt-4">
            Click on any suggestion above to ask your mentor, or type your own question below.
          </p>
        </div>
      );
    }
    return <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>;
  };

  return (
    <div className="h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex overflow-hidden">
      {/* Sidebar */}
      <div className={`${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 w-80 bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out z-50 flex flex-col`} style={{ height: '100vh' }}>
        {/* Sidebar Header */}
        <div className={`bg-gradient-to-r ${getTemplateColor()} p-6 text-white`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Student Mentor</h2>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden text-white hover:bg-white/20 p-1 rounded"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/30 bg-white/20">
              {user.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <UserIcon size={24} className="text-white" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate">{user.name}</h3>
              <p className="text-sm opacity-80 capitalize">{user.template} Mentoring</p>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="p-6 border-b border-gray-200">
          <div className="space-y-3">
            <div className="flex items-center space-x-3 text-sm text-gray-600">
              <UserIcon size={16} />
              <span>ID: {user.cardId}</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-gray-600">
              {getTemplateIcon()}
              <span className="capitalize">{user.template} Track</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-gray-600">
              <MessageCircle size={16} />
              <span>{chatState.messages.length} Messages</span>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="flex-1 p-6">
          <div className="space-y-2">
            <button className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg bg-${getTemplateAccent()}-50 text-${getTemplateAccent()}-700 font-medium`}>
              <Bot size={20} />
              <span>Chat with Mentor</span>
            </button>
            <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors "onClick={displaySetting}>
              <Settings size={20} />
              <span>Settings</span>
            </button>
            <button 
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors"
              onClick={displayProgress}
            >
              <TrendingUp size={20} />
              <span>View Progress</span>
            </button>
            <button 
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors"
              onClick={displayHelpSupport}
            >
              <HelpCircle size={20} />
              <span>Help & Support</span>
            </button>
          </div>
        </div>

        {/* Progress Chart */}
        {/* <div className="p-6 border-t border-gray-200">
          <EnhancedProgressChart user={user} />
        </div> */}

        {/* Logout Button */}
        <div className="p-6 border-t border-gray-200">
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Render Setting Component or Chat Interface */}
        {showSetting ? (
          <Setting 
            user={user} 
            onBack={displaySetting} 
            onSettingsUpdate={(updatedSettings) => {
              // Handle settings update logic here
              console.log('Settings updated:', updatedSettings);
            }} 
          />
        ) : showNotifications ? (
          <Notifications 
            user={user} 
            onBack={displayNotifications} 
          />
        ) : showProgress ? (
          <div className="flex flex-col h-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Your Progress</h2>
              <button
                onClick={displayProgress}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            <div className="flex-1 overflow-auto">
              <EnhancedProgressChart user={user} />
            </div>
          </div>
        ) : showHelpSupport ? (
          <div className="flex flex-col h-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Help & Support</h2>
              <button
                onClick={displayHelpSupport}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            <div className="flex-1 overflow-auto">
              <EnhancedHelpSupport onChatbotHelp={() => {
                // Close the help support view and return to chat
                displayHelpSupport();
                // Optionally, you could add a specific message to the chat here
              }} />
            </div>
          </div>
        ) : (
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="lg:hidden text-gray-600 hover:bg-gray-100 p-2 rounded-lg"
                >
                  <Menu size={24} />
                </button>
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${getTemplateColor()} flex items-center justify-center text-white`}>
                    {getTemplateIcon()}
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-800 capitalize">
                      {user.template} Mentor Chat
                    </h1>
                    <p className="text-sm text-gray-600">AI-powered personalized guidance</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <button onClick={displayNotifications} className="text-gray-600 hover:bg-gray-100 p-2 rounded-lg relative">
                    <Bell size={24} />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                </div>
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                <span className="text-sm text-gray-600 hidden sm:inline">Online</span>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-hidden">
              <div className="h-full overflow-y-auto custom-scrollbar p-4 space-y-4">
                {chatState.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} fade-in`}
                  >
                    <div className={`flex items-start space-x-2 max-w-4xl ${message.isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
                      {/* Avatar */}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        message.isUser 
                          ? `bg-gradient-to-r ${getTemplateColor()} text-white` 
                          : 'bg-gray-200 text-gray-600'
                      }`}>
                        {message.isUser ? <UserIcon size={16} /> : <Bot size={16} />}
                      </div>
                      
                      {/* Message */}
                      <div className={`${
                        message.isUser 
                          ? `chat-bubble-user bg-gradient-to-r ${getTemplateColor()}` 
                          : 'chat-bubble-ai'
                      } ${message.isUser ? 'slide-in-right' : 'slide-in-left'}`}>
                        {renderMessageContent(message)}
                        <p className={`text-xs mt-2 ${
                          message.isUser ? 'text-white/70' : 'text-gray-500'
                        }`}>
                          {new Date(message.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Loading indicator */}
                {chatState.isLoading && (
                  <div className="flex justify-start fade-in">
                    <div className="flex items-start space-x-2 max-w-4xl">
                      <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center flex-shrink-0">
                        <Bot size={16} />
                      </div>
                      <div className="chat-bubble-ai">
                        <div className="typing-indicator">
                          <div className="typing-dot"></div>
                          <div className="typing-dot"></div>
                          <div className="typing-dot"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Message Input */}
            <div className="bg-white border-t border-gray-200 p-4 flex-shrink-0">
              <form onSubmit={handleSendMessage} className="flex space-x-4">
                <div className="flex-1">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder={`Ask your ${user.template} mentor anything...`}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-gray-50"
                    disabled={chatState.isLoading}
                  />
                </div>
                <button
                  type="submit"
                  disabled={!inputMessage.trim() || chatState.isLoading}
                  className={`px-6 py-3 bg-gradient-to-r ${getTemplateColor()} text-white rounded-xl hover:opacity-90 transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center space-x-2`}
                >
                  <Send size={20} />
                  <span className="hidden sm:inline">Send</span>
                </button>
              </form>
              
              <div className="mt-2 flex items-center justify-center space-x-4 text-xs text-gray-500">
                <span>Press Enter to send</span>
                <span>•</span>
                <span>Powered by AI</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
