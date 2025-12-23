import React, { useState, useEffect } from 'react';
import { User } from './types';
import { storage } from './utils/storage';
import { RegistrationForm } from './components/RegistrationForm';
import { IDCard } from './components/IDCard';
import { LoginForm } from './components/LoginForm';
import { Dashboard } from './components/Dashboard';

type AppState = 'login' | 'register' | 'id-card' | 'dashboard';

function App() {
  const [appState, setAppState] = useState<AppState>('login');
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check if user is already registered
    const savedUser = storage.getUser();
    if (savedUser) {
      setUser(savedUser);
    } else {
      setAppState('register');
    }
  }, []);

  const handleRegister = (newUser: User) => {
    setUser(newUser);
    setAppState('id-card');
  };

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    setAppState('dashboard');
  };

  const handleIDCardContinue = () => {
    setAppState('dashboard');
  };

  const handleLogout = () => {
    storage.clearUser();
    setUser(null);
    setAppState('register');
  };

  const handleBackToRegister = () => {
    setAppState('register');
  };

  if (appState === 'register') {
    return <RegistrationForm onRegister={handleRegister} />;
  }

  if (appState === 'id-card' && user) {
    return <IDCard user={user} onContinue={handleIDCardContinue} />;
  }

  if (appState === 'login') {
    return <LoginForm onLogin={handleLogin} onBackToRegister={handleBackToRegister} />;
  }

  if (appState === 'dashboard' && user) {
    return <Dashboard user={user} onLogout={handleLogout} />;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
    </div>
  );
}

export default App;