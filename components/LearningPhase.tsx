import React, { useState } from 'react';
import { WordSessionData } from '../types';
import { Button } from './Button';
import { Volume2, ArrowRight, BookOpen } from 'lucide-react';

interface Props {
  data: WordSessionData;
  onComplete: () => void;
}

export const LearningPhase: React.FC<Props> = ({ data, onComplete }) => {
  const [index, setIndex] = useState(-1); // -1 is the definition card

  const handleNext = () => {
    if (index < data.learning_examples.length - 1) {
      setIndex(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const handleSpeak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  // Progress calculation
  const totalCards = data.learning_examples.length + 1;
  const currentStep = index + 2; // 1-based index including definition
  const progressPercent = (currentStep / totalCards) * 100;

  return (
    <div className="flex flex-col h-full max-w-md mx-auto relative">
      {/* Top Bar */}
      <div className="pt-6 pb-2 px-6 bg-white/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Learning Phase</span>
            <span className="text-xs font-medium text-indigo-600">{currentStep} / {totalCards}</span>
        </div>
        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-indigo-500 transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4 no-scrollbar">
        {index === -1 ? (
          // Definition Card
          <div className="animate-fade-in space-y-8 py-10">
            <div className="text-center space-y-4">
              <h1 className="text-5xl font-serif font-bold text-gray-900 tracking-tight">{data.word}</h1>
              <div className="flex justify-center items-center gap-2 text-gray-500">
                <span className="font-mono text-lg">/{data.phonetic}/</span>
                <button 
                  onClick={() => handleSpeak(data.word)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <Volume2 size={20} />
                </button>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg border border-indigo-50 space-y-4 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                <h3 className="text-sm font-semibold text-indigo-900 uppercase tracking-wide">First Principle Definition</h3>
                <p className="text-xl text-gray-800 leading-relaxed font-medium">
                  {data.first_principle_definition}
                </p>
            </div>
            
            <div className="text-center text-gray-400 text-sm">
                Tap continue to see examples in context.
            </div>
          </div>
        ) : (
          // Example Card
          <div className="animate-fade-in space-y-6 py-4">
             <div className="flex items-center gap-2 mb-6 opacity-70">
                 <h2 className="text-2xl font-serif font-bold text-gray-900">{data.word}</h2>
                 <span className="text-sm bg-gray-200 px-2 py-0.5 rounded text-gray-600">Example {index + 1}</span>
             </div>

            <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                <div className="bg-indigo-50 px-6 py-3 border-b border-indigo-100 flex items-center gap-2">
                    <BookOpen size={16} className="text-indigo-600"/>
                    <span className="text-sm font-semibold text-indigo-700 uppercase tracking-wide">
                        {data.learning_examples[index].context_description}
                    </span>
                </div>
                <div className="p-8 space-y-6">
                    <div>
                        <p className="text-2xl text-gray-800 leading-normal font-serif">
                            {data.learning_examples[index].english.split(' ').map((word, i) => {
                                // Simple highlighting of the word (case insensitive check)
                                const isTarget = word.toLowerCase().includes(data.word.toLowerCase().slice(0, -1)); // simple heuristic
                                return isTarget ? (
                                    <span key={i} className="text-indigo-600 font-bold bg-indigo-50 px-1 rounded">{word} </span>
                                ) : (
                                    <span key={i}>{word} </span>
                                )
                            })}
                            <button 
                                onClick={() => handleSpeak(data.learning_examples[index].english)}
                                className="inline-block ml-2 align-middle text-gray-400 hover:text-indigo-600 transition-colors"
                            >
                                <Volume2 size={20} />
                            </button>
                        </p>
                    </div>
                    
                    <div className="pt-6 border-t border-dashed border-gray-200">
                        <p className="text-lg text-gray-600">
                            {data.learning_examples[index].chinese}
                        </p>
                    </div>
                </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Actions */}
      <div className="p-6 bg-white border-t border-gray-100 sticky bottom-0 z-10 pb-8">
        <Button 
          onClick={handleNext} 
          fullWidth 
          className="flex items-center justify-center gap-2 text-lg h-14"
        >
          {index === data.learning_examples.length - 1 ? "Start Quiz" : "Continue"}
          <ArrowRight size={20} />
        </Button>
      </div>
    </div>
  );
};
