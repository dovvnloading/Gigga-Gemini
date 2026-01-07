import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Modality, LiveServerMessage } from '@google/genai';
import { getLiveClient } from '../services/apiClient';
import { createPcmBlob, decodeAudioData, base64ToUint8Array } from '../utils/audioUtils';

export interface UseLiveSessionReturn {
  isConnected: boolean;
  status: string;
  volume: number;
  isMicOn: boolean;
  isCameraOn: boolean;
  isScreenShareOn: boolean;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  toggleMic: () => void;
  toggleCamera: () => void;
  toggleScreenShare: () => void;
  disconnect: () => void;
}

export const useLiveSession = (
  onClose: () => void, 
  onError?: (message: string) => void
): UseLiveSessionReturn => {
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isScreenShareOn, setIsScreenShareOn] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [status, setStatus] = useState("Connecting...");
  const [audioVolume, setAudioVolume] = useState(0);

  // Refs for audio processing and state access in callbacks
  const audioContextRef = useRef<AudioContext | null>(null);
  const inputStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const sessionRef = useRef<any>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const isMicOnRef = useRef(isMicOn);
  
  // Video Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(document.createElement('canvas'));
  const frameIntervalRef = useRef<number | null>(null);
  const activeVideoTrackRef = useRef<MediaStreamTrack | null>(null);

  // Sync refs with state for use in callbacks
  useEffect(() => {
    isMicOnRef.current = isMicOn;
  }, [isMicOn]);

  // Video Streaming Logic (1 FPS)
  useEffect(() => {
      const isVideoActive = isConnected && (isCameraOn || isScreenShareOn);
      
      if (isVideoActive) {
          const sendFrame = () => {
              if (!videoRef.current || !sessionRef.current) return;
              
              const video = videoRef.current;
              const canvas = canvasRef.current;
              const ctx = canvas.getContext('2d');
              
              if (video.videoWidth > 0 && video.videoHeight > 0 && ctx) {
                  canvas.width = video.videoWidth * 0.5; // Scale down for performance
                  canvas.height = video.videoHeight * 0.5;
                  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                  
                  const base64 = canvas.toDataURL('image/jpeg', 0.6).split(',')[1];
                  
                  sessionRef.current.then((session: any) => {
                       session.sendRealtimeInput({ 
                           media: { 
                               mimeType: 'image/jpeg', 
                               data: base64 
                           } 
                       });
                  });
              }
          };

          frameIntervalRef.current = window.setInterval(sendFrame, 1000); // 1 FPS
      } else {
          if (frameIntervalRef.current) clearInterval(frameIntervalRef.current);
      }

      return () => {
          if (frameIntervalRef.current) clearInterval(frameIntervalRef.current);
      };
  }, [isConnected, isCameraOn, isScreenShareOn]);


  useEffect(() => {
    let isMounted = true;

    const cleanup = () => {
      isMounted = false;
      if (frameIntervalRef.current) clearInterval(frameIntervalRef.current);
      
      if (inputStreamRef.current) {
        inputStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (activeVideoTrackRef.current) {
          activeVideoTrackRef.current.stop();
      }
      if (processorRef.current && sourceRef.current) {
         sourceRef.current.disconnect();
         processorRef.current.disconnect();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      sourcesRef.current.forEach(s => s.stop());
      sourcesRef.current.clear();
    };

    const startSession = async () => {
      try {
        const ai = getLiveClient();
        
        // Setup Audio Contexts
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const inputCtx = new AudioContextClass({ sampleRate: 16000 });
        const outputCtx = new AudioContextClass({ sampleRate: 24000 });
        
        // IMPORTANT: Resume context if suspended (common browser policy)
        if (outputCtx.state === 'suspended') {
            await outputCtx.resume();
        }
        
        audioContextRef.current = outputCtx;

        // Get User Media (Audio Only initially)
        let stream;
        try {
          stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        } catch(err) {
             if (isMounted) {
                onError?.("Microphone access denied.");
                onClose();
             }
             return;
        }
        
        if (!isMounted) return;
        inputStreamRef.current = stream;

        // Live Connect
        const sessionPromise = ai.live.connect({
          model: 'gemini-2.5-flash-native-audio-preview-09-2025',
          config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
              voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
            },
            systemInstruction: "You are Gemini Live. You can see and hear the user. Be helpful and conversational.",
          },
          callbacks: {
            onopen: () => {
              if (!isMounted) return;
              setIsConnected(true);
              setStatus("Listening");

              const source = inputCtx.createMediaStreamSource(stream);
              const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
              
              scriptProcessor.onaudioprocess = (e) => {
                 if (!isMounted) return;
                 
                 const inputData = e.inputBuffer.getChannelData(0);
                 
                 // RMS calculation for visualizer
                 let sum = 0;
                 for(let i = 0; i < inputData.length; i++) sum += inputData[i] * inputData[i];
                 const rms = Math.sqrt(sum / inputData.length);
                 setAudioVolume(rms);

                 // Check Ref for current mic state
                 if (!isMicOnRef.current) return; 

                 const pcmBlob = createPcmBlob(inputData);
                 sessionPromise.then(session => {
                    session.sendRealtimeInput({ media: pcmBlob });
                 });
              };

              source.connect(scriptProcessor);
              scriptProcessor.connect(inputCtx.destination);
              
              processorRef.current = scriptProcessor;
              sourceRef.current = source;
            },
            onmessage: async (message: LiveServerMessage) => {
               if (!isMounted) return;
               
               const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
               if (base64Audio) {
                 const ctx = audioContextRef.current;
                 if (!ctx) return;
                 
                 if (ctx.state === 'suspended') await ctx.resume();

                 nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
                 
                 const audioBuffer = await decodeAudioData(
                   base64ToUint8Array(base64Audio),
                   ctx,
                   24000
                 );

                 const source = ctx.createBufferSource();
                 source.buffer = audioBuffer;
                 source.connect(ctx.destination);
                 
                 source.addEventListener('ended', () => {
                   sourcesRef.current.delete(source);
                 });

                 source.start(nextStartTimeRef.current);
                 nextStartTimeRef.current += audioBuffer.duration;
                 sourcesRef.current.add(source);
               }

               if (message.serverContent?.interrupted) {
                 sourcesRef.current.forEach(s => s.stop());
                 sourcesRef.current.clear();
                 nextStartTimeRef.current = 0;
               }
            },
            onclose: () => {
               if (isMounted) {
                   setStatus("Disconnected");
                   setIsConnected(false);
               }
            },
            onerror: (e) => {
               console.error(e);
               if (isMounted) setStatus("Error connecting");
            }
          }
        });
        
        sessionRef.current = await sessionPromise;

      } catch (err) {
        console.error("Live Session Error:", err);
        if (isMounted) setStatus("Failed to connect");
      }
    };

    startSession();

    return cleanup;
  }, [onClose, onError]);

  const toggleMic = useCallback(() => {
     setIsMicOn(prev => !prev);
  }, []);

  const toggleCamera = useCallback(async () => {
      // If Screen Share is on, turn it off first
      if (isScreenShareOn) {
          setIsScreenShareOn(false);
          if (activeVideoTrackRef.current) {
              activeVideoTrackRef.current.stop();
              activeVideoTrackRef.current = null;
          }
      }

      if (!isCameraOn) {
          try {
              const stream = await navigator.mediaDevices.getUserMedia({ video: true });
              const track = stream.getVideoTracks()[0];
              activeVideoTrackRef.current = track;
              
              if (videoRef.current) {
                  videoRef.current.srcObject = new MediaStream([track]);
                  videoRef.current.play().catch(() => {});
              }
              setIsCameraOn(true);
          } catch (e) {
              console.error("Failed to start camera", e);
          }
      } else {
          if (activeVideoTrackRef.current) {
              activeVideoTrackRef.current.stop();
              activeVideoTrackRef.current = null;
          }
          if (videoRef.current) {
              videoRef.current.srcObject = null;
          }
          setIsCameraOn(false);
      }
  }, [isCameraOn, isScreenShareOn]);
  
  const toggleScreenShare = useCallback(async () => {
      // If Camera is on, turn it off first
      if (isCameraOn) {
          setIsCameraOn(false);
          if (activeVideoTrackRef.current) {
              activeVideoTrackRef.current.stop();
              activeVideoTrackRef.current = null;
          }
      }

      if (!isScreenShareOn) {
          try {
              const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
              const track = stream.getVideoTracks()[0];
              activeVideoTrackRef.current = track;
              
              // Handle user stopping screen share from browser UI
              track.onended = () => {
                   setIsScreenShareOn(false);
                   activeVideoTrackRef.current = null;
                   if (videoRef.current) videoRef.current.srcObject = null;
              };

              if (videoRef.current) {
                  videoRef.current.srcObject = new MediaStream([track]);
                  videoRef.current.play().catch(() => {});
              }
              setIsScreenShareOn(true);
          } catch (e) {
              console.error("Failed to start screen share", e);
          }
      } else {
          if (activeVideoTrackRef.current) {
              activeVideoTrackRef.current.stop();
              activeVideoTrackRef.current = null;
          }
          if (videoRef.current) {
              videoRef.current.srcObject = null;
          }
          setIsScreenShareOn(false);
      }
  }, [isScreenShareOn, isCameraOn]);

  const disconnect = useCallback(() => {
      onClose();
  }, [onClose]);

  return { 
      isConnected, 
      status, 
      volume: audioVolume, 
      isMicOn, 
      isCameraOn,
      isScreenShareOn, 
      videoRef,
      toggleMic, 
      toggleCamera,
      toggleScreenShare,
      disconnect 
  };
};