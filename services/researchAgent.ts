import { getAiClient } from "./apiClient";
import { DeepResearchResult } from "../types";

// Helper to wait/delay (prevents rate limiting)
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

interface ResearchDimension {
    id: string;
    label: string;
    query: string;
    focus: string;
}

interface SourceReference {
    id: number;
    url: string;
    title: string;
}

/**
 * Orchestrates a SOTA "Swarm & Filter" Deep Research process with STRICT CITATION requirements.
 * 
 * Architecture:
 * 1. Strategic Planner (Flash): Breaks topic into orthogonal dimensions.
 * 2. The Swarm (Parallel): Executes searches for each dimension. Collects Grounding Metadata.
 * 3. Cognitive Extraction (Flash x N): Parallel agents read raw search data and extract ONLY signal (facts/stats), discarding noise.
 *    - MUST cite source ID [x].
 * 4. The Architect (Pro): Synthesizes curated data into a final deep report.
 *    - MUST preserve citations [x].
 */
export const runDeepResearchAgent = async (
    topic: string, 
    onUpdate: (data: DeepResearchResult) => void
): Promise<{ text: string; data: DeepResearchResult; reportMarkdown?: string }> => {
    
    const ai = getAiClient();
    const startTime = Date.now();
    
    // Initial State
    let currentState: DeepResearchResult = {
        topic,
        depth: 3,
        total_sources: 0,
        execution_time: "0s",
        steps: [
            { id: 1, action: "Strategic Planning", description: "Analyzing topic dimensionality...", status: 'pending', icon: 'analyze' },
            { id: 2, action: "Vector Search", description: "Pending plan...", status: 'pending', icon: 'search' },
            { id: 3, action: "Cognitive Extraction", description: "Pending raw data...", status: 'pending', icon: 'read' },
            { id: 4, action: "Synthesis", description: "Pending extraction...", status: 'pending', icon: 'write' }
        ],
        sources: []
    };
    
    onUpdate(currentState);

    try {
        // --- STEP 1: STRATEGIC PLANNING ---
        const planPrompt = `
        You are a Lead Research Strategist.
        Target Topic: "${topic}"
        
        Break this topic down into 4 distinct, non-overlapping research dimensions to ensure a comprehensive deep dive.
        For each dimension, provide:
        1. A short label (e.g., "Economic Impact").
        2. A targeted search query optimized for Google Search.
        3. A "Focus Instruction" telling a junior researcher what specific data points to look for.

        Return ONLY a raw JSON array of objects.
        Schema: Array<{ label: string, query: string, focus: string }>
        `;

        const planResponse = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: { parts: [{ text: planPrompt }] },
            config: { 
                responseMimeType: 'application/json',
                temperature: 0.3 
            }
        });

        let dimensions: ResearchDimension[] = [];
        try {
             dimensions = JSON.parse(planResponse.text || "[]");
        } catch (e) {
             // Fallback if JSON fails
             dimensions = [{ id: '1', label: 'General Overview', query: topic, focus: 'General facts' }];
        }
        
        // Update State
        currentState.steps[0].status = 'completed';
        currentState.steps[0].description = `Identified ${dimensions.length} research vectors: ${dimensions.map(d => d.label).join(', ')}.`;
        currentState.steps[1].description = `Dispatching ${dimensions.length} parallel search agents...`;
        onUpdate({ ...currentState });

        // --- STEP 2: THE SWARM (Search with Grounding) ---
        const searchPromises = dimensions.map(async (dim) => {
            const res = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: { parts: [{ text: `Search for detailed information: ${dim.query}` }] },
                config: { tools: [{ googleSearch: {} }] }
            });
            return { dim, res };
        });

        const searchResults = await Promise.all(searchPromises);
        
        // Harvest Sources and Assign IDs
        let globalSourceMap: SourceReference[] = [];
        let sourceCounter = 1;

        // Collect all chunks and map them
        searchResults.forEach(({ res }) => {
            const grounding = res.candidates?.[0]?.groundingMetadata;
            if (grounding?.groundingChunks) {
                grounding.groundingChunks.forEach((c: any) => {
                    if (c.web) {
                        // Check if URL already exists to avoid duplicate citations
                        const exists = globalSourceMap.find(s => s.url === c.web.uri);
                        if (!exists) {
                            globalSourceMap.push({
                                id: sourceCounter++,
                                url: c.web.uri,
                                title: c.web.title || "Unknown Source"
                            });
                        }
                    }
                });
            }
        });

        // Update UI with Sources
        currentState.steps[1].status = 'completed';
        currentState.steps[1].description = `Retrieved verified data from ${globalSourceMap.length} sources.`;
        currentState.total_sources = globalSourceMap.length;
        currentState.sources = globalSourceMap.map(s => ({
            title: s.title,
            url: s.url,
            type: 'web',
            relevance: 100
        }));
        currentState.steps[2].description = `Extracting valid citations from source material...`;
        onUpdate({ ...currentState });

        // --- STEP 3: COGNITIVE EXTRACTION (The Filter with Citations) ---
        const extractionPromises = searchResults.map(async ({ dim, res }) => {
            const rawText = res.text || "";
            const grounding = res.candidates?.[0]?.groundingMetadata;
            
            // Map the specific chunks of THIS search result to our Global IDs
            // This is critical: The rawText from Google Search usually has its own citations or is implicit.
            // We need to feed the agent the "Sources available for this text" and ask it to map facts to Global IDs.
            
            let localSourceContext = "";
            if (grounding?.groundingChunks) {
                grounding.groundingChunks.forEach((c: any) => {
                     if (c.web) {
                         const globalSource = globalSourceMap.find(s => s.url === c.web.uri);
                         if (globalSource) {
                             localSourceContext += `[Source ID ${globalSource.id}]: ${c.web.title} (${c.web.uri})\n`;
                         }
                     }
                });
            }

            const extractionPrompt = `
            You are a Data Extractor Agent.
            
            GOAL: Extract high-value signal from the noise with STRICT CITATION.
            DIMENSION: "${dim.label}"
            FOCUS: "${dim.focus}"
            
            RAW SEARCH SUMMARY:
            ${rawText.substring(0, 15000)}

            AVAILABLE SOURCE INDEX (Global IDs):
            ${localSourceContext}
            
            INSTRUCTIONS:
            1. Read the raw search summary.
            2. Extract facts relevant to the FOCUS.
            3. CRITICAL: For EVERY fact, append the Source ID like this: [1], [5], etc. based on the "AVAILABLE SOURCE INDEX" provided above.
            4. If the raw text implies a source (e.g. "According to NYT"), find the matching ID in the index and use it.
            5. If no specific source ID can be confidently matched, do not invent one.
            
            OUTPUT FORMAT:
            - Bullet point fact [SourceID]
            - Bullet point fact [SourceID]
            `;

            const extractionRes = await ai.models.generateContent({
                model: 'gemini-3-flash-preview', 
                contents: { parts: [{ text: extractionPrompt }] }
            });

            return `
### DIMENSION: ${dim.label}
${extractionRes.text}
`;
        });

        const extractedNotes = await Promise.all(extractionPromises);
        const curatedContext = extractedNotes.join("\n\n");

        currentState.steps[2].status = 'completed';
        currentState.steps[2].description = `Extracted verified facts with citations.`;
        currentState.steps[3].description = "Synthesizing final report in Canvas...";
        onUpdate({ ...currentState });

        // --- STEP 4: THE ARCHITECT (Synthesis) ---
        const bibliography = globalSourceMap.map(s => `[${s.id}] ${s.title}: ${s.url}`).join('\n');

        const finalPrompt = `
        You are a Principal Research Architect. 
        Topic: "${topic}"
        
        You have received curated notes from field researchers containing facts with Inline Citations (e.g., [1], [5]).
        
        REPORT REQUIREMENTS:
        1. **Synthesis**: Write a comprehensive, deep-dive report on the topic.
        2. **Format**: Use clean Markdown. Start with a "# ${topic}" Title. Use ## Sections.
        3. **Preserve Citations**: You MUST retain the inline citations [x] from the notes in your final text.
        4. **Bibliography**: At the VERY END, append the "References" list provided below.
        
        CURATED NOTES:
        ${curatedContext}

        REFERENCE LIST (Append to end):
        ${bibliography}
        `;

        const reportResponse = await ai.models.generateContent({
            model: 'gemini-3-pro-preview', 
            contents: { parts: [{ text: finalPrompt }] },
            config: { 
                temperature: 0.4,
                thinkingConfig: { thinkingBudget: 2048 } 
            }
        });

        const finalReport = reportResponse.text || "Failed to generate report.";
        const endTime = Date.now();
        const duration = ((endTime - startTime) / 1000).toFixed(1) + "s";

        // Final State Update
        currentState.execution_time = duration;
        currentState.steps[3].status = 'completed';
        currentState.steps[3].description = "Report generated in Canvas.";
        
        onUpdate({ ...currentState });
        
        const summaryText = `I have completed the deep research on "**${topic}**".\n\nA detailed report with ${currentState.total_sources} citations has been generated in the Canvas.`;

        return { text: summaryText, data: currentState, reportMarkdown: finalReport };

    } catch (error) {
        console.error("Deep Research Failed", error);
        currentState.steps.forEach(s => {
             if (s.status === 'pending') s.description = "Failed";
        });
        onUpdate({ ...currentState });
        throw error;
    }
};