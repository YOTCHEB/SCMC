import React, { useState } from 'react';
import { api } from '../utils/api';
import { Mail, RefreshCw, CheckCircle } from 'lucide-react';

interface ConfirmationFormProps {
  userId: string;
  email: string;
  onConfirmationComplete: () => void;
  onBackToLogin: () => void;
}

export const ConfirmationForm: React.FC<ConfirmationFormProps> = ({
  userId,
  email,
  onConfirmationComplete,
  onBackToLogin,
}) => {
  const [confirmationCode, setConfirmationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const response = await api.confirmEmail(userId, confirmationCode);
      
      if (response.confirmed) {
        setSuccess('Email confirmed successfully! You can now log in with your Student ID.');
        setTimeout(() => {
          onConfirmationComplete();
        }, 2000);
      } else {
        setError('Confirmation failed. Please check the code and try again.');
      }
    } catch (err: any) {
      setError(err.message || 'Confirmation failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    setError('');
    setSuccess('');
    setIsResending(true);

    try {
      const response = await api.resendConfirmation(userId);
      if (response.email_sent) {
        setSuccess('Confirmation email resent successfully!');
      } else {
        setError('Failed to resend confirmation email. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to resend confirmation email.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-teal-600 rounded-full mb-4">
            <Mail size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Confirm Your Email
          </h1>
          <p className="text-gray-600">
            We sent a confirmation code to {email}
          </p>
        </div>

        {/* Confirmation Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Confirmation Code Input */}
            <div className="form-group">
              <label className="form-label">
                <CheckCircle size={20} className="text-blue-600" />
                Confirmation Code
              </label>
              <input
                type="text"
                value={confirmationCode}
                onChange={(e) => {
                  setConfirmationCode(e.target.value);
                  setError('');
                }}
                className={`form-input font-mono tracking-wider text-center ${error ? 'border-red-500' : ''}`}
                placeholder="Enter 6-digit code"
                maxLength={6}
                required
              />
              {error && <p className="form-error">{error}</p>}
              {success && <p className="text-green-600 text-sm mt-2">{success}</p>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || confirmationCode.length !== 6}
              className="w-full bg-gradient-to-r from-blue-600 to-teal-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-teal-700 transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Confirming...</span>
                </>
              ) : (
                <>
                  <CheckCircle size={20} />
                  <span>Confirm Email</span>
                </>
              )}
            </button>
          </form>

          {/* Resend Confirmation */}
          <div className="mt-6 text-center">
            <button
              onClick={handleResendConfirmation}
              disabled={isResending}
              className="text-blue-600 hover:text-blue-700 font-semibold flex items-center justify-center space-x-2 mx-auto disabled:opacity-50"
            >
              {isResending ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  <span>Resending...</span>
                </>
              ) : (
                <>
                  <RefreshCw size={16} />
                  <span>Resend Confirmation Code</span>
                </>
              )}
            </button>
          </div>

          {/* Back to Login */}
          <div className="mt-8 text-center">
            <p className="text-gray-600 mb-4">Already confirmed?</p>
            <button
              onClick={onBackToLogin}
              className="text-blue-600 hover:text-blue-700 font-semibold underline"
            >
              Back to Login
            </button>
          </div>

          {/* Help Information */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">Need help?</h4>
            <p className="text-sm text-blue-700">
              Check your spam folder if you don't see the email. The confirmation code expires in 24 hours.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
