import { useState, useEffect, useCallback } from 'react';

export const useSpeech = (
  onResult: (text: string) => void, 
  onError?: (error: string) => void
) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      setIsSupported(true);
    }
  }, []);

  const toggleListening = useCallback(() => {
    if (!isSupported) {
      onError?.("Speech recognition is not supported in this browser.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => setIsListening(true);
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        onResult(transcript);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
        
        // Map specific error codes to user-friendly messages
        if (event.error === 'not-allowed') {
          onError?.("Microphone access denied. Please check your browser settings.");
        } else if (event.error === 'no-speech') {
          // Ignore no-speech, just stop listening
        } else if (event.error === 'network') {
          onError?.("Network error. Please check your internet connection.");
        } else {
          onError?.(`Speech recognition error: ${event.error}`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (e) {
      console.error(e);
      onError?.("Failed to start speech recognition.");
      setIsListening(false);
    }
  }, [isListening, isSupported, onResult, onError]);

  return { isListening, toggleListening, isSupported };
};