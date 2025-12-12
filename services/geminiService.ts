import { GoogleGenAI, Type, Modality } from "@google/genai";
import { ReportCategory, ThreatLevel } from '../types';

// Ensure API key is present
const apiKey = process.env.API_KEY;

const ai = new GoogleGenAI({ apiKey: apiKey || 'dummy-key' });

export const analyzeReportWithGemini = async (text: string) => {
  if (!apiKey) {
    // Fallback simulation if no key
    return {
      category: ReportCategory.UNKNOWN,
      threatLevel: ThreatLevel.LOW,
      summary: "Processed locally (No API Key)"
    };
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Analyze the following crowd report from a stadium event: "${text}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: {
              type: Type.STRING,
              enum: [
                ReportCategory.SAFETY,
                ReportCategory.MEDICAL,
                ReportCategory.VIBE,
                ReportCategory.LOGISTICS,
                ReportCategory.UNKNOWN
              ]
            },
            threatLevel: {
              type: Type.STRING,
              enum: [
                ThreatLevel.LOW,
                ThreatLevel.MEDIUM,
                ThreatLevel.HIGH,
                ThreatLevel.CRITICAL
              ]
            },
            summary: {
              type: Type.STRING,
              description: "A very short 5-word summary for the dashboard."
            }
          },
          required: ["category", "threatLevel", "summary"]
        }
      }
    });

    const result = JSON.parse(response.text || '{}');
    return result;
  } catch (error) {
    console.error("Gemini analysis failed", error);
    return {
      category: ReportCategory.UNKNOWN,
      threatLevel: ThreatLevel.LOW,
      summary: "Analysis Failed"
    };
  }
};