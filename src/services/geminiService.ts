import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import type { Message } from '../types/index';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const systemInstruction = `أنت مساعد ذكاء اصطناعي مفيد في لوحة تحكم أعمال. المستخدم هو موظف أو مدير. يجب عليك تحليل البيانات المتعلقة بالمبيعات والمخزون ومقاييس الأعمال الأخرى. بيانات لوحة التحكم غير متاحة لك، لذا يجب عليك إنشاء بيانات أمثلة واقعية عند طلب تفاصيل محددة. قم بالرد باللغة العربية. قم بتصنيف إجابتك ضمن إحدى الفئات التالية: 'تقرير مبيعات', 'تحليل مخزون', 'بيانات موظفين', 'سؤال عام'.`;

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    response: {
      type: Type.STRING,
      description: 'The detailed answer to the user prompt in Arabic.'
    },
    category: {
      type: Type.STRING,
      description: `Categorize the response. Possible values: 'تقرير مبيعات', 'تحليل مخزون', 'بيانات موظفين', 'سؤال عام'.`
    }
  }
};

export const getAiResponse = async (prompt: string): Promise<Pick<Message, 'text' | 'category'>> => {
  console.log("Sending prompt to AI:", prompt);

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema,
      },
    });
    
    // FIX: Trim whitespace from response before parsing JSON for robustness.
    const jsonResponse = JSON.parse(response.text.trim());
    return { text: jsonResponse.response, category: jsonResponse.category };

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return { 
        text: "عذرًا، حدث خطأ أثناء الاتصال بالمساعد الذكي. يرجى المحاولة مرة أخرى لاحقًا.",
        category: 'خطأ'
    };
  }
};