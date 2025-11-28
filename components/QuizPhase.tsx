import React, { useState } from 'react';
import { WordSessionData, QuizResult } from '../types';
import { evaluateUserAnswer } from '../services/geminiService';
import { Button } from './Button';
import { Send, CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface Props {
  data: WordSessionData;
  onComplete: (results: QuizResult[]) => void;
}

export const QuizPhase: React.FC<Props> = ({ data, onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentResult, setCurrentResult] = useState<QuizResult | null>(null);
  const [results, setResults] = useState<QuizResult[]>([]);

  const handleEvaluate = async () => {
    if (!userInput.trim()) return;
    
    setIsSubmitting(true);
    try {
      const sentence = data.quiz_examples[currentIndex];
      const evaluation = await evaluateUserAnswer(
        sentence.sentence,
        sentence.hidden_meaning,
        userInput
      );

      const result: QuizResult = {
        sentenceIndex: currentIndex,
        userAnswer: userInput,
        score: evaluation.score,
        feedback: evaluation.feedback
      };

      setCurrentResult(result);
      setResults(prev => [...prev, result]);
    } catch (error) {
      console.error(error);
      alert("Evaluation failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < data.quiz_examples.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setUserInput('');
      setCurrentResult(null);
    } else {
      onComplete(results);
    }
  };

  const currentSentence = data.quiz_examples[currentIndex];
  const progressPercent = ((currentIndex + 1) / data.quiz_examples.length) * 100;

  return (
    <div className="flex flex-col h-full max-w-md mx-auto">
      {/* Progress */}
      <div className="pt-6 px-6 bg-white/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Quiz Phase</span>
            <span className="text-xs font-medium text-orange-600">{currentIndex + 1} / {data.quiz_examples.length}</span>
        </div>
        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-orange-500 transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 no-scrollbar">
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                <h3 className="text-sm font-semibold text-gray-400 uppercase mb-4">Translate / Explain</h3>
                <p className="text-xl font-serif text-gray-900 leading-relaxed">
                    {currentSentence.sentence}
                </p>
            </div>

            {!currentResult ? (
                // Input Area
                <div className="space-y-4 animate-fade-in">
                    <textarea
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        placeholder="Type the meaning in Chinese..."
                        className="w-full h-32 p-4 rounded-xl border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none resize-none text-lg transition-all"
                        autoFocus
                    />
                    <div className="text-xs text-center text-gray-400">
                        Use the First Principles definition to guide your translation.
                    </div>
                </div>
            ) : (
                // Feedback Area
                <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 animate-fade-in space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                             {currentResult.score >= 80 ? (
                                <CheckCircle className="text-green-500" size={24} />
                             ) : (
                                <XCircle className="text-orange-500" size={24} />
                             )}
                             <span className="text-xl font-bold text-gray-900">Score: {currentResult.score}</span>
                        </div>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-xl text-gray-700">
                        <p className="text-sm font-medium text-gray-400 mb-1">AI Feedback</p>
                        {currentResult.feedback}
                    </div>

                    <div className="border-t pt-3 mt-2">
                        <p className="text-xs text-gray-400 uppercase">Hidden Meaning</p>
                        <p className="text-gray-800 mt-1">{currentSentence.hidden_meaning}</p>
                    </div>
                </div>
            )}
        </div>
      </div>

      {/* Bottom Action */}
      <div className="p-6 bg-white border-t border-gray-100 sticky bottom-0 z-10 pb-8">
        {!currentResult ? (
            <Button 
                onClick={handleEvaluate} 
                fullWidth 
                disabled={!userInput.trim() || isSubmitting}
                variant="warning"
                className="h-14 text-lg"
            >
                {isSubmitting ? (
                    <><Loader2 className="animate-spin" /> Checking...</>
                ) : (
                    <><Send size={18} /> Submit Answer</>
                )}
            </Button>
        ) : (
            <Button 
                onClick={handleNext} 
                fullWidth
                variant="warning"
                className="h-14 text-lg"
            >
                Next Sentence
            </Button>
        )}
      </div>
    </div>
  );
};