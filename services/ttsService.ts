
import { Modality } from "@google/genai";
import { getAiClient } from "./apiClient";

export const generateSpeech = async (text: string, voiceName: string = 'Kore'): Promise<string> => {
  const ai = getAiClient();
  
  if (!text || !text.trim()) {
    throw new Error("Text is empty");
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-preview-tts',
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName }
          }
        }
      }
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) throw new Error("No audio generated");

    const binaryString = atob(base64Audio);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    return createWavUrlFromPcm(bytes, 24000);
  } catch (error) {
    console.error("TTS Error:", error);
    throw error;
  }
};

export const generateMultiSpeakerSpeech = async (script: string): Promise<string> => {
  const ai = getAiClient();
  
  if (!script || !script.trim()) throw new Error("Script is empty");

  // The model works best when clearly instructed about the role-play format
  const prompt = `
Generate a multi-speaker audio conversation based on the following script.
The script uses "Kore:" and "Fenrir:" to denote speakers.
Ensure the tone matches the personas: Kore is calm and guiding, Fenrir is energetic and fast.

SCRIPT:
${script}
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-preview-tts',
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
            multiSpeakerVoiceConfig: {
                speakerVoiceConfigs: [
                    {
                        speaker: 'Kore',
                        voiceConfig: {
                            prebuiltVoiceConfig: { voiceName: 'Kore' }
                        }
                    },
                    {
                        speaker: 'Fenrir',
                        voiceConfig: {
                            prebuiltVoiceConfig: { voiceName: 'Fenrir' }
                        }
                    }
                ]
            }
        }
      }
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) throw new Error("No audio generated");

    const binaryString = atob(base64Audio);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Multi-speaker typically returns 24kHz as well
    return createWavUrlFromPcm(bytes, 24000);
  } catch (error) {
    console.error("Multi-Speaker TTS Error:", error);
    throw error;
  }
};

function createWavUrlFromPcm(samples: Uint8Array, sampleRate: number): string {
    const buffer = new ArrayBuffer(44 + samples.length);
    const view = new DataView(buffer);

    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + samples.length, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(view, 36, 'data');
    view.setUint32(40, samples.length, true);

    const dataView = new Uint8Array(buffer, 44);
    dataView.set(samples);

    const blob = new Blob([buffer], { type: 'audio/wav' });
    return URL.createObjectURL(blob);
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}
