import React, { useState, useEffect } from 'react';
import { AppState, WordSessionData, QuizResult } from './types';
import { generateWordSession } from './services/geminiService';
import { LearningPhase } from './components/LearningPhase';
import { QuizPhase } from './components/QuizPhase';
import { Summary } from './components/Summary';
import { Button } from './components/Button';
import { Loader2, BrainCircuit, Coffee } from 'lucide-react';
import { BREAK_DURATION_MS } from './constants';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [wordData, setWordData] = useState<WordSessionData | null>(null);
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [sessionCount, setSessionCount] = useState(0);

  const startNewSession = async () => {
    setAppState(AppState.GENERATING);
    try {
      const data = await generateWordSession();
      setWordData(data);
      setAppState(AppState.LEARNING);
    } catch (error) {
      console.error("Failed to generate session", error);
      alert("Something went wrong connecting to AI. Please check your connection or API key.");
      setAppState(AppState.IDLE);
    }
  };

  const handleLearningComplete = () => {
    setAppState(AppState.QUIZ);
  };

  const handleQuizComplete = (results: QuizResult[]) => {
    setQuizResults(results);
    setAppState(AppState.SUMMARY);
  };

  const handleNextWord = () => {
    const nextCount = sessionCount + 1;
    setSessionCount(nextCount);
    
    // Anti-fatigue check: every 3 words, take a short break
    if (nextCount > 0 && nextCount % 3 === 0) {
      setAppState(AppState.BREAK);
    } else {
      startNewSession();
    }
  };

  // Handle Break Timer
  useEffect(() => {
    if (appState === AppState.BREAK) {
      const timer = setTimeout(() => {
        startNewSession();
      }, BREAK_DURATION_MS);
      return () => clearTimeout(timer);
    }
  }, [appState]);

  // Main Render Switch
  const renderContent = () => {
    switch (appState) {
      case AppState.IDLE:
        return (
          <div className="flex flex-col items-center justify-center h-screen px-6 bg-white text-center space-y-8">
            <div className="bg-indigo-50 p-6 rounded-full animate-bounce-slow">
              <BrainCircuit size={64} className="text-indigo-600" />
            </div>
            <div>
              <h1 className="text-4xl font-serif font-bold text-gray-900 mb-2">First Principle</h1>
              <p className="text-gray-500 max-w-xs mx-auto">
                Deep vocabulary learning powered by AI. Understand the core, practice context, and master usage.
              </p>
            </div>
            <Button onClick={startNewSession} className="w-full max-w-xs h-14 text-lg shadow-xl shadow-indigo-100">
              Start Learning
            </Button>
          </div>
        );

      case AppState.GENERATING:
        return (
          <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
            <Loader2 className="animate-spin text-indigo-600 mb-4" size={48} />
            <h2 className="text-xl font-medium text-gray-700">Curating Session...</h2>
            <p className="text-sm text-gray-400 mt-2">Generating definitions and contexts</p>
          </div>
        );

      case AppState.LEARNING:
        return wordData ? (
          <LearningPhase data={wordData} onComplete={handleLearningComplete} />
        ) : null;

      case AppState.QUIZ:
        return wordData ? (
          <QuizPhase data={wordData} onComplete={handleQuizComplete} />
        ) : null;

      case AppState.SUMMARY:
        return wordData ? (
          <Summary wordData={wordData} results={quizResults} onNext={handleNextWord} />
        ) : null;
      
      case AppState.BREAK:
        return (
          <div className="flex flex-col items-center justify-center h-screen bg-teal-50 text-center px-6">
             <div className="animate-pulse mb-6">
                <Coffee size={64} className="text-teal-600" />
             </div>
             <h2 className="text-2xl font-bold text-teal-800 mb-2">Take a Breather</h2>
             <p className="text-teal-600">Rest your eyes for a moment. Next word coming up...</p>
          </div>
        )

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans selection:bg-indigo-100">
      {renderContent()}
    </div>
  );
};

export default App;
