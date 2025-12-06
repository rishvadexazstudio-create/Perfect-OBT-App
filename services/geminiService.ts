
import { GoogleGenAI } from "@google/genai";
import { Member } from "../types";

// Lazy initialization of the Gemini AI client
let aiClient: GoogleGenAI | null = null;

const getAiClient = (): GoogleGenAI | null => {
  if (aiClient) return aiClient;

  let apiKey = '';
  
  // 1. Try Vite / Modern Frontend Environment (import.meta.env)
  try {
    // @ts-ignore
    if (import.meta && import.meta.env && import.meta.env.VITE_API_KEY) {
      // @ts-ignore
      apiKey = import.meta.env.VITE_API_KEY;
    }
  } catch (e) {
    // Ignore error if import.meta is not supported
  }

  // 2. Fallback to process.env (Node/Webpack/Standard)
  // We access process.env.API_KEY directly inside a try-catch.
  // Bundlers (like Vite/Webpack) often replace 'process.env.API_KEY' with the actual string value
  // during build, even if the 'process' object itself is undefined in the browser.
  if (!apiKey) {
    try {
      // @ts-ignore
      if (process.env.API_KEY) {
        // @ts-ignore
        apiKey = process.env.API_KEY;
      }
    } catch (e) {
      // Ignore ReferenceError if process is not defined and not replaced
    }
  }

  if (!apiKey) {
    console.warn("API Key not found (checked VITE_API_KEY and API_KEY). AI features disabled.");
    return null;
  }

  try {
    aiClient = new GoogleGenAI({ apiKey });
    return aiClient;
  } catch (error) {
    console.error("Failed to initialize Gemini Client:", error);
    return null;
  }
};

export const analyzeTeam = async (districtName: string, members: Member[]): Promise<string> => {
  const ai = getAiClient();
  if (!ai) {
    return "API Key not configured. Unable to generate AI insights.";
  }

  const memberListString = members.map(m => `- ${m.name} (${m.role})`).join('\n');

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `
        You are an expert HR and Team Management consultant for the "On Boarding Team (OBT)" in Tamil Nadu.
        
        Analyze the following team composition for the district of ${districtName}.
        
        Team Members:
        ${memberListString}

        Please provide a short, motivating summary (max 100 words) encompassing:
        1. Current strength (Total members vs max 30).
        2. Leadership presence (Is there a captain?).
        3. A quick tip for improving team efficiency.

        Format the output as a clean, friendly paragraph with emojis.
      `,
    });

    return response.text || "Could not generate analysis.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Unable to connect to AI assistant at the moment.";
  }
};

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data URL prefix (e.g., "data:image/png;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = error => reject(error);
  });
};

export const generateEditedImage = async (imageFile: File, prompt: string): Promise<string | null> => {
  const ai = getAiClient();
  if (!ai) {
    console.error("API Key missing");
    return null;
  }

  try {
    const base64Data = await fileToBase64(imageFile);
    const mimeType = imageFile.type;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data
            }
          },
          { text: prompt }
        ]
      }
    });

    // Extract the image from the response parts
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          // Construct the data URL for the generated image
          return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error("Gemini Image Gen Error:", error);
    throw error;
  }
};
