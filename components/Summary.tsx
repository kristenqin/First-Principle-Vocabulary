import React from 'react';
import { WordSessionData, QuizResult } from '../types';
import { Button } from './Button';
import { Star, RotateCcw, Award } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface Props {
  wordData: WordSessionData;
  results: QuizResult[];
  onNext: () => void;
}

export const Summary: React.FC<Props> = ({ wordData, results, onNext }) => {
  const averageScore = Math.round(results.reduce((acc, curr) => acc + curr.score, 0) / results.length);
  
  const chartData = [
    { name: 'Score', value: averageScore },
    { name: 'Remaining', value: 100 - averageScore },
  ];
  
  const COLORS = ['#4f46e5', '#e5e7eb'];

  return (
    <div className="flex flex-col h-full items-center justify-center p-6 max-w-md mx-auto bg-white">
      <div className="text-center space-y-2 mb-8 animate-fade-in">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
             <Award className="text-yellow-600" size={32} />
        </div>
        <h2 className="text-3xl font-bold text-gray-900">Session Complete</h2>
        <p className="text-gray-500">You've mastered "{wordData.word}"</p>
      </div>

      <div className="w-full h-64 relative mb-8">
         <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                startAngle={90}
                endAngle={-270}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
         </ResponsiveContainer>
         <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
             <span className="text-4xl font-bold text-indigo-600">{averageScore}</span>
             <span className="text-xs text-gray-400 uppercase tracking-widest">Avg Score</span>
         </div>
      </div>

      <div className="w-full space-y-4 mb-8">
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
            <h4 className="text-sm font-semibold text-gray-500 mb-2">Definition Recall</h4>
            <p className="text-gray-800 italic">"{wordData.first_principle_definition}"</p>
        </div>
      </div>

      <Button onClick={onNext} fullWidth className="h-14 text-lg gap-2 flex items-center justify-center">
        <RotateCcw size={20} />
        Next Word
      </Button>
    </div>
  );
};
