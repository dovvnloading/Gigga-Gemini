
import React, { useState } from 'react';
import { ChatSession, Message, ModelType, Attachment } from '../types';
import { generateContentStream, ToolConfig } from '../services/geminiService';
import { runDeepResearchAgent } from '../services/researchAgent';

export const useChatStream = (
  setSessions: React.Dispatch<React.SetStateAction<ChatSession[]>>,
  currentSessionId: string | null,
  userMemory: string[]
) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const executeGeneration = async (
    userText: string,
    attachments: Attachment[] = [],
    historyMessages: Message[],
    model: ModelType,
    toolConfig: ToolConfig,
    systemInstruction: string,
    crossSessionContext: string | undefined,
    aiMessageId: string,
    activeSummary: string | undefined
  ) => {
     try {
        setIsGenerating(true);

        // --- SOTA DEEP RESEARCH BRANCH ---
        if (toolConfig.useDeepResearch) {
            
            // 1. Initial State for Research
            if (currentSessionId) {
                setSessions(prev => prev.map(s => {
                    if (s.id === currentSessionId) {
                        const newMessages = s.messages.map(m => {
                            if (m.id === aiMessageId) {
                                return {
                                    ...m,
                                    isLoading: true,
                                    text: "Initializing Deep Research Agent...",
                                    thoughtProcess: "Decomposing query into search vectors..."
                                };
                            }
                            return m;
                        });
                        return { ...s, messages: newMessages };
                    }
                    return s;
                }));
            }

            // 2. Run the Agent
            const { text, data, reportMarkdown } = await runDeepResearchAgent(userText, (partialData) => {
                // Live update of the UI visualization
                if (currentSessionId) {
                    setSessions(prev => prev.map(s => {
                        if (s.id === currentSessionId) {
                            const newMessages = s.messages.map(m => {
                                if (m.id === aiMessageId) {
                                    return {
                                        ...m,
                                        deepResearchData: partialData,
                                        // Show current active step in text preview if needed, or keep loading state
                                        text: partialData.steps.find(s => s.status === 'pending')?.description || "Synthesizing..."
                                    };
                                }
                                return m;
                            });
                            return { ...s, messages: newMessages };
                        }
                        return s;
                    }));
                }
            });

            // 3. Finalize
            if (currentSessionId) {
                setSessions(prev => prev.map(s => {
                    if (s.id === currentSessionId) {
                        const newMessages = s.messages.map(m => {
                            if (m.id === aiMessageId) {
                                return {
                                    ...m,
                                    isLoading: false,
                                    text: text,
                                    deepResearchData: data,
                                    thoughtProcess: "Research Complete. Sources verified.",
                                    relatedCanvasContent: reportMarkdown ? {
                                        isOpen: true,
                                        title: `Research: ${data.topic}`,
                                        language: 'markdown',
                                        content: reportMarkdown,
                                        mode: 'document'
                                    } : undefined
                                };
                            }
                            return m;
                        });
                        return { ...s, messages: newMessages };
                    }
                    return s;
                }));
            }
            
            return; // Exit, handled by agent
        }

        // --- STANDARD CHAT BRANCH ---
        const response = await generateContentStream(
            model,
            userText,
            historyMessages, 
            attachments,
            undefined, // Deprecated image field
            toolConfig,
            activeSummary,
            userMemory,
            systemInstruction,
            crossSessionContext,
            (partialText, isFinal, thoughtProcess, thinkingDuration) => {
                // Real-time State Update
                if (!currentSessionId) return;
                
                setSessions(prev => prev.map(s => {
                    if (s.id === currentSessionId) {
                        const newMessages = s.messages.map(m => {
                            if (m.id === aiMessageId) {
                                return {
                                    ...m,
                                    isLoading: false,
                                    text: partialText,
                                    thoughtProcess: thoughtProcess,
                                    thinkingDuration: thinkingDuration
                                };
                            }
                            return m;
                        });
                        return { ...s, messages: newMessages };
                    }
                    return s;
                }));
            }
        );

        // Final Update with rich metadata
        if (!currentSessionId) return;

        setSessions(prev => prev.map(s => {
            if (s.id === currentSessionId) {
                const newMessages = s.messages.map(m => {
                    if (m.id === aiMessageId) {
                        return {
                            ...m,
                            isLoading: false,
                            text: response.text, 
                            thoughtProcess: response.thoughtProcess,
                            thinkingDuration: response.thinkingDuration,
                            image: (response as any).image ? `data:image/png;base64,${(response as any).image}` : undefined,
                            groundingMetadata: response.groundingMetadata,
                            deepResearchData: response.deepResearchData, 
                            youTubeData: response.youTubeData,
                            chartData: response.chartData,
                            relatedCanvasContent: response.canvasData,
                            canvasUpdates: response.canvasUpdates
                        };
                    }
                    return m;
                });
                return { ...s, messages: newMessages };
            }
            return s;
        }));

    } catch (error) {
        if (!currentSessionId) return;
        
        setSessions(prev => prev.map(s => {
            if (s.id === currentSessionId) {
                 const newMessages = s.messages.map(m => {
                    if (m.id === aiMessageId) {
                        return { ...m, isLoading: false, text: "I encountered an error. Please try again." };
                    }
                    return m;
                });
                return { ...s, messages: newMessages };
            }
            return s;
        }));
    } finally {
        setIsGenerating(false);
    }
  };

  return { isGenerating, executeGeneration };
};