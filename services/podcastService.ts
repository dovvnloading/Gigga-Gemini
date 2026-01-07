
import { getAiClient } from "./apiClient";
import { generateMultiSpeakerSpeech } from "./ttsService";
import { Message } from "../types";

export const generatePodcastScript = async (messages: Message[]): Promise<string> => {
  const ai = getAiClient();
  
  if (messages.length === 0) return "";

  // 1. Prepare Context (Filter noise, format for clarity)
  const conversationContext = messages
    .filter(m => !m.isLoading && m.text && !m.text.startsWith('Error'))
    .map(m => `[${m.role === 'model' ? 'Gemini' : 'User'}]: ${m.text}`)
    .join('\n\n');

  // 2. SOTA Prompt Engineering for "Deep Dive" Audio Overview
  const prompt = `
You are the Executive Producer of "The Deep Dive", a high-fidelity audio series.
Your goal is to transform the provided chat history into a dynamic, engaging, and natural podcast script between two hosts.

**THE HOSTS:**
1. **Kore** (Voice: Warm, curious, grounding): The anchor. She sets the stage, asks the questions the listener is thinking, and uses analogies to simplify concepts.
2. **Fenrir** (Voice: Energetic, fast, technical): The analyst. He loves the data, the code, and the details. He speaks with conviction and speed.

**PRODUCTION GUIDELINES (CRITICAL):**
- **NO ROBOTIC INTROS**: Do NOT say "Welcome to the podcast". Start *in media res* (in the middle of a thought) or with a strong hook. 
  - *Bad*: "Hello listeners, today we are discussing..."
  - *Good*: "So, I was looking at this code you generated, and honestly? It's kind of wild."
- **NATURAL FLOW**: Use contractions ("can't", "it's"), fillers ("like", "you know"), and interjections ("Wait-", "Hold on", "Exactly!").
- **THE NARRATIVE ARC**:
  1. **The Hook**: Grab attention immediately.
  2. **The Context**: Briefly explain what the user was trying to do.
  3. **The Deep Dive**: Explore the core solution or insight provided by Gemini.
  4. **The Outro**: A quick, punchy sign-off.
- **FORMAT**: STRICTLY use "Kore: " and "Fenrir: " prefixes. Do not use stage directions (e.g. *laughs*).
- **LENGTH**: Aim for 300-400 words.

**SOURCE MATERIAL:**
${conversationContext.substring(0, 25000)}

**TASK:**
Generate the script now. Return ONLY the script text.
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview', // Using Pro for superior creative writing and reasoning
      contents: { parts: [{ text: prompt }] },
      config: {
        temperature: 0.8, // High temperature for varied, natural speech patterns
        topP: 0.95,
        topK: 40,
        thinkingConfig: { thinkingBudget: 2048 } // Allow model to plan the narrative arc
      }
    });

    let script = response.text || "";
    // Post-process to ensure clean input for TTS
    // Remove bolding, markdown blocks, and potential stage directions in parens if any slipped through
    script = script.replace(/\*\*/g, '')
                   .replace(/```/g, '')
                   .replace(/^\s*[\r\n]/gm, '')
                   .replace(/\[.*?\]/g, ''); 
    return script;
  } catch (error) {
    console.error("Podcast Script Gen Error:", error);
    throw error;
  }
};

export const createPodcast = async (messages: Message[]): Promise<string> => {
    // 1. Generate Script
    const script = await generatePodcastScript(messages);
    if (!script) throw new Error("Failed to generate script");

    // 2. Synthesize Audio
    const audioUrl = await generateMultiSpeakerSpeech(script);
    return audioUrl;
};
