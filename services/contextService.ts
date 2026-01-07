
/**
 * Builds the final system instruction string by injecting various context layers.
 */
export const buildSystemInstruction = (
  baseInstruction: string,
  userMemory: string[] = [],
  sessionSummary: string | undefined,
  crossSessionContext: string | undefined
): string => {
  let finalInstructions = baseInstruction;

  // --- Context Injection Layer ---
  
  // 1. Semantic Memory (User Facts)
  if (userMemory.length > 0) {
      finalInstructions += `\n\n### USER PROFILE (Persistent Memory)\n${userMemory.map(f => `- ${f}`).join('\n')}`;
  }

  // 2. Episodic Memory (Current Session Summary)
  if (sessionSummary) {
      finalInstructions += `\n\n### PREVIOUS CONVERSATION SUMMARY (This Chat)\n${sessionSummary}`;
  }

  // 3. Cross-Session Context (RAG/Similar Chats)
  if (crossSessionContext) {
      finalInstructions += `\n\n### ARCHIVED MEMORY (Context from OTHER chats)\nWARNING: This information is from DIFFERENT historical conversations. Use this ONLY if the user explicitly refers to past projects, "other chats", or if the context is strictly relevant to the current request.\n\n${crossSessionContext}`;
  }
  
  return finalInstructions;
};
