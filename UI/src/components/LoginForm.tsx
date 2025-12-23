import React, { useState } from 'react';
import { User } from '../types';
import { storage } from '../utils/storage';
import { api } from '../utils/api';
import { CreditCard, Lock, LogIn, Mail } from 'lucide-react';

interface LoginFormProps {
  onLogin: (user: User) => void;
  onBackToRegister: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onLogin, onBackToRegister }) => {
  const [cardId, setCardId] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const user = storage.getUser();
      
      if (!user) {
        setError('No account found. Please register first.');
        setIsLoading(false);
        return;
      }

      if (user.cardId !== cardId.toUpperCase()) {
        setError('Invalid ID number. Please check your student ID card.');
        setIsLoading(false);
        return;
      }

      // Check if user is confirmed
      const status = await api.getUserStatus(user.id);
      
      if (!status.is_confirmed) {
        setError('Account not confirmed. Please check your email for confirmation instructions.');
        setIsLoading(false);
        return;
      }

      // Simulate loading for better UX
      setTimeout(() => {
        onLogin(user);
        setIsLoading(false);
      }, 1000);

    } catch (err) {
      setError('An error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-teal-600 rounded-full mb-4">
            <Lock size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Student Login
          </h1>
          <p className="text-gray-600">Enter your student ID to access your mentor</p>
        </div>

        {/* Login Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Card ID Input */}
            <div className="form-group">
              <label className="form-label">
                <CreditCard size={20} className="text-blue-600" />
                Student ID Number
              </label>
              <input
                type="text"
                value={cardId}
                onChange={(e) => {
                  setCardId(e.target.value.toUpperCase());
                  setError('');
                }}
                className={`form-input font-mono tracking-wider text-center ${error ? 'border-red-500' : ''}`}
                placeholder="Enter your 12-digit ID"
                maxLength={12}
                required
              />
              {error && <p className="form-error">{error}</p>}
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading || cardId.length !== 12}
              className="w-full bg-gradient-to-r from-blue-600 to-teal-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-teal-700 transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Logging in...</span>
                </>
              ) : (
                <>
                  <LogIn size={20} />
                  <span>Access Dashboard</span>
                </>
              )}
            </button>
          </form>

          {/* Register Link */}
          <div className="mt-8 text-center">
            <p className="text-gray-600 mb-4">Don't have a student ID?</p>
            <button
              onClick={onBackToRegister}
              className="text-blue-600 hover:text-blue-700 font-semibold underline"
            >
              Create New Account
            </button>
          </div>

          {/* ID Format Help */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">ID Format:</h4>
            <p className="text-sm text-blue-700">
              Your student ID is a 12-character code found on your student card.
              Example: ABC123DEF456
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};