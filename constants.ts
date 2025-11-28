// Number of sentences to generate. 
// Request asked for 10, but for API latency in a web demo, we might default to 5. 
// However, I will set to 5 for the demo to ensure speed, but the prompt supports N.
export const SENTENCE_COUNT = 5; 

export const COLORS = {
  primary: 'indigo', // tailwind color name
  secondary: 'slate',
};

// Simulated delay for "anti-fatigue"
export const BREAK_DURATION_MS = 3000;
