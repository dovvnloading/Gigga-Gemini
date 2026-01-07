
import { ModelType } from "./types";

export const DEFAULT_MODEL = ModelType.FLASH;
export const DEFAULT_USER_AVATAR = "";

export const DEFAULT_SYSTEM_INSTRUCTION = "You are Gemini, a helpful and capable AI assistant by Google. Respond using Markdown. When using tools, integrate the data naturally.";

export const MODEL_LABELS: Record<ModelType, string> = {
  [ModelType.FLASH]: 'Fast',
  [ModelType.PRO]: 'Pro',
  [ModelType.IMAGE_GEN]: 'Flash Image',
  [ModelType.LIVE]: 'Live'
};

export const MODEL_DESCRIPTIONS: Record<ModelType, string> = {
  [ModelType.FLASH]: 'Answers quickly',
  [ModelType.PRO]: 'Thinks longer for advanced math & code',
  [ModelType.IMAGE_GEN]: 'Standard image generation',
  [ModelType.LIVE]: 'Real-time conversational voice mode'
};