
/**
 * Parses the raw stream text to extract thought process blocks (Chain of Thought).
 * Handles both complete and streaming (incomplete) thought tags.
 */
export const parseThoughtProcess = (fullStreamText: string): { text: string; thought: string; isThinking: boolean } => {
    const thinkStart = '<think>';
    const thinkEnd = '</think>';

    // Case A: Complete thought block present
    // We use a non-greedy capture to get the thought, then everything else is text
    // Regex handles newlines
    const match = fullStreamText.match(/<think>([\s\S]*?)<\/think>/);
    
    if (match) {
        const thought = match[1].trim();
        // Everything after the FIRST closing </think> is the response.
        // This handles edge cases where the model might hallucinate multiple think blocks,
        // though standard behavior is one block at the start.
        const parts = fullStreamText.split(thinkEnd);
        // Rejoin the rest in case "text" contained the delimiter (unlikely but safe)
        const text = parts.slice(1).join(thinkEnd).trimStart(); 
        
        return { text, thought, isThinking: false };
    }
    
    // Case B: Currently streaming thought (open tag, no close tag)
    if (fullStreamText.includes(thinkStart)) {
        const thought = fullStreamText.replace(thinkStart, '').trim();
        return { text: '', thought, isThinking: true }; // No visible final text yet
    }
    
    // Case C: No thinking tags detected at all
    return { text: fullStreamText, thought: '', isThinking: false };
};