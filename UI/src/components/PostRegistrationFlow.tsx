import React, { useState, useEffect } from 'react';
import { IDCard } from './IDCard';
import { KnowledgeTest } from './KnowledgeTestFixed';
import { TimetableDisplay } from './TimetableDisplay';
import { User } from '../types';
import { storage } from '../utils/storage';
import { api } from '../utils/api_new';

interface PostRegistrationFlowProps {
  user: User;
  onComplete: (updatedUser: User) => void;
}

type FlowStep = 'id-card' | 'knowledge-test' | 'test-results' | 'timetable' | 'complete';

export const PostRegistrationFlow: React.FC<PostRegistrationFlowProps> = ({ user, onComplete }) => {
  const savedStep = storage.getItem<string>('postRegistrationStep') as FlowStep | null;
  const savedUser = storage.getItem<User>('postRegistrationUser');

  const [currentStep, setCurrentStep] = useState<FlowStep>(savedStep || 'id-card');
  const [testScore, setTestScore] = useState<number | null>(null);
  const [timetable, setTimetable] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<User>(savedUser || user);

  const saveStep = (step: FlowStep) => storage.setItem('postRegistrationStep', step);
  const saveUser = (user: User) => storage.setItem('postRegistrationUser', user);

  const handleIDCardContinue = () => {
    setCurrentStep('knowledge-test');
    saveStep('knowledge-test');
  };

  const handleTestComplete = (score: number) => {
    setTestScore(score);
    const updatedUser = { ...currentUser, isConfirmed: true };
    setCurrentUser(updatedUser);
    saveUser(updatedUser);

    setCurrentStep('test-results');
    saveStep('test-results');
  };

  const [isGeneratingTimetable, setIsGeneratingTimetable] = React.useState(false);

  const handleContinueAfterResults = async () => {
    console.log('handleContinueAfterResults called with testScore:', testScore);
    console.log('currentUser:', currentUser);

    if (testScore !== null) {
      let level = 'beginner';
      if (testScore >= 85) {
        level = 'pro';
      } else if (testScore >= 75) {
        level = 'advanced';
      } else if (testScore >= 55) {
        level = 'intermediate';
      }

      console.log('Determined level:', level);

      try {
        setIsGeneratingTimetable(true);
        console.log('Calling api.generateTimetable with:', currentUser.id, currentUser.template, level);
        const timetableData = await api.generateTimetable(currentUser.id, currentUser.template, level);
        console.log('Timetable API response:', timetableData);

        if (timetableData && timetableData.content) {
          const timetableObj = {
            content: timetableData.content,
            level: level,
            category: currentUser.template,
            generated_at: new Date().toISOString(),
          };
          console.log('Setting timetable:', timetableObj);
          setTimetable(timetableObj);
          setCurrentStep('timetable');
          saveStep('timetable');
        } else {
          console.log('No timetable content received, going to complete');
          setCurrentStep('complete');
          saveStep('complete');
        }
      } catch (error) {
        console.error('Failed to generate timetable:', error);
        setCurrentStep('complete');
        saveStep('complete');
      } finally {
        setIsGeneratingTimetable(false);
      }
    } else {
      console.log('No test score, going to complete');
      setCurrentStep('complete');
      saveStep('complete');
    }
  };
  
  if (currentStep === 'test-results' && testScore !== null) {
    if (isGeneratingTimetable) {
      return (
        <div className="p-8 max-w-lg mx-auto bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-2xl mt-12 border border-gray-200 text-center">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Generating your personalized timetable...</h2>
          <div className="loader mx-auto"></div>
        </div>
      );
    }
  }

  const handleTimetableContinue = () => {
    setCurrentStep('complete');
    saveStep('complete');
  };

  useEffect(() => {
    if (currentStep === 'complete') {
      storage.removeItem('postRegistrationStep');
      storage.removeItem('postRegistrationUser');
      onComplete(currentUser);
    }
  }, [currentStep, currentUser, onComplete]);

  // ---- RENDER ----
  if (currentStep === 'id-card')
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-2xl text-center">
          <h1 className="text-3xl font-bold mb-2">Welcome!</h1>
          <p>Here's your Student ID card.</p>
          <IDCard {...currentUser} />
          <button onClick={handleIDCardContinue} className="bg-blue-600 text-white py-3 px-8 rounded-lg mt-4">
            Take Knowledge Assessment
          </button>
        </div>
      </div>
    );

  if (currentStep === 'knowledge-test')
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 p-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-teal-600 rounded-full mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Knowledge Assessment
            </h1>
            <p className="text-gray-600">
              Let's assess your current knowledge level in {currentUser.template} to create the perfect learning plan for you.
            </p>
          </div>

          <KnowledgeTest
            userId={currentUser.id}
            category={currentUser.template}
            onComplete={handleTestComplete}
          />
        </div>
      </div>
    );

  if (currentStep === 'test-results' && testScore !== null) {
    return (
      <div className="p-8 max-w-lg mx-auto bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-2xl mt-12 border border-gray-200">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-extrabold text-blue-700 tracking-wide">
            SCMC - Student Career Mentor ChatBot
          </h1>
          <div className="mt-2 h-1 w-20 mx-auto bg-blue-600 rounded-full"></div>
        </div>

        {/* Status Icon */}
        <div className="flex justify-center mb-6">
          {testScore < 55 ? (
            <div className="w-16 h-16 flex items-center justify-center rounded-full bg-red-100 text-red-600 text-3xl font-bold shadow-md">
              ✖
            </div>
          ) : (
            <div className="w-16 h-16 flex items-center justify-center rounded-full bg-green-100 text-green-600 text-3xl font-bold shadow-md">
              ✔
            </div>
          )}
        </div>

        {/* Title */}
        <h2 className="text-3xl font-extrabold text-gray-900 mb-4 text-center">
          Test Completed
        </h2>

        {/* Score */}
        <p className="text-xl font-semibold text-gray-800 mb-2 text-center">
          Your Score:{" "}
          <span
            className={
              testScore < 55 ? "text-red-600" : "text-green-600"
            }
          >
            {testScore}%
          </span>
        </p>

        {/* Message */}
        <p className="text-gray-600 mb-8 text-lg text-center">
          {testScore < 55
            ? "You will start the course at the beginner level."
            : "You are ready to start the course at your current level."}
        </p>

        {/* Continue Button */}
        <button
          onClick={handleContinueAfterResults}
          className="w-full bg-blue-600 hover:bg-blue-700 transition-all duration-200 text-white py-3 px-8 rounded-xl font-semibold shadow-lg"
        >
          Continue →
        </button>
      </div>
    );
  }

  if (currentStep === 'timetable' && timetable)
    return <TimetableDisplay timetable={timetable} onContinue={handleTimetableContinue} />;

  return null;
};
