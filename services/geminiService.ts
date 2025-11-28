import { GoogleGenAI, Type, Schema } from "@google/genai";
import { EvaluationResponse, WordSessionData } from "../types";
import { SENTENCE_COUNT } from "../constants";

const apiKey = process.env.API_KEY;

// Initialize GenAI
const ai = new GoogleGenAI({ apiKey: apiKey });

const wordSessionSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    word: { type: Type.STRING, description: "The vocabulary word being taught." },
    phonetic: { type: Type.STRING, description: "IPA phonetic transcription." },
    first_principle_definition: { 
      type: Type.STRING, 
      description: "A deep, first-principles definition explaining the core essence of the word in one sentence (Chinese)." 
    },
    learning_examples: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          english: { type: Type.STRING },
          chinese: { type: Type.STRING },
          context_description: { type: Type.STRING, description: "Short tag describing the scenario (e.g. Business, Daily Life)." }
        },
        required: ["english", "chinese", "context_description"]
      }
    },
    quiz_examples: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          sentence: { type: Type.STRING, description: "An English sentence containing the word." },
          hidden_meaning: { type: Type.STRING, description: "The translation or meaning the user needs to provide in Chinese." }
        },
        required: ["sentence", "hidden_meaning"]
      }
    }
  },
  required: ["word", "phonetic", "first_principle_definition", "learning_examples", "quiz_examples"]
};

const evaluationSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    score: { type: Type.NUMBER, description: "A score from 0 to 100 based on accuracy." },
    feedback: { type: Type.STRING, description: "Constructive feedback in Chinese explaining why the translation was good or bad." }
  },
  required: ["score", "feedback"]
};

export const generateWordSession = async (specificWord?: string): Promise<WordSessionData> => {
  const model = "gemini-2.5-flash";
  
  const prompt = specificWord 
    ? `Create a study session for the word: "${specificWord}".`
    : `Pick a sophisticated, high-frequency academic or business English word (GRE/TOEFL level). Create a study session.`;

  const instruction = `
    You are an expert language tutor.
    1. Define the word using "First Principles" thinking: explain its fundamental essence simply in Chinese.
    2. Provide ${SENTENCE_COUNT} distinct learning sentences in varied contexts (Business, Art, Science, Emotion, etc.).
    3. Provide ${SENTENCE_COUNT} NEW sentences for a quiz. These should be different from the learning sentences.
    4. Ensure the output matches the JSON schema strictly.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      systemInstruction: instruction,
      responseMimeType: "application/json",
      responseSchema: wordSessionSchema,
      temperature: 0.7,
    }
  });

  const text = response.text;
  if (!text) throw new Error("No response from AI");
  
  return JSON.parse(text) as WordSessionData;
};

export const evaluateUserAnswer = async (
  originalSentence: string, 
  targetMeaning: string, 
  userAnswer: string
): Promise<EvaluationResponse> => {
  const model = "gemini-2.5-flash";

  const prompt = `
    Target Sentence: "${originalSentence}"
    Core Meaning (Hidden): "${targetMeaning}"
    User Translation/Interpretation: "${userAnswer}"
    
    Evaluate if the user understood the sentence and the specific word usage.
    Give a score (0-100). 100 is perfect meaning capture. >60 is acceptable.
    Give short, encouraging feedback in Chinese.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: evaluationSchema,
    }
  });

  const text = response.text;
  if (!text) throw new Error("No evaluation generated");

  return JSON.parse(text) as EvaluationResponse;
};
