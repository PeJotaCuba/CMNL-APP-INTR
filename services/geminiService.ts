import { GoogleGenAI } from "@google/genai";

/**
 * Servicio de chat general para el asistente.
 */
export async function askGemini(message: string): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: message,
      config: {
        systemInstruction: "Eres el consultor editorial de Radio Ciudad Monumento. Responde siempre de forma concisa.",
      },
    });
    return response.text || "Disculpa, no puedo responder ahora.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error al conectar con el asistente.";
  }
}

/**
 * Genera contenido específico para temáticas editoriales (ideas creativas o fuentes de información).
 */
export async function generateThemeContent(
  type: 'ideas' | 'sources',
  theme: string,
  instructions: string,
  program: string,
  day: string
): Promise<{ text: string; sources: any[] }> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  let prompt = "";
  // Default config
  const config: any = {
    systemInstruction: "Eres el experto editorial de Radio Ciudad Monumento. Ayudas a crear contenido radiofónico de calidad.",
  };

  if (type === 'ideas') {
    prompt = `Genera ideas creativas y una estructura de guion para el programa "${program}" del día "${day}".
    
    Temática: "${theme}"
    Instrucciones adicionales: "${instructions}"
    
    El formato debe incluir:
    1. Enfoque Sugerido (Intro)
    2. Puntos Clave a desarrollar
    3. Propuesta de cierre
    
    Mantén un tono profesional y radiofónico.`;
  } else {
    prompt = `Busca información actual y fuentes oficiales sobre: "${theme}".
    Contexto: Programa "${program}" del día "${day}".
    Instrucciones: "${instructions}".
    
    Proporciona un resumen informativo de los hallazgos y lista las fuentes consultadas. Prioriza medios cubanos (.cu) si es pertinente.`;
    
    // Enable Google Search Grounding for real-time info
    config.tools = [{ googleSearch: {} }];
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: config,
    });

    const text = response.text || "No se obtuvo respuesta del modelo.";
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    return { text, sources };
  } catch (error) {
    console.error("Error generating theme content:", error);
    return { text: "Ocurrió un error al procesar la solicitud con la IA.", sources: [] };
  }
}