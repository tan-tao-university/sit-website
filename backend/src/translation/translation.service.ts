import { Injectable } from '@nestjs/common';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';

@Injectable()
export class TranslationService {
  private model: ChatGoogleGenerativeAI;

  constructor() {
    this.model = new ChatGoogleGenerativeAI({
      model: 'gemini-2.5-pro',
      apiKey: process.env.GOOGLE_API_KEY,
    });
  }

  async translate(text: string, targetLanguage: 'vi' | 'en'): Promise<string> {
    const languageName = targetLanguage === 'vi' ? 'Vietnamese' : 'English';

    // Simple direct translation
    const response = await this.model.invoke([
      new SystemMessage(
        `You are a professional translator. Translate the following text to ${languageName}. Return ONLY the translated text, no explanations or other text.`,
      ),
      new HumanMessage(text),
    ]);

    return response.content as string;
  }
}
