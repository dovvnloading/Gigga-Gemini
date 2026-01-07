import { useState } from 'react';
import { generateSpeech } from '../services/ttsService';

export const useAudio = (voiceURI: string = 'Kore') => {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const playMessage = async (text: string) => {
    // Cleanup previous
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setError(null);
    setIsLoading(true);

    try {
      const url = await generateSpeech(text, voiceURI);
      setAudioUrl(url);
    } catch (err) {
      console.error("TTS Error:", err);
      setError("Failed to generate speech.");
    } finally {
      setIsLoading(false);
    }
  };

  const playUrl = (url: string) => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      setAudioUrl(url);
      setIsLoading(false);
      setError(null);
  };

  const closePlayer = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setIsLoading(false);
  };

  return { audioUrl, isLoading, error, playMessage, playUrl, closePlayer };
};