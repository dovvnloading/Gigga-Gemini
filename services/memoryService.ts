
import { Message } from "../types";
import { getAiClient } from "./apiClient";

/**
 * Generates a short, simple title for a chat session based on the first message.
 */
export const generateChatTitle = async (firstMessage: string): Promise<string> => {
  const ai = getAiClient();
  const prompt = `Generate a conversation title based on this user message.
RULES:
1. Maximum 4 words.
2. Use simplistic, rudimentary vocabulary.
3. Do NOT use quotes.
4. Do NOT include words like "Title:" or "Subject:".

User message: "${firstMessage.substring(0, 500)}"`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-flash-lite-latest',
      contents: { parts: [{ text: prompt }] },
      config: {
        maxOutputTokens: 20,
        temperature: 0.5,
      }
    });
    return response.text?.trim() || "";
  } catch (e) {
    console.warn("Failed to generate auto-title", e);
    return "";
  }
};

/**
 * SOTA Semantic Memory:
 * Extracts persistent facts about the user from the conversation.
 */
export const extractUserFacts = async (newMessages: Message[], currentFacts: string[]): Promise<string[]> => {
  if (newMessages.length === 0) return currentFacts;
  
  const ai = getAiClient();
  const conversationText = newMessages
    .filter(m => m.role === 'user') // Focus on what the user said
    .map(m => `User: ${m.text}`)
    .join('\n');
  
  if (conversationText.length < 50) return currentFacts; // Skip short interactions

  const prompt = `You are a Memory Manager AI.
Your goal is to extract permanent facts about the user from the recent conversation to build a long-term user profile.

CURRENT KNOWN FACTS:
${currentFacts.length > 0 ? currentFacts.map(f => `- ${f}`).join('\n') : "None"}

RECENT USER MESSAGES:
${conversationText}

INSTRUCTIONS:
1. Identify NEW facts about the user (e.g., name, profession, location, specific preferences, tech stack, pets).
2. Ignore casual conversation, questions, or temporary context.
3. If a new fact conflicts with an old one (e.g., "I moved to NY" vs "I live in SF"), output the UPDATE.
4. Return a JSON array of strings containing the final consolidated list of facts. 
5. If no new facts are found, return the CURRENT KNOWN FACTS list exactly as is.

OUTPUT FORMAT: JSON Array of strings only.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-flash-lite-latest', // Fast and cheap
      contents: { parts: [{ text: prompt }] },
      config: { responseMimeType: "application/json" }
    });

    const rawText = response.text || "[]";
    const newFacts = JSON.parse(rawText);
    return Array.isArray(newFacts) ? newFacts : currentFacts;
  } catch (e) {
    console.warn("Failed to extract user memory", e);
    return currentFacts;
  }
};

/**
 * SOTA Context Management:
 * Summarizes very old history (Episodic Memory) while keeping a large immediate context window.
 */
export const summarizeHistory = async (messages: Message[], existingSummary?: string): Promise<string> => {
  if (messages.length === 0) return existingSummary || "";
  
  const ai = getAiClient();
  const conversationText = messages.map(m => `${m.role}: ${m.text}`).join('\n');
  
  const prompt = `You are an expert context manager.

PREVIOUS SUMMARY:
${existingSummary || "None"}

NEW CONTENT TO ARCHIVE:
${conversationText}

TASK:
Update the summary to include the new content. Keep it dense and concise. 
Preserve technical details and user requirements.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts: [{ text: prompt }] }
    });
    return response.text || existingSummary || "";
  } catch (e) {
    console.warn("Failed to summarize history", e);
    return existingSummary || "";
  }
};
