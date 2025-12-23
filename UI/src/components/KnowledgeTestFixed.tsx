import React, { useState, useEffect } from 'react';
import { AcademicCapIcon } from '@heroicons/react/24/outline';

interface Question {
  id: string;
  question: string;
  options?: string[];
  type: 'text' | 'multiple';
}

interface KnowledgeTestProps {
  userId: string;
  category: string; // 'career' or 'education'
  onComplete: (score: number) => void;
}

export const KnowledgeTest: React.FC<KnowledgeTestProps> = ({ userId, category, onComplete }) => {
  const [questions, setQuestions] = useState<Question[] | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch('http://localhost:8000/tools/generate-quiz', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, category, num_questions: 5 }),
    })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then(data => {
        setQuestions(data || []);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load quiz questions. Please try again.');
        setLoading(false);
      });
  }, [userId, category]);

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleNext = () => setCurrentIndex(prev => Math.min(prev + 1, (questions?.length || 1) - 1));
  const handlePrev = () => setCurrentIndex(prev => Math.max(prev - 1, 0));

  const handleSubmit = () => {
    setIsSubmitting(true);
    fetch('http://localhost:8000/tools/submit-quiz', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, category, answers }),
    })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then(data => {
        setScore(data.score);
        onComplete(data.score);
        setIsSubmitting(false);
      })
      .catch(() => {
        setError('Failed to submit quiz. Please try again.');
        setIsSubmitting(false);
      });
  };



  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full"></div>
        <span className="ml-3 text-gray-700">Loading quiz questions...</span>
      </div>
    );

  if (error)
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg max-w-md mx-auto text-center mt-10">
        <p className="text-red-600">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
        >
          Retry
        </button>
      </div>
    );



  if (!questions || questions.length === 0) {
    return <div>No questions available.</div>;
  }

  const currentQuestion = questions[currentIndex];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <header className="w-full bg-gradient-to-r from-blue-600 to-teal-600 text-white py-4 px-6 rounded-b-3xl shadow-lg flex justify-center">
        <h1 className="text-2xl md:text-3xl font-bold">SCMC - Student Career Mentor ChatBot</h1>
      </header>

      {/* Icon + Title */}
      <div className="flex flex-col items-center mt-6">
        <div className="bg-blue-100 p-4 rounded-full shadow-md">
          <AcademicCapIcon className="h-12 w-12 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold mt-4 text-gray-800">Knowledge Test</h2>
        <p className="text-gray-600 mt-1 text-sm">from SCMC</p>
      </div>

      {/* Quiz Content */}
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-3xl shadow-2xl space-y-6 mt-6">
        <div>
          <p className="text-gray-600 mb-2 text-sm">
            Question {currentIndex + 1} of {questions.length}
          </p>
          <p className="text-gray-800 font-medium">{currentQuestion.question}</p>
        </div>

        {currentQuestion.type === 'multiple' && currentQuestion.options ? (
          <div className="space-y-2 mt-4">
            {currentQuestion.options.map(option => (
              <label
                key={option}
                className={`block border rounded-lg px-4 py-2 cursor-pointer transition-all ${
                  answers[currentQuestion.id] === option
                    ? 'bg-blue-100 border-blue-400 scale-105 shadow-md'
                    : 'hover:bg-gray-50 hover:scale-105'
                }`}
              >
                <input
                  type="radio"
                  name={currentQuestion.id}
                  value={option}
                  checked={answers[currentQuestion.id] === option}
                  onChange={() => handleAnswerChange(currentQuestion.id, option)}
                  className="mr-2"
                />
                {option}
              </label>
            ))}
          </div>
        ) : (
          <input
            type="text"
            value={answers[currentQuestion.id] || ''}
            onChange={e => handleAnswerChange(currentQuestion.id, e.target.value)}
            placeholder="Type your answer here..."
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none mt-4"
          />
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-6">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="px-5 py-2 bg-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-400 transition"
          >
            Previous
          </button>

          {currentIndex === questions.length - 1 ? (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
