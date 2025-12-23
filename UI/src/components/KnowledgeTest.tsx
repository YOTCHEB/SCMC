import React, { useState, useEffect } from 'react';

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
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  useEffect(() => {
    // Fetch questions from backend
    fetch(`${process.env.REACT_APP_API_BASE_URL}/tools/generate-quiz`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, category, num_questions: 5 }),
    })
      .then(res => res.json())
      .then(data => {
        setQuestions(data.questions || []);
      })
      .catch(() => {
        setQuestions([]);
      });
  }, [userId, category]);

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    // Submit answers for scoring
    fetch(`${process.env.REACT_APP_API_BASE_URL}/tools/submit-answers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, category, answers }),
    })
      .then(res => res.json())
      .then(data => {
        setScore(data.score);
        onComplete(data.score);
        setIsSubmitting(false);
      })
      .catch(() => {
        setIsSubmitting(false);
      });
  };

  if (score !== null) {
    return (
      <div className="p-4 bg-white rounded shadow">
        <h2 className="text-xl font-bold mb-4">Test Completed</h2>
        <p>Your score: {score}%</p>
        <p>
          {score < 55
            ? 'You will start the course at the beginner level.'
            : 'You are ready to start the course at your current level.'}
        </p>
      </div>
    );
  }

  if (questions.length === 0) {
    return <p>Loading questions...</p>;
  }

  const currentQuestion = questions[currentIndex];

  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Knowledge Test</h2>
      <p>
        Question {currentIndex + 1} of {questions.length}
      </p>
      <div className="mt-4">
        <p className="mb-2">{currentQuestion.question}</p>
        {currentQuestion.type === 'multiple' && currentQuestion.options ? (
          currentQuestion.options.map(option => (
            <label key={option} className="block mb-1">
              <input
                type="radio"
                name={currentQuestion.id}
                value={option}
                checked={answers[currentQuestion.id] === option}
                onChange={() => handleAnswerChange(currentQuestion.id, option)}
              />{' '}
              {option}
            </label>
          ))
        ) : (
          <input
            type="text"
            value={answers[currentQuestion.id] || ''}
            onChange={e => handleAnswerChange(currentQuestion.id, e.target.value)}
            className="border p-2 w-full"
          />
        )}
      </div>
      <div className="mt-4 flex justify-between">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
        >
          Previous
        </button>
        {currentIndex === questions.length - 1 ? (
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
};
