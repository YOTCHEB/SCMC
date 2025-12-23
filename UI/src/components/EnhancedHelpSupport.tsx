import React from 'react';

interface EnhancedHelpSupportProps {
  onChatbotHelp?: () => void;
}

export const EnhancedHelpSupport: React.FC<EnhancedHelpSupportProps> = ({ onChatbotHelp }) => {
  const faqs = [
    {
      question: "How do I track my progress?",
      answer: "Your progress is automatically tracked as you complete quizzes and interact with the mentor. You can view your progress in the 'View Progress' section."
    },
    {
      question: "How do I change my mentor template?",
      answer: "You can change your mentor template in the Settings section. Navigate to Settings and select your preferred template."
    },
    {
      question: "What should I do if I encounter an error?",
      answer: "If you encounter an error, try refreshing the page. If the issue persists, please contact our support team."
    },
    {
      question: "How do I reset my progress?",
      answer: "To reset your progress, go to Settings and look for the 'Reset Progress' option. Please note that this action cannot be undone."
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Help & Support Center</h2>
        <p className="text-gray-600">How can we help you today?</p>
      </div>

      {/* Chatbot AI Help Button */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 mb-8 text-white">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="mb-4 md:mb-0 md:mr-4">
            <h3 className="text-xl font-bold mb-2">Need immediate assistance?</h3>
            <p className="opacity-90">Chat with our AI assistant for instant help</p>
          </div>
          <button
            onClick={onChatbotHelp}
            className="bg-white text-blue-600 font-semibold py-3 px-6 rounded-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Chat with AI Assistant
          </button>
        </div>
      </div>

      {/* Contact Information */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-blue-50 rounded-lg p-6 text-center">
          <div className="text-blue-500 mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Email Support</h3>
          <p className="text-gray-600">support@studentmentor.com</p>
          <p className="text-gray-500 text-sm mt-1">Response within 24 hours</p>
        </div>

        <div className="bg-green-50 rounded-lg p-6 text-center">
          <div className="text-green-500 mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Phone Support</h3>
          <p className="text-gray-600">+265 996541336</p>
          <p className="text-gray-500 text-sm mt-1">Mon-Fri, 9AM-5PM EST</p>
        </div>

        <div className="bg-purple-50 rounded-lg p-6 text-center">
          <div className="text-purple-500 mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Live Chat</h3>
          <p className="text-gray-600">Available 24/7</p>
          <p className="text-gray-500 text-sm mt-1">Click the chat icon in the corner</p>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-6">Frequently Asked Questions</h3>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
              <h4 className="text-lg font-semibold text-gray-800 mb-2">{faq.question}</h4>
              <p className="text-gray-600">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Additional Resources */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Additional Resources</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a href="#" className="flex items-center p-3 bg-white rounded-lg hover:shadow-md transition-all">
            <div className="bg-blue-100 p-2 rounded-lg mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <span className="text-gray-700 font-medium">User Guide PDF</span>
          </a>
          <a href="#" className="flex items-center p-3 bg-white rounded-lg hover:shadow-md transition-all">
            <div className="bg-green-100 p-2 rounded-lg mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-gray-700 font-medium">Video Tutorials</span>
          </a>
          <a href="#" className="flex items-center p-3 bg-white rounded-lg hover:shadow-md transition-all">
            <div className="bg-purple-100 p-2 rounded-lg mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <span className="text-gray-700 font-medium">Community Forum</span>
          </a>
          <a href="#" className="flex items-center p-3 bg-white rounded-lg hover:shadow-md transition-all">
            <div className="bg-yellow-100 p-2 rounded-lg mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
              </svg>
            </div>
            <span className="text-gray-700 font-medium">Release Notes</span>
          </a>
        </div>
      </div>
    </div>
  );
};
