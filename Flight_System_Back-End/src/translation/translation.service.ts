import { Injectable } from '@nestjs/common';
import translate from '@iamtraction/google-translate';

@Injectable()
export class TranslationService {
  // Translate a text from sourceLang to targetLang
  async translateText(text: string, targetLang: string): Promise<string> {
    try {
      const res = await translate(text, { to: targetLang });
      if (!res || !res.text) throw new Error('Empty translation result');
      return res.text;
    } catch (error) {
      console.error(`Translation failed for "${text}":`, error);
      // fallback: return original text if translation fails
      return text;
    }
  }
  //============================================================================
  //Translate an object with 'en' field to 'ar' automatically
  async translateObject(obj: { en: string; ar?: string }): Promise<{ en: string; ar: string }> {
    if (!obj.en) return { en: '', ar: '' };
    const arText = await this.translateText(obj.en, 'ar');
    return { en: obj.en, ar: arText };
  }
  //============================================================================
}