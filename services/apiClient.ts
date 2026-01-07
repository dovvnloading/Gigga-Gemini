import { GoogleGenAI } from "@google/genai";

export const getAiClient = () => {
  let apiKey = localStorage.getItem('gemini_api_key');
  
  if (!apiKey) {
      try {
          // Safely attempt to access process.env.API_KEY
          // In some browser environments without a bundler, accessing 'process' can throw errors
          if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
              apiKey = process.env.API_KEY;
          }
      } catch (e) {
          // Ignore error if process is undefined
      }
  }
  
  if (!apiKey) {
    throw new Error("API Key is missing. Please set it in Settings.");
  }
  return new GoogleGenAI({ apiKey });
};

export const getLiveClient = () => {
  return getAiClient();
};