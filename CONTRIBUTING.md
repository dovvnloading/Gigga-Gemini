# Contributing to Gemini Neural Interface (Gigga Gemi) 

Thank you for your interest in contributing to the Gemini Neural Interface. This project is a high-fidelity, production-grade implementation of Google's generative AI capabilities. We value contributions that maintain the architectural integrity, performance, and visual polish of the application.

Please take a moment to review this document in order to make the contribution process easy and effective for everyone involved.

## Development Philosophy

1.  **High Fidelity:** This is not a boilerplate chat app. We aim for pixel-perfect UI, smooth 60fps animations, and a "glassmorphic" aesthetic that mirrors professional design systems.
2.  **Type Safety:** We utilize strict TypeScript. We do not accept `any` types unless interacting with untyped third-party libraries where type narrowing is impossible.
3.  **Modularity:** Logic should be separated from presentation. Complex logic (audio processing, stream parsing, state management) belongs in custom hooks or services, not inside UI components.

## Getting Started

### Prerequisites

*   Node.js v18.0.0 or higher
*   npm or yarn
*   A valid Google Gemini API Key (accessed via Google AI Studio)

### Local Development Setup

1.  **Fork and Clone**
    Fork the repository to your GitHub account and clone it locally:
    ```bash
    git clone https://github.com/YOUR_USERNAME/gemini-neural-interface.git
    cd gemini-neural-interface
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Environment Configuration**
    Create a `.env` file in the root directory. You can duplicate a `.env.example` if it exists.
    ```bash
    GEMINI_API_KEY=your_actual_api_key_here
    ```

4.  **Run Development Server**
    Start the Vite development server:
    ```bash
    npm run dev
    ```
    The application will launch at `http://localhost:3000`.

## Project Architecture

Understanding the folder structure is crucial for contributing effectively:

*   **`src/components`**: UI components only.
    *   `layout`: Structure components (Sidebar, Workspace).
    *   `visualizations`: D3/SVG charts and research views.
*   **`src/hooks`**: The application "brain".
    *   `useChat.ts`: Manages session state and message flow.
    *   `useLiveSession.ts`: Manages WebSockets and AudioContext for Gemini Live.
    *   `useAudio.ts`: Handles TTS generation and playback.
*   **`src/services`**: External API interactions.
    *   `geminiService.ts`: Core streaming logic.
    *   `toolRegistry.ts`: Schema definitions for function calling.
    *   `researchAgent.ts`: Logic for the Deep Research swarm.
*   **`src/types`**: Shared TypeScript interfaces (`Message`, `Attachment`, `ToolConfig`).

## Coding Standards

### TypeScript
*   Strict mode is enabled.
*   Define interfaces for all component props.
*   Use discriminated unions for state management where possible.
*   Avoid non-null assertions (`!`) unless you are certain the element exists (e.g., refs in `useEffect`).

### React
*   Use Functional Components with Hooks.
*   Avoid large, monolithic components. Break them down into sub-components.
*   Utilize `useCallback` and `useMemo` for expensive operations, particularly regarding the Audio Visualizer and Canvas rendering.

### Styling (Tailwind CSS)
*   We use a custom variable system for theming (defined in `index.html` style tag).
*   Use semantic color variables (e.g., `var(--bg-color)`, `var(--surface-highlight)`) instead of hardcoded hex values to ensure Dark/Light mode compatibility.
*   Ensure responsiveness. The interface must work on Mobile, Tablet, and Desktop.

## Adding New Features

### Adding a New Tool
To add a new capability to the model (e.g., a Calculator or Calendar integration):

1.  **Define Schema:** Add the `FunctionDeclaration` in `src/services/toolRegistry.ts`.
2.  **Implement Logic:** Create the execution logic in `src/services/toolImplementations.ts`.
3.  **Update Config:** Add a flag to the `ToolConfig` interface in `src/types.ts` and update `ToolsMenu.tsx`.

### modifying the Live Interface
The Live interface relies on `AudioContext` and WebSockets.
*   Ensure you handle browser autoplay policies (resume AudioContext on user interaction).
*   Do not block the main thread. Audio processing logic runs in `scriptProcessor.onaudioprocess`.

## Pull Request Process

1.  **Branching:** Create a new branch for your feature or fix.
    *   `feature/my-new-feature`
    *   `fix/bug-description`
2.  **Commit Messages:** Use conventional commits.
    *   `feat: add new visualization for stock data`
    *   `fix: resolve audio context suspension on safari`
3.  **Documentation:** If you changed the API handling or added new environment variables, update the README.
4.  **Screenshots:** If your changes affect the UI, please include before/after screenshots in your PR description.
5.  **Review:** A maintainer will review your code. Please address comments promptly.

## License

By contributing to the Gemini Neural Interface, you agree that your contributions will be licensed under its MIT License.
