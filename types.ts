

export interface Attachment {
  id: string;
  type: 'image' | 'file'; // 'image' encompasses multimodal types (Images, PDFs), 'file' is raw text/code
  mimeType: string;
  name: string;
  content: string; // Data URI for images, raw text for code/docs
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text?: string;
  thoughtProcess?: string; // Chain of thought content
  thinkingDuration?: number; // How long it took to think (in seconds)
  image?: string; // @deprecated: kept for backward compatibility
  attachments?: Attachment[];
  isLoading?: boolean;
  timestamp: number;
  groundingMetadata?: GroundingMetadata;
  toolCalls?: ToolCall[];
  deepResearchData?: DeepResearchResult;
  youTubeData?: YouTubeVideo[];
  chartData?: ChartData;
  relatedCanvasContent?: CanvasState; // Suggestion to open/rewrite content in canvas
  canvasUpdates?: CanvasUpdate[]; // Partial updates to existing canvas
}

export interface CanvasState {
  isOpen: boolean;
  content: string;
  language: string; // 'markdown', 'python', 'javascript', etc.
  title: string;
  mode: 'code' | 'document';
}

export interface CanvasUpdate {
  type: 'replace';
  search: string;
  replacement: string;
}

export interface ToolCall {
  name: string;
  args: any;
}

export interface DeepResearchResult {
  topic: string;
  depth: number;
  total_sources: number;
  execution_time: string;
  steps: Array<{
    id: number;
    action: string;
    description: string;
    status: 'completed' | 'pending';
    icon: 'search' | 'read' | 'analyze' | 'write';
  }>;
  sources: Array<{
    title: string;
    url: string;
    type: 'pdf' | 'web' | 'academic';
    relevance: number; // 0-100
  }>;
}

export interface YouTubeVideo {
  id: string;
  title: string;
  channel: string;
  views: string;
  thumbnail: string;
  duration: string;
  link: string;
}

export interface ChartData {
  type: 'bar' | 'area' | 'pie';
  title: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  data: {
    label: string;
    value: number;
    value2?: number; // For multi-series
  }[];
  seriesKeys: string[]; // Names of the datasets
  summary?: string;
}

export interface GroundingMetadata {
  searchEntryPoint?: {
    renderedContent?: string;
  };
  groundingChunks?: Array<{
    web?: {
      uri?: string;
      title?: string;
    };
    maps?: {
      sourceConfig?: {
        markerId?: string;
      };
      title?: string;
      uri?: string;
      placeId?: string;
      address?: string;
    };
  }>;
}

export enum ModelType {
  FLASH = 'gemini-3-flash-preview',
  PRO = 'gemini-3-pro-preview',
  IMAGE_GEN = 'gemini-2.5-flash-image',
  LIVE = 'gemini-2.5-flash-native-audio-preview-09-2025'
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  model: ModelType;
  lastModified: number;
  summary?: string; // Episodic memory (what happened in this chat)
}

export interface GlobalMemory {
  userFacts: string[]; // Semantic memory (facts about the user across all chats)
  lastUpdated: number;
}

export interface LiveConnectionState {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  volume: number;
}

export interface GeminiBackup {
  version: number;
  exportDate: number;
  sessions: ChatSession[];
  userMemory: string[];
  appSettings?: {
    userAvatar?: string;
    systemInstruction?: string;
  };
}