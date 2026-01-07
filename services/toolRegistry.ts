import { FunctionDeclaration, Type } from "@google/genai";
import { DeepResearchResult, YouTubeVideo, ChartData, CanvasState, CanvasUpdate } from "../types";
import { 
    executeCanvas, 
    executeEditCanvas, 
    executeWeatherTool, 
    executeStockTool, 
    executeDeepResearch, 
    executeYouTubeTool, 
    executeVisualization 
} from "./toolImplementations";

// --- Types ---

export interface ToolConfig {
  useGoogleSearch: boolean;
  useGoogleMaps: boolean;
  useSmartTools: boolean; // Weather & Stocks
  useDeepResearch: boolean; // SOTA tool
  useYouTube: boolean; // Video search
  useDataViz: boolean; // SOTA Charting
  useCanvas: boolean; // Dedicated writing/coding/web surface
}

export interface ToolExecutionResult {
    result: any;
    deepResearchData?: DeepResearchResult;
    youTubeData?: YouTubeVideo[];
    chartData?: ChartData;
    canvasData?: CanvasState;
    canvasUpdates?: CanvasUpdate[];
}

// --- Tool Definitions (Schemas) ---

const canvasTool: FunctionDeclaration = {
  name: 'open_canvas',
  description: 'Opens or overwrites the dedicated side-panel (Canvas) with NEW content. Use this to create documents, code, or PREVIEW WEB APPS. If the user asks to "run" or "create" a website, app, html, or tailwind component, use this tool with language="html" and provide the full code.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: 'The title of the document or code snippet.' },
      language: { type: Type.STRING, description: 'The language of the content (e.g., "markdown", "javascript", "html", "text", "typescript"). Use "html" to render web previews.' },
      content: { type: Type.STRING, description: 'The full content to put into the canvas.' },
    },
    required: ['title', 'language', 'content'],
  },
};

const editCanvasTool: FunctionDeclaration = {
  name: 'edit_canvas',
  description: 'Apply specific text edits to the EXISTING canvas content. Use this for line-by-line changes, typo fixes, or small refactors. PREFER this over rewriting the whole doc.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      changes: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            search: { type: Type.STRING, description: 'The exact text segment to replace. MUST be unique in the document. Include surrounding lines if needed to ensure uniqueness.' },
            replacement: { type: Type.STRING, description: 'The new text to insert in place of the search segment.' },
          },
          required: ['search', 'replacement']
        },
        description: 'Ordered list of text replacements.'
      }
    },
    required: ['changes'],
  },
};

const weatherTool: FunctionDeclaration = {
  name: 'getWeather',
  description: 'Get the current weather and conditions for a specific location.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      location: { type: Type.STRING, description: 'The city and state, e.g. San Francisco, CA' },
    },
    required: ['location'],
  },
};

const stockTool: FunctionDeclaration = {
  name: 'getStockPrice',
  description: 'Get the current stock price and daily change for a given ticker symbol.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      symbol: { type: Type.STRING, description: 'The stock ticker symbol, e.g. AAPL, GOOGL' },
    },
    required: ['symbol'],
  },
};

const deepResearchTool: FunctionDeclaration = {
  name: 'deepResearch',
  description: 'Performs a recursive, multi-step deep dive into a topic. Use this when the user asks for "research", "deep dive", or comprehensive analysis.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      topic: { type: Type.STRING, description: 'The complex topic to research.' },
      depth: { type: Type.NUMBER, description: 'Depth of research (1-3).' },
    },
    required: ['topic'],
  },
};

const youTubeTool: FunctionDeclaration = {
  name: 'youtubeSearch',
  description: 'Search for videos on YouTube. Use this when the user asks for videos, music, tutorials, or visual content.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      query: { type: Type.STRING, description: 'The search query for the video.' },
      count: { type: Type.NUMBER, description: 'Number of videos to return (default 3).' },
    },
    required: ['query'],
  },
};

