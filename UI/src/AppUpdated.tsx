import React, { useState, useEffect } from 'react';
import { User } from './types';
import { storage } from './utils/storage';
import { RegistrationForm } from './components/RegistrationForm';
import { ConfirmationForm } from './components/ConfirmationForm';
import { PostRegistrationFlow } from './components/PostRegistrationFlow';
import { LoginForm } from './components/LoginForm';
import { Dashboard } from './components/Dashboard';

// Global error handler for unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  event.preventDefault();
});

type AppState = 'login' | 'register' | 'confirmation' | 'post-registration' | 'dashboard' | 'complete';

function AppUpdated() {
  const [appState, setAppState] = useState<AppState>('login');
  const [user, setUser] = useState<User | null>(null);
  const [pendingUser, setPendingUser] = useState<User | null>(null);

  useEffect(() => {
    const savedUser = storage.getUser();
    if (savedUser) {
      setUser(savedUser);

      const savedStep = storage.getItem<AppState>('postRegistrationStep');
      if (savedStep && savedStep !== 'complete') {
        setAppState('post-registration');
      } else {
        setAppState('dashboard');
      }
    } else {
      setAppState('register');
    }
  }, []);

  const handleRegister = (newUser: User) => {
    setPendingUser(newUser);
    setAppState('confirmation');
  };

  const handleConfirmationComplete = () => {
    if (pendingUser) {
      setUser(pendingUser);
      storage.saveUser(pendingUser);
      setPendingUser(null);
      setAppState('post-registration');
    }
  };

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    setAppState('dashboard');
  };

  const handlePostRegistrationComplete = (updatedUser: User) => {
    setUser(updatedUser);
    storage.saveUser(updatedUser);
    setAppState('dashboard');
  };

  const handleLogout = () => {
    storage.clearUser();
    storage.removeItem('postRegistrationStep');
    storage.removeItem('postRegistrationUser');
    setUser(null);
    setPendingUser(null);
    setAppState('register');
  };

  const handleBackToRegister = () => setAppState('register');
  const handleBackToLogin = () => setAppState('login');

  if (appState === 'register') return <RegistrationForm onRegister={handleRegister} />;
  if (appState === 'confirmation' && pendingUser)
    return (
      <ConfirmationForm
        userId={pendingUser.id}
        email={pendingUser.email}
        onConfirmationComplete={handleConfirmationComplete}
        onBackToLogin={handleBackToLogin}
      />
    );
  if (appState === 'post-registration' && user)
    return <PostRegistrationFlow user={user} onComplete={handlePostRegistrationComplete} />;
  if (appState === 'login') return <LoginForm onLogin={handleLogin} onBackToRegister={handleBackToRegister} />;
  if (appState === 'dashboard' && user) return <Dashboard user={user} onLogout={handleLogout} />;

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
    </div>
  );
}

export default AppUpdated;
