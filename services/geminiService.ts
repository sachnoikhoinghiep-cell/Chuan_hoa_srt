
import { GoogleGenAI } from "@google/genai";

export const normalizeToSRT = async (rawContent: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const systemInstruction = `
    You are a professional subtitle editor. Your task is to convert the user's raw input into a valid SubRip (.srt) file format.
    
    Rules for Conversion:
    1. Each entry must have a sequential number starting from 1.
    2. Timestamps must be in the format HH:MM:SS,mmm --> HH:MM:SS,mmm.
    3. If the user provided incomplete timestamps (e.g., just "00:12" or "1:20"), expand them to the standard format.
    4. If end times are missing, estimate a reasonable duration (usually 2-4 seconds) or use the next start time as the end time.
    5. Ensure the text is cleaned up (trim whitespace, remove unnecessary symbols).
    6. Return ONLY the raw SRT text content. Do not include markdown code blocks, explanations, or any other text.
    7. If the input is completely invalid or doesn't contain any timestamps, try your best to create a meaningful subtitle or return an empty string if impossible.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: rawContent,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.1, // Low temperature for consistent formatting
      },
    });

    const text = response.text || "";
    // Clean up potential markdown wrappers if the AI ignored the instruction
    return text.replace(/^```srt\n?/, '').replace(/\n?```$/, '').trim();
  } catch (error) {
    console.error("Gemini Error:", error);
    throw new Error("Failed to process content with AI. Please check your input or try again later.");
  }
};