const visualizationTool: FunctionDeclaration = {
  name: 'generate_visualization',
  description: 'Generates an interactive chart to visualize data. Use this when the user asks to "compare", "show trends", "visualize", or "chart" data.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      type: { type: Type.STRING, enum: ['bar', 'area', 'pie'], description: 'The type of chart to generate.' },
      title: { type: Type.STRING, description: 'The title of the chart.' },
      xAxis: { type: Type.STRING, description: 'Label for X Axis (e.g., Year, Company).' },
      yAxis: { type: Type.STRING, description: 'Label for Y Axis (e.g., Revenue, Users).' },
      dataContext: { type: Type.STRING, description: 'Context description to generate relevant mock data (e.g. "tech company revenue 2020-2024").' }
    },
    required: ['type', 'title', 'dataContext'],
  },
};

// --- Registry Implementation ---

const TOOL_IMPLEMENTATIONS: Record<string, (args: any) => any> = {
    'open_canvas': executeCanvas,
    'edit_canvas': executeEditCanvas,
    'getWeather': executeWeatherTool,
    'getStockPrice': executeStockTool,
    'deepResearch': executeDeepResearch,
    'youtubeSearch': executeYouTubeTool,
    'generate_visualization': executeVisualization
};

/**
 * Generates the `tools` array for the Gemini API call based on user config.
 */
export const getToolsForConfig = (config: ToolConfig, isImageGen: boolean): any[] => {
    const tools: any[] = [];

    if (!isImageGen) {
        if (config.useGoogleSearch) tools.push({ googleSearch: {} });
        
        // Maps is strict: Only works with Search, no functions.
        // If Google Maps is enabled, we strictly return it (and search if enabled) 
        // but exclude all function declarations to avoid Model 400 errors.
        if (config.useGoogleMaps) {
             tools.push({ googleMaps: {} });
             return tools;
        }
        
        const functionDeclarations: FunctionDeclaration[] = [];
        if (config.useCanvas) functionDeclarations.push(canvasTool, editCanvasTool);
        if (config.useSmartTools) functionDeclarations.push(weatherTool, stockTool);
        if (config.useDeepResearch) functionDeclarations.push(deepResearchTool);
        if (config.useYouTube) functionDeclarations.push(youTubeTool);
        if (config.useDataViz) functionDeclarations.push(visualizationTool);

        if (functionDeclarations.length > 0) {
            tools.push({ functionDeclarations });
        }
    } 
    // gemini-2.5-flash-image does NOT support tools (including googleSearch).
    // So if isImageGen is true, we return empty tools array.

    return tools;
};

/**
 * Executes a list of tool calls requested by the model.
 */
export const executeToolCalls = async (toolCalls: any[]): Promise<ToolExecutionResult> => {
    const functionResponses: any[] = [];
    let deepResearchData: DeepResearchResult | undefined;
    let youTubeData: YouTubeVideo[] | undefined;
    let chartData: ChartData | undefined;
    let canvasData: CanvasState | undefined;
    let canvasUpdates: CanvasUpdate[] | undefined;

    for (const call of toolCalls) {
        const handler = TOOL_IMPLEMENTATIONS[call.name];
        let result;

        if (handler) {
            result = handler(call.args);
            // Capture specific complex data types for UI rendering
            if (call.name === 'deepResearch') deepResearchData = result;
            if (call.name === 'youtubeSearch') youTubeData = result;
            if (call.name === 'generate_visualization') chartData = result;
            if (call.name === 'open_canvas') canvasData = result;
            if (call.name === 'edit_canvas') canvasUpdates = result;
        } else {
            result = { error: `Function ${call.name} not found` };
        }

        // For canvas, we provide a simple success message back to the model
        // so it can confirm to the user that it opened the canvas.
        let responseResult = result;
        if (call.name === 'open_canvas') responseResult = { status: 'ok', message: 'Canvas opened successfully' };
        if (call.name === 'edit_canvas') responseResult = { status: 'ok', message: 'Canvas edits applied successfully' };

        functionResponses.push({
            name: call.name,
            id: call.id,
            response: { result: responseResult }
        });
    }

    return {
        result: functionResponses,
        deepResearchData,
        youTubeData,
        chartData,
        canvasData,
        canvasUpdates
    };
};