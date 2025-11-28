export enum AppState {
  IDLE = 'IDLE',
  GENERATING = 'GENERATING',
  LEARNING = 'LEARNING',
  QUIZ = 'QUIZ',
  SUMMARY = 'SUMMARY',
  BREAK = 'BREAK'
}

export interface LearningSentence {
  english: string;
  chinese: string;
  context_description: string;
}

export interface QuizSentence {
  sentence: string; // The sentence to translate/understand
  hidden_meaning: string; // The core meaning the user should capture
}

export interface WordSessionData {
  word: string;
  phonetic: string;
  first_principle_definition: string; // The core essence
  learning_examples: LearningSentence[];
  quiz_examples: QuizSentence[];
}

export interface QuizResult {
  sentenceIndex: number;
  userAnswer: string;
  score: number; // 0-100
  feedback: string;
}

export interface EvaluationResponse {
  score: number;
  feedback: string;
}
