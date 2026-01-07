
import { useState, useRef, useEffect } from 'react';
import { generatePodcastScript } from '../services/podcastService';
import { generateMultiSpeakerSpeech } from '../services/ttsService';
import { Message } from '../types';

export const usePodcast = (messages: Message[]) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [stage, setStage] = useState<'idle' | 'scripting' | 'synthesizing' | 'complete'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  
  // Refs to handle component unmounting safety
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);

  const generate = async () => {
    if (messages.length === 0) {
        setError("No conversation history to generate from.");
        return;
    }

    setIsGenerating(true);
    setError(null);
    setAudioUrl(null);
    setStage('scripting');
    
    try {
        // --- STAGE 1: SCRIPTING ---
        // Minimum visual time: 2s
        const scriptPromise = generatePodcastScript(messages);
        const scriptTimer = new Promise(resolve => setTimeout(resolve, 2500));
        
        const [script] = await Promise.all([scriptPromise, scriptTimer]);

        if (!isMountedRef.current) return;
        if (!script) throw new Error("Failed to generate conversation script.");

        // --- STAGE 2: SYNTHESIS ---
        setStage('synthesizing');
        // Minimum visual time: 3s
        const audioPromise = generateMultiSpeakerSpeech(script);
        const audioTimer = new Promise(resolve => setTimeout(resolve, 3000));
        
        const [url] = await Promise.all([audioPromise, audioTimer]);

        if (!isMountedRef.current) return;
        
        setAudioUrl(url);
        setStage('complete');

    } catch (e: any) {
        if (!isMountedRef.current) return;
        console.error(e);
        setError(e.message || "Failed to generate audio overview.");
        setStage('idle');
    } finally {
        if (isMountedRef.current) {
            setIsGenerating(false);
        }
    }
  };

  const reset = () => {
      setStage('idle');
      setError(null);
      if (audioUrl) {
          URL.revokeObjectURL(audioUrl);
          setAudioUrl(null);
      }
  };

  return {
    isGenerating,
    stage,
    error,
    audioUrl,
    generate,
    reset
  };
};
