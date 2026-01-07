

import { Message, Attachment } from "../types";

/**
 * Optimizes history by formatting attachments for the Gemini API.
 * - Wraps text/code files in XML-like tags <file name="x">...</file> for clear context.
 * - Passes images/PDFs as inlineData (base64).
 * - Handles backward compatibility for deprecated `msg.image`.
 */
export const optimizeHistory = (history: Message[]): any[] => {
    return history.map((msg, index) => {
        const parts: any[] = [];
        
        // 1. Handle Text Content
        if (msg.text) {
            parts.push({ text: msg.text });
        }

        // 2. Handle Attachments (New System)
        if (msg.attachments && msg.attachments.length > 0) {
            msg.attachments.forEach(att => {
                if (att.type === 'file') {
                    // Text/Code File: Wrap in robust XML context
                    const filePrompt = `\n<file name="${att.name}">\n${att.content}\n</file>\n`;
                    parts.push({ text: filePrompt });
                } else if (att.type === 'image') {
                    // Visual/PDF Media: Inline Data
                    // Clean the base64 string (remove data URL prefix if present)
                    let cleanBase64 = att.content;
                    if (cleanBase64.includes('base64,')) {
                        cleanBase64 = cleanBase64.split('base64,')[1];
                    }
                    
                    parts.push({
                        inlineData: {
                            mimeType: att.mimeType,
                            data: cleanBase64
                        }
                    });
                }
            });
        }

        // 3. Handle Legacy Image (Backward Compatibility)
        // Only if no attachments were processed to avoid duplication if migration happened
        if (!msg.attachments && msg.image) {
             // Only keep heavy media for the very last user message to save bandwidth/tokens
             // unless it's text-based (which logic below doesn't cover, legacy was mostly images)
             const isRecent = index >= history.length - 3;
             
             if (isRecent) {
                let mimeType = 'image/png';
                let cleanBase64 = msg.image;

                if (msg.image.includes('data:') && msg.image.includes(';base64,')) {
                    const matches = msg.image.match(/^data:(.*);base64,(.*)$/);
                    if (matches && matches.length === 3) {
                        mimeType = matches[1];
                        cleanBase64 = matches[2];
                    }
                } else if (msg.image.includes('base64,')) {
                    cleanBase64 = msg.image.split('base64,')[1];
                }

                parts.push({
                    inlineData: {
                        mimeType: mimeType,
                        data: cleanBase64
                    }
                });
             } else {
                 parts.push({ text: "[Attached Image]" });
             }
        }
        
        return {
            role: msg.role,
            parts
        };
    });
};
