import React, { useEffect, useRef } from 'react';
import { ChatSession } from '../types';
import { extractUserFacts, summarizeHistory } from '../services/memoryService';

export const useChatMemory = (
  currentSession: ChatSession | undefined,
  userMemory: string[],
  setUserMemory: (memory: string[]) => void,
  setSessions: React.Dispatch<React.SetStateAction<ChatSession[]>>,
  isGenerating: boolean
) => {
  // Memory Management Constants
  const SUMMARIZATION_THRESHOLD = 20; 
  const MEMORY_EXTRACTION_THRESHOLD = 3; 
  const processingRef = useRef(false);

  useEffect(() => {
    const runBackgroundTasks = async () => {
        if (!currentSession || processingRef.current) return;
        
        const msgCount = currentSession.messages.length;
        if (msgCount === 0) return;

        processingRef.current = true;
        
        try {
            // Task A: Update User Profile (Facts)
            if (msgCount % MEMORY_EXTRACTION_THRESHOLD === 0) {
                 const recentUserMsgs = currentSession.messages.slice(-MEMORY_EXTRACTION_THRESHOLD * 2); 
                 const updatedFacts = await extractUserFacts(recentUserMsgs, userMemory);
                 
                 if (JSON.stringify(updatedFacts) !== JSON.stringify(userMemory)) {
                    setUserMemory(updatedFacts);
                 }
            }

            // Task B: Episodic Summary
            if (msgCount > 0 && msgCount % SUMMARIZATION_THRESHOLD === 0) {
                const historyChunk = currentSession.messages.slice(-SUMMARIZATION_THRESHOLD);
                const newSummary = await summarizeHistory(historyChunk, currentSession.summary);
                
                setSessions(prev => prev.map(s => {
                    if (s.id === currentSession.id) {
                        return { ...s, summary: newSummary };
                    }
                    return s;
                }));
            }
        } catch (e) {
            console.error("Background memory tasks failed", e);
        } finally {
            processingRef.current = false;
        }
    };
    
    if (!isGenerating) {
        runBackgroundTasks();
    }
  }, [currentSession?.messages.length, isGenerating, currentSession?.id, userMemory, setSessions, setUserMemory]);
};