import { useState, useEffect } from 'react';
import { CanvasState, Message } from '../types';

export const useCanvasManager = (messages: Message[]) => {
  const [canvasState, setCanvasState] = useState<CanvasState>({
    isOpen: false,
    content: '',
    language: 'text',
    title: 'Untitled',
    mode: 'document'
  });

  // Listen for automatic canvas triggers from the model messages
  useEffect(() => {
    if (messages.length > 0) {
        const lastMsg = messages[messages.length - 1];
        if (lastMsg.role === 'model' && !lastMsg.isLoading) {
            // Full Canvas Replacement/Open
            if (lastMsg.relatedCanvasContent) {
                setCanvasState(lastMsg.relatedCanvasContent);
            }
            // Partial Updates (Inline Editing)
            else if (lastMsg.canvasUpdates && lastMsg.canvasUpdates.length > 0) {
                setCanvasState(prev => {
                    let newContent = prev.content;
                    let hasUpdates = false;

                    lastMsg.canvasUpdates?.forEach(update => {
                         if (update.type === 'replace') {
                             if (newContent.includes(update.search)) {
                                 newContent = newContent.replace(update.search, update.replacement);
                                 hasUpdates = true;
                             } else {
                                console.warn("Canvas Inline Edit Failed: Search string not found.", update.search);
                             }
                         }
                    });
                    
                    if (hasUpdates) {
                        return { ...prev, content: newContent, isOpen: true };
                    }
                    return prev;
                });
            }
        }
    }
  }, [messages]);

  const openCanvas = (content: string, language: string) => {
    setCanvasState({
        isOpen: true,
        content,
        language,
        title: language === 'text' ? 'Draft' : `Code (${language})`,
        mode: language === 'text' || language === 'markdown' ? 'document' : 'code'
    });
  };

  const closeCanvas = () => setCanvasState(prev => ({ ...prev, isOpen: false }));
  
  const updateContent = (newContent: string) => setCanvasState(prev => ({ ...prev, content: newContent }));

  /**
   * Constructs a specific context-aware prompt for the AI to edit the canvas.
   */
  const composeAiEditPrompt = (userRequest: string, currentSelection: string): string => {
      return `
I have this content in my Canvas (${canvasState.mode} mode):
\`\`\`${canvasState.language}
${canvasState.content}
\`\`\`

USER REQUEST: ${userRequest}
${currentSelection ? `CONTEXT SELECTION: "${currentSelection}"` : ''}

INSTRUCTIONS:
You are an intelligent editor helper.
- IF the user wants small changes (typos, single line code fixes, adding a paragraph):
  - Use the 'edit_canvas' tool.
  - Provide a list of search/replace pairs.
  - CRITICAL: The 'search' string must be UNIQUE in the document. If a line is repeated, include surrounding lines in 'search' to disambiguate.
  - List changes in order of appearance (top to bottom).
- IF the user wants a complete rewrite or huge structural changes:
  - Use the 'open_canvas' tool with the FULL new content.
- DO NOT return the content in plain text. ALWAYS use a tool.
`;
  };

  return {
    canvasState,
    setCanvasState,
    openCanvas,
    closeCanvas,
    updateContent,
    composeAiEditPrompt
  };
};