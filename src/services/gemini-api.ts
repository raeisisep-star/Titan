/**
 * Gemini AI API Service
 * Handles text generation, voice synthesis and language processing
 */

interface GeminiRequest {
  contents: {
    parts: {
      text: string;
    }[];
  }[];
}

interface GeminiResponse {
  candidates: {
    content: {
      parts: {
        text: string;
      }[];
    };
  }[];
}

export class GeminiAPIService {
  private apiKey: string;
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || 'AIzaSyAdl44pIzBNBaexovuoE_7npghtQTWsHUc';
  }

  async generateContent(prompt: string, model = 'gemini-2.0-flash'): Promise<string> {
    try {
      const requestBody: GeminiRequest = {
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ]
      };

      const response = await fetch(`${this.baseUrl}/models/${model}:generateContent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': this.apiKey
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`Gemini API Error: ${response.status} ${response.statusText}`);
      }

      const data: GeminiResponse = await response.json();
      
      if (!data.candidates || data.candidates.length === 0) {
        throw new Error('No response from Gemini API');
      }

      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error('Gemini API Service Error:', error);
      throw error;
    }
  }

  async translateText(text: string, targetLanguage: string): Promise<string> {
    const prompt = `Translate the following text to ${targetLanguage}. Only provide the translation, no additional text:

${text}`;

    return await this.generateContent(prompt);
  }

  async enhancePromptForVoice(text: string, language = 'Persian'): Promise<string> {
    const prompt = `Enhance the following text to be more suitable for text-to-speech in ${language}. Make it natural, conversational, and add appropriate pauses. Add phonetic hints for better pronunciation if needed:

${text}`;

    return await this.generateContent(prompt);
  }

  async detectLanguage(text: string): Promise<string> {
    const prompt = `Detect the language of this text and respond with just the language name in English (e.g., "Persian", "English", "Arabic"):

${text}`;

    return await this.generateContent(prompt);
  }

  async generateTradingInsight(data: any, language = 'Persian'): Promise<string> {
    const prompt = `Based on the following trading/portfolio data, provide a brief insight in ${language}. Keep it under 100 words and make it actionable:

Data: ${JSON.stringify(data)}`;

    return await this.generateContent(prompt);
  }

  async summarizeForVoice(longText: string, maxLength = 200, language = 'Persian'): Promise<string> {
    const prompt = `Summarize the following text in ${language} for voice output. Keep it under ${maxLength} characters, natural and conversational:

${longText}`;

    return await this.generateContent(prompt);
  }

  async generateVoicePersonality(context: string): Promise<string> {
    const prompt = `Based on this context, suggest a voice personality and tone for a trading AI assistant. Consider factors like professionalism, friendliness, and expertise level:

Context: ${context}`;

    return await this.generateContent(prompt);
  }

  // Health check for the service
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.generateContent('Hello', 'gemini-2.0-flash');
      return response.length > 0;
    } catch (error) {
      console.error('Gemini health check failed:', error);
      return false;
    }
  }
}

// Create singleton instance
export const geminiAPI = new GeminiAPIService();