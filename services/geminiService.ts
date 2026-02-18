
import { GoogleGenAI } from "@google/genai";

// Always use process.env.API_KEY directly when initializing the GoogleGenAI client instance.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getTeamStrategy = async (teamData: any) => {
  try {
    // For strategic reasoning and analysis, using gemini-3-pro-preview is recommended.
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Analyze this Mewgenics team: ${JSON.stringify(teamData)}. Provide a short, strategic advice (max 3 sentences) in Russian on how to play this composition or what its weaknesses are.`,
      config: {
        systemInstruction: "You are a professional Mewgenics player and strategist.",
      }
    });
    // Use the .text property to access the generated text content.
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Не удалось получить совет от ИИ.";
  }
};
