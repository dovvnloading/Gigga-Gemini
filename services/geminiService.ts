

import { HarmCategory, HarmBlockThreshold } from "@google/genai";
import { ModelType, GroundingMetadata, DeepResearchResult, YouTubeVideo, ChartData, CanvasState, CanvasUpdate, Message, Attachment } from "../types";
import { getAiClient } from "./apiClient";
import { getToolsForConfig, executeToolCalls, ToolConfig } from "./toolRegistry";
import { optimizeHistory } from "./historyService";
import { buildSystemInstruction } from "./contextService";
import { parseThoughtProcess } from "../utils/responseParser";

// Re-export specific items for consumers
export { generateSpeech } from "./ttsService";
export { getLiveClient } from "./apiClient";
export type { ToolConfig } from "./toolRegistry";

export const generateContentStream = async (
  model: ModelType,
  prompt: string,
  history: Message[] = [], 
  attachments: Attachment[] = [],
  _deprecatedImage: string | undefined, // Keeping sig compatible but unused
  toolConfig: ToolConfig,
  sessionSummary: string | undefined, 
  userMemory: string[] = [],
  systemInstruction: string,
  crossSessionContext: string | undefined,
  onChunk: (text: string, isFinal: boolean, thoughtProcess?: string, thinkingDuration?: number) => void
): Promise<{ 
    text?: string;
    thoughtProcess?: string; 
    thinkingDuration?: number;
    groundingMetadata?: GroundingMetadata; 
    deepResearchData?: DeepResearchResult; 
    youTubeData?: YouTubeVideo[]; 
    chartData?: ChartData; 
    canvasData?: CanvasState; 
    canvasUpdates?: CanvasUpdate[];
    image?: string;
}> => {
  const ai = getAiClient();
  
  try {
    const isImageGen = model === ModelType.IMAGE_GEN;
    let activeModel: string = model;

    // COMPATIBILITY: Google Maps forces Gemini 2.5
    if (toolConfig.useGoogleMaps) {
        activeModel = 'gemini-2.5-flash';
    }
    // Image Gen prompts usually use Pro for reasoning unless specialized
    const hasImageAttachments = attachments.some(a => a.type === 'image');
    if (hasImageAttachments && isImageGen) {
        activeModel = ModelType.PRO; 
    }

    // 1. Prepare Content Parts with History Optimization
    const MAX_HISTORY = 60;
    const historySlice = history.slice(-MAX_HISTORY);
    
    // Add current user prompt to history structure for unified processing
    const currentMsg: Message = {
        id: 'temp',
        role: 'user',
        text: prompt,
        attachments: attachments,
        timestamp: Date.now()
    };
    
    // Delegate to history service (it will handle attachment formatting)
    const contents = optimizeHistory([...historySlice, currentMsg]);

    // 2. Configure Tools & System Instructions
    const tools = getToolsForConfig(toolConfig, isImageGen);
    const config: any = {
        safetySettings: [
            { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
            { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
            { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
            { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        ]
    };

    // ENABLE THINKING PROCESS FOR GEMINI 3 MODELS
    if (activeModel.includes('gemini-3') || activeModel.includes('gemini-2.5')) {
       // Only apply thinking if NO external tools (besides builtin) are being used
       if (!toolConfig.useCanvas && !toolConfig.useDeepResearch) {
           const budget = activeModel.includes('pro') ? 2048 : 1024;
           if (!config.thinkingConfig) {
             config.thinkingConfig = { thinkingBudget: budget };
           }
       }
    }
    
    if (tools.length > 0) config.tools = tools;

    if (isImageGen) {
        config.imageConfig = { aspectRatio: "1:1" };
    } else {
        // Delegate system instruction building to context service
        config.systemInstruction = buildSystemInstruction(
            systemInstruction,
            userMemory,
            sessionSummary,
            crossSessionContext
        );
    }

    // 3. API Call (Streaming)
    const startTime = Date.now();
    let thinkingDuration = 0;
    let hasFinishedThinking = false;

    const result = await ai.models.generateContentStream({
      model: activeModel,
      contents: contents,
      config
    });

    let fullStreamText = '';
    let accumulatedText = '';
    let accumulatedThought = '';
    let groundingMetadata: GroundingMetadata | undefined;
    let toolCalls: any[] = [];

    // 4. Handle Stream
    for await (const chunk of result) {
        const text = chunk.text;
        if (text) {
            fullStreamText += text;
            
            // Delegate parsing to utility
            const parsed = parseThoughtProcess(fullStreamText);
            accumulatedText = parsed.text;
            accumulatedThought = parsed.thought;

            // Calculate thinking duration
            if (parsed.isThinking) {
                // Still thinking
                thinkingDuration = (Date.now() - startTime) / 1000;
            } else if (!hasFinishedThinking && accumulatedThought && accumulatedText) {
                // Just finished thinking (first chunk with real text)
                thinkingDuration = (Date.now() - startTime) / 1000;
                hasFinishedThinking = true;
            }

            onChunk(accumulatedText, false, accumulatedThought, thinkingDuration);
        }
        
        if (chunk.candidates?.[0]?.groundingMetadata) {
            groundingMetadata = chunk.candidates[0].groundingMetadata as GroundingMetadata;
        }

        const chunkToolCalls = chunk.functionCalls;
        if (chunkToolCalls) {
            toolCalls.push(...chunkToolCalls);
        }
    }

    // Final duration fix if stream ends without text but had thought
    if (!hasFinishedThinking && accumulatedThought) {
         thinkingDuration = (Date.now() - startTime) / 1000;
    }

    // 5. Handle Tool Execution
    if (toolCalls.length > 0) {
        const { result: functionResponses, deepResearchData, youTubeData, chartData, canvasData, canvasUpdates } = await executeToolCalls(toolCalls);

        const responseWithTool = await ai.models.generateContentStream({
             model: activeModel,
             contents: [
                 ...contents,
                 { role: 'model', parts: [{ functionCalls: toolCalls }] },
                 { 
                     role: 'tool', 
                     parts: functionResponses.map(fr => ({ functionResponse: fr }))
                 }
             ],
             config 
        });

        for await (const chunk of responseWithTool) {
             const text = chunk.text;
             if (text) {
                 accumulatedText += text;
                 onChunk(accumulatedText, false, accumulatedThought, thinkingDuration);
             }
             if (chunk.candidates?.[0]?.groundingMetadata) {
                groundingMetadata = chunk.candidates[0].groundingMetadata as GroundingMetadata;
            }
        }

        onChunk(accumulatedText, true, accumulatedThought, thinkingDuration);

        return { 
            text: accumulatedText, 
            thoughtProcess: accumulatedThought,
            thinkingDuration,
            groundingMetadata, 
            deepResearchData, 
            youTubeData, 
            chartData, 
            canvasData, 
            canvasUpdates 
        };
    }

    onChunk(accumulatedText, true, accumulatedThought, thinkingDuration);

    // Handle Image Generation Result extraction
    let generatedImage = '';
    if (isImageGen) {
        const simpleResp = await ai.models.generateContent({
            model: activeModel,
            contents: contents,
            config
        });
        const cand = simpleResp.candidates?.[0];
        if (cand?.content?.parts) {
            for (const p of cand.content.parts) {
                 if (p.inlineData) generatedImage = p.inlineData.data;
                 if (p.text && !accumulatedText) accumulatedText = p.text;
            }
        }
        return { text: accumulatedText, image: generatedImage, thoughtProcess: accumulatedThought } as any;
    }

    return { text: accumulatedText, thoughtProcess: accumulatedThought, thinkingDuration, groundingMetadata };

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
