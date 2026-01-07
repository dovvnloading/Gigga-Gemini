# Gemini Advanced Interface

[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-3.0_&_2.5-4285F4?style=for-the-badge&logo=google-gemini&logoColor=white)](https://aistudio.google.com/)

A production-grade, high-fidelity web application designed to leverage the full capabilities of the Google Gemini 3 and 2.5 model families. This interface implements advanced agentic workflows, real-time multimodal communication via the Live API, and a sophisticated dual-pane workspace optimized for both technical engineering and creative synthesis.

---

## Core Systems Architecture

### 1. Agentic Deep Research
The system features a proprietary "Swarm & Filter" research orchestration engine. Unlike standard RAG implementations, this agent decomposes complex user inquiries into orthogonal research dimensions. It dispatches multiple parallel search agents that extract verified facts with strict inline citations, which are then synthesized by a high-reasoning model into a formal whitepaper.

### 2. Interactive Canvas System
A dedicated secondary workspace for long-form content generation and technical execution.
*   **Web Previewing**: Real-time rendering of HTML and Tailwind CSS components within a sandboxed environment.
*   **Surgical Editing**: Utilizes incremental `edit_canvas` tool calls to perform precise text replacements, maintaining document integrity without full rewrites.
*   **Multi-mode Editor**: Seamlessly switches between Markdown documentation and high-performance code editing with synchronized syntax highlighting.

### 3. Multimodal Live Session
Native integration with the Gemini Live API enables low-latency, full-duplex conversational AI. The interface processes real-time PCM audio and 1 FPS video frames (camera or screen share), allowing the model to "see" and "hear" the user's environment while responding through a custom liquid-gooey visualizer.

---

## Visual Documentation Library

<details>
<summary><strong>Expand System Interface Gallery</strong></summary>
<p align="center">
  <br />
  <img width="1830" height="892" alt="Application Overview" src="https://github.com/user-attachments/assets/5596da5f-71ff-4ae4-b2c8-276858252f25" />
  <br />
  <details>
    <summary>Deep Research Agent Pipeline</summary>
    <img width="1812" height="893" alt="Research Pipeline" src="https://github.com/user-attachments/assets/ea6b2b0f-33ed-4acb-ba98-f049b0f9d330" />
  </details>
  <details>
    <summary>Technical Canvas & Code Surface</summary>
    <img width="1813" height="893" alt="Canvas Workspace" src="https://github.com/user-attachments/assets/1ef170f4-6797-47fc-889a-80b544786243" />
  </details>
  <details>
    <summary>Multimodal Live Visualizer</summary>
    <img width="1815" height="891" alt="Live Interface" src="https://github.com/user-attachments/assets/1f4f8fde-4002-45a4-b11e-3f7c5bbf2be9" />
  </details>
  <details>
    <summary>Audio Overview & Podcast Generation</summary>
    <img width="1834" height="898" alt="Podcast Generator" src="https://github.com/user-attachments/assets/df70de2f-9ab5-4b8e-8152-273e1314c950" />
  </details>
</p>
</details>

---

## Technical Specifications

### Memory Management
*   **Semantic Memory**: Background extraction of persistent user facts across disparate sessions to build a long-term user profile.
*   **Episodic Memory**: Automatic summarization of historical message blocks to optimize token usage within the context window.
*   **Cross-Session Referencing**: Optional RAG layer allowing the model to reference summaries of other relevant conversations in the user's history.

### Audio Intelligence
*   **TTS Synthesis**: Integrated text-to-speech utilizing the `gemini-2.5-flash-preview-tts` model with five distinct pre-built personas.
*   **Multi-Speaker Podcasts**: A specialized service that transforms chat threads into a two-host audio deep dive, featuring realistic filler words and conversational pacing.

### Developer Tooling
*   **Living Memory Backups**: Proprietary `.gemini` backup format for local encryption and storage of conversation history, semantic facts, and app configurations.
*   **Data Visualization**: Direct generation of interactive SVG charts (Bar, Area, Pie) based on model-reasoned datasets.

---

## Deployment and Setup

### Local Development
1. Clone the repository and navigate to the project root.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file or provide your API Key through the application settings:
   ```env
   GEMINI_API_KEY=your_key_here
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

### Hardware Permissions
To utilize Live Mode, the application requires the following browser permissions:
*   `microphone`: For real-time PCM audio streaming.
*   `camera`: For multimodal visual analysis.
*   `display-capture`: For screen-sharing analysis during technical assistance sessions.

---

**Developed by Matthew Robert Wesney**
A technical exploration into high-fidelity AI orchestration and state-of-the-art user interface paradigms.
