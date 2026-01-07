# Gemini Neural Interface

![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black&style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript&logoColor=white&style=for-the-badge)
![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?logo=vite&logoColor=white&style=for-the-badge)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwind-css&logoColor=white&style=for-the-badge)
![Gemini](https://img.shields.io/badge/Google_GenAI_SDK-1.0-8E75B2?logo=google&logoColor=white&style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

<img width="1830" height="892" alt="Dashboard Interface" src="https://github.com/user-attachments/assets/5596da5f-71ff-4ae4-b2c8-276858252f25" />

## Overview

This project represents a production-grade, high-fidelity wrapper implementation for Google's Gemini 3 and 2.5 generative models. It serves as a comprehensive neural interface, unifying multimodal interaction capabilities into a single cohesive workspace.

Beyond standard chat functionality, this application engineers specific agentic workflows for deep research, real-time bidirectional voice/video communication (Gemini Live), artifact generation (Canvas), and episodic memory management. It demonstrates advanced integration of the Google GenAI SDK, handling complex stream parsing, audio PCM processing, and function calling orchestration.

## Key Features

### 1. Multimodal Intelligence & Reasoning
*   **Model Agnostic:** Seamless switching between Gemini 3 Flash (High speed), Gemini 3 Pro (High reasoning/Thinking process), and Gemini 2.5 Flash.
*   **Chain of Thought Visualization:** Renders the model's internal thinking process and planning steps before outputting the final response.
*   **Full Multimodality:** Supports text, heavy image analysis, and document (PDF/Code) context ingestion.

### 2. Deep Research Agent
*   **Autonomous Agent Pipeline:** Implements a "Plan → Swarm → Filter → Synthesize" architecture.
*   **Step-by-Step Execution:**
    1.  **Strategist:** Breaks a user query into orthogonal research dimensions.
    2.  **Swarm:** Parallel execution of Google Search queries.
    3.  **Cognitive Extraction:** Reads raw search results to extract signal from noise.
    4.  **Architect:** Synthesizes a final report with strict inline citation requirements.
*   **Citation Preservation:** Maintains traceability from source URL to final output.

### 3. Gemini Live (Real-Time WebSockets)
*   **Bi-directional Streaming:** Connects directly to the Gemini Multimodal Live API via WebSockets.
*   **Low Latency Audio:** Handles 16kHz PCM audio input (microphone) and 24kHz PCM audio output.
*   **Visual Context:** Supports real-time screen sharing and camera input analysis (1 FPS video stream injection) while maintaining conversation flow.

### 4. Canvas & Artifacts
*   **Dedicated Workspace:** Automatically opens a side panel for heavy content generation (Code, Markdown, Reports).
*   **Web Preview:** Renders HTML/Tailwind/JS directly in a sandboxed iframe for instant visual feedback.
*   **Context-Aware Editing:** Allows the user to highlight code/text and request specific AI refactors using a "search and replace" tool strategy.

### 5. Audio Overview (Podcast Generation)
*   **Script Generation:** Uses high-temperature prompting to generate naturalistic, multi-speaker scripts based on chat history.
*   **Multi-Speaker TTS:** Synthesizes audio using distinct voice profiles (e.g., "Kore" and "Fenrir") to create an engaging audio summary of the current session.

### 6. Memory Systems
*   **Semantic Memory:** Extract and persists user facts (preferences, job, location) across sessions.
*   **Episodic Memory:** Automatically summarizes old conversation turns to maintain context without exhausting context windows.

## Visual Gallery

<div style="display: flex; flex-wrap: wrap; gap: 10px; justify-content: center;">
  <img width="48%" alt="Deep Research" src="https://github.com/user-attachments/assets/ea6b2b0f-33ed-4acb-ba98-f049b0f9d330" />
  <img width="48%" alt="Canvas Editor" src="https://github.com/user-attachments/assets/1ef170f4-6797-47fc-889a-80b544786243" />
  <img width="48%" alt="Thinking Process" src="https://github.com/user-attachments/assets/1f4f8fde-4002-45a4-b11e-3f7c5bbf2be9" />
  <img width="48%" alt="Live Interface" src="https://github.com/user-attachments/assets/df70de2f-9ab5-4b8e-8152-273e1314c950" />
</div>

## Architecture

The application is built on a modern React stack, emphasizing performance and modularity.

### Core Stack
*   **Runtime:** Vite (ESModule based)
*   **Language:** TypeScript (Strict mode)
*   **State Management:** React Hooks + LocalStorage Persistence (Custom stores)
*   **Styling:** Tailwind CSS + Glassmorphism design system

### Technical Highlights

| Component | Implementation Details |
| :--- | :--- |
| **Stream Parser** | Custom regex-based parser to separate XML-like `<think>` tags from markdown content in real-time. |
| **Audio Processor** | `ScriptProcessorNode` (Web Audio API) for converting browser microphone streams to 16-bit PCM for the Live API. |
| **Tool Registry** | Strict schema definitions for Function Calling (Weather, Stocks, YouTube, Charts). |
| **Code Highlighting** | `react-syntax-highlighter` with Prism for VSCode-like visuals. |
| **Visualizers** | SVG-based chart rendering for data visualization tool outputs. |

## Installation

### Prerequisites
*   Node.js v18+
*   Google Gemini API Key (available via Google AI Studio)

### Setup

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/gemini-neural-interface.git
    cd gemini-neural-interface
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Environment Configuration**
    Create a `.env` file in the root directory:
    ```bash
    GEMINI_API_KEY=your_api_key_here
    ```

4.  **Run Development Server**
    ```bash
    npm run dev
    ```

## Usage Guide

1.  **Chat Mode:** Select a model (Flash/Pro) from the bottom bar. Type queries or upload files/images.
2.  **Tools:** Click the "Grip" icon to toggle active tools (Google Search, Deep Research, etc.).
3.  **Canvas:** When asking for code or long-form writing, the Canvas will open automatically. Click the "Editor/Preview" toggle to switch views.
4.  **Live Mode:** Click the Microphone icon (if not listening) or select "Gemini Live" model to enter the full-screen audio/video interface.
5.  **Podcast:** Click the "Headphones" icon in the header to generate an audio overview of the current chat history.

## Contributing

Contributions are welcome. Please adhere to the following standards:

1.  **Strict TypeScript:** No `any` types unless absolutely necessary for external library compatibility.
2.  **Component Modularity:** Keep components small and focused.
3.  **Tailwind Classes:** Use utility classes; avoid custom CSS files where possible.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
