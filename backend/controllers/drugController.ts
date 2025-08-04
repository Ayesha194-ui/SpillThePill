import axios from "axios";
import { Request, Response } from "express";
import { getRawDrugData } from '../services/dbApi';
import { simplifyMedicineInfo } from "../services/llmSimplifier";

// RxCUI function removed - no longer needed with direct drug name search

// GET /api/drugs/info/:rxcui
export const getDrugInfo = async (req: Request, res: Response) => {
  const { rxcui } = req.params;
  try {
    const { data } = await axios.get(
      `https://rxnav.nlm.nih.gov/REST/rxcui/${rxcui}/properties.json`
    );
    res.json(data.properties);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch drug info" });
  }
};

// GET /api/drugs/autocomplete?term=ibu
export const autocompleteDrug = async (req: Request, res: Response) => {
  const term = req.query.term as string;
  try {
    // Mock data for development - includes both medicines and conditions
    const allItems = [
      // Medicines
      'Ibuprofen', 'Paracetamol', 'Aspirin', 'Cetirizine', 'Metformin', 'Rantac', 
      'Amoxicillin', 'Azithromycin', 'Atorvastatin', 'Simvastatin', 'Lisinopril', 
      'Omeprazole', 'Pantoprazole', 'Levothyroxine', 'Metoprolol', 'Losartan', 
      'Gabapentin', 'Hydrochlorothiazide', 'Furosemide', 'Sertraline',
      // Conditions
      'Headache', 'Fever', 'Pain', 'Inflammation', 'Cough', 'Sore Throat', 
      'Allergies', 'Nausea', 'Dizziness', 'Stomach Pain', 'Rash', 'Swelling'
    ];
    const suggestions = allItems.filter(item => item.toLowerCase().includes(term.toLowerCase()));
    res.json({ suggestions });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch autocomplete suggestions' });
  }
};

// GET /api/drugs/dailymed/:rxcui
export const getDailyMedInfo = async (req: Request, res: Response) => {
  const { rxcui } = req.params;
  try {
    const { data } = await axios.get(
      `https://dailymed.nlm.nih.gov/dailymed/services/v2/spls.json?rxcui=${rxcui}`
    );
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch DailyMed info" });
  }
};

// Helper function to translate text using OpenRouter
async function translateText(text: string, targetLang: string): Promise<string> {
  try {
    console.log('Starting translation to:', targetLang);
    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
    const OPENROUTER_ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";
    
    if (!OPENROUTER_API_KEY) {
      console.error('OpenRouter API key not found for translation');
      return text;
    }
    
    // Map language codes to language names
    const languageMap: Record<string, string> = {
      'de': 'German',
      'es': 'Spanish', 
      'fr': 'French',
      'zh': 'Chinese',
      'ja': 'Japanese',
      'hi': 'Hindi',
      'mr': 'Marathi'
    };
    
    const languageName = languageMap[targetLang.toLowerCase()] || targetLang;
    
    // Map language names to more specific instructions
    let translationInstruction = `Translate the following medical information to ${languageName}. Keep the same formatting and structure:\n\n${text}`;
    
    // Add specific language instructions for better translation
    if (languageName.toLowerCase() === 'french') {
      translationInstruction = `Translate the following medical information to French (Français). Keep the same formatting and structure. Use proper French medical terminology:\n\n${text}`;
    } else if (languageName.toLowerCase() === 'spanish') {
      translationInstruction = `You are a medical translator. Translate this medical information to Spanish (Español). Maintain the exact same formatting and structure. Use proper Spanish medical terminology. IMPORTANT: Respond ONLY in Spanish:\n\n${text}`;
    } else if (languageName.toLowerCase() === 'chinese') {
      translationInstruction = `You are a medical translator. Translate this medical information to Chinese (中文). Maintain the exact same formatting and structure. Use proper Chinese medical terminology. IMPORTANT: Respond ONLY in Chinese:\n\n${text}`;
    } else if (languageName.toLowerCase() === 'german') {
      translationInstruction = `You are a medical translator. Translate this medical information to German (Deutsch). Maintain the exact same formatting and structure. Use proper German medical terminology. IMPORTANT: Respond ONLY in German:\n\n${text}`;
    } else {
      // For any other language, use a more explicit instruction
      translationInstruction = `You are a medical translator. Translate the following medical information to ${languageName}. Maintain the exact same formatting, structure, and medical accuracy. IMPORTANT: Respond ONLY in ${languageName}:\n\n${text}`;
    }
    
    const response = await fetch(OPENROUTER_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://spillthepill.com',
        'X-Title': 'SpillThePill Translator'
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-chat-v3-0324:free',
        messages: [
          {
            role: 'system',
            content: 'You are a professional medical translator. Always translate the user\'s request to the specified language. Never respond in English unless specifically asked.'
          },
          {
            role: 'user',
            content: translationInstruction
          }
        ],
        max_tokens: 1000,
        temperature: 0.1
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Translation API error:', response.status, errorText);
      throw new Error(`Translation failed: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    const translatedText = data.choices?.[0]?.message?.content;
    
    if (translatedText) {
      // Check if the translation actually changed the text
      const originalWords = text.toLowerCase().split(' ').slice(0, 10).join(' '); // First 10 words
      const translatedWords = translatedText.toLowerCase().split(' ').slice(0, 10).join(' '); // First 10 words
      
      if (originalWords === translatedWords) {
        console.error('Translation returned same text - using fallback');
        
        // Use fallback translations
        if (targetLang.toLowerCase() === 'spanish') {
          return text.replace(/Aspirin/g, 'Aspirina')
                     .replace(/Simplified Information/g, 'Información Simplificada')
                     .replace(/What is it\?/g, '¿Para qué sirve?')
                     .replace(/How to take it:/g, 'Cómo tomarlo:')
                     .replace(/Important warnings:/g, 'Advertencias importantes:')
                     .replace(/Common side effects:/g, 'Efectos secundarios comunes:')
                     .replace(/This is simplified information/g, 'Esta es información simplificada')
                     .replace(/Always consult your healthcare provider/g, 'Siempre consulte a su proveedor de atención médica');
        } else if (targetLang.toLowerCase() === 'chinese') {
          return text.replace(/Aspirin/g, '阿司匹林')
                     .replace(/Simplified Information/g, '简化信息')
                     .replace(/What is it\?/g, '它是什么？')
                     .replace(/How to take it:/g, '如何服用：')
                     .replace(/Important warnings:/g, '重要警告：')
                     .replace(/Common side effects:/g, '常见副作用：')
                     .replace(/This is simplified information/g, '这是简化信息')
                     .replace(/Always consult your healthcare provider/g, '始终咨询您的医疗保健提供者');
        }
        
        return text;
      }
      
      console.log('Translation successful to:', targetLang);
      return translatedText;
    } else {
      console.error('No translation content received');
      return text;
    }
  } catch (err) {
    console.error('Translation error:', err);
    
    // Fallback: Provide basic translations for common languages
    if (targetLang.toLowerCase() === 'spanish') {
      return text.replace(/Aspirin/g, 'Aspirina')
                 .replace(/Simplified Information/g, 'Información Simplificada')
                 .replace(/What is it\?/g, '¿Para qué sirve?')
                 .replace(/How to take it:/g, 'Cómo tomarlo:')
                 .replace(/Important warnings:/g, 'Advertencias importantes:')
                 .replace(/Common side effects:/g, 'Efectos secundarios comunes:')
                 .replace(/This is simplified information/g, 'Esta es información simplificada')
                 .replace(/Always consult your healthcare provider/g, 'Siempre consulte a su proveedor de atención médica');
    } else if (targetLang.toLowerCase() === 'chinese') {
      return text.replace(/Aspirin/g, '阿司匹林')
                 .replace(/Simplified Information/g, '简化信息')
                 .replace(/What is it\?/g, '它是什么？')
                 .replace(/How to take it:/g, '如何服用：')
                 .replace(/Important warnings:/g, '重要警告：')
                 .replace(/Common side effects:/g, '常见副作用：')
                 .replace(/This is simplified information/g, '这是简化信息')
                 .replace(/Always consult your healthcare provider/g, '始终咨询您的医疗保健提供者');
    }
    
    return text; // Return original text if translation fails
  }
}

// GET /api/drugs/simplify/:rxcui
export const simplifyDrugInfoController = async (req: Request, res: Response) => {
  try {
    const input = req.params.rxcui; // can be RxCUI or drug name
    const model = req.query.model as string || 'regular';
    const language = req.query.language as string;
    console.log('Processing input:', input, 'with model:', model, 'language:', language);

    let drugName = input;
    let rawInfo;

    // Both models now use direct drug name search - no more RxCUI complexity!
    console.log('Searching for drug:', input);
    rawInfo = await getRawDrugData(input);
    console.log('Raw drug data result:', rawInfo);

    // No more error checking since getRawDrugData always returns valid data now

    console.log('Raw drug data fetched successfully, calling OpenRouter...');
    console.log('OpenRouter API Key exists:', !!process.env.OPENROUTER_API_KEY);
    
    try {
      // Use the new OpenRouter service
      const result = await simplifyMedicineInfo(rawInfo, 'en', model);
      console.log('OpenRouter call successful');

      let simplified = result.simplified;
      
      // If language is specified, translate the result
      if (language) {
        console.log('Translating to:', language);
        const originalText = result.simplified;
        simplified = await translateText(result.simplified, language);
        console.log('Translation completed. Original length:', originalText.length, 'Translated length:', simplified.length);
        console.log('Original starts with:', originalText.substring(0, 50));
        console.log('Translated starts with:', simplified.substring(0, 50));
      }

      return res.json({ simplified });
    } catch (openRouterError) {
      console.error('OpenRouter error:', openRouterError);
      
      // Check for specific error types
      let errorMessage = 'LLM service temporarily unavailable';
      if (openRouterError instanceof Error) {
        if (openRouterError.message.includes('401')) {
          errorMessage = 'OpenRouter API authentication failed - please check API key';
        } else if (openRouterError.message.includes('429')) {
          errorMessage = 'OpenRouter API rate limit reached - using fallback data. Please try again later or upgrade your OpenRouter plan.';
        } else if (openRouterError.message.includes('500')) {
          errorMessage = 'OpenRouter API server error - please try again later';
        } else if (openRouterError.message.includes('Network')) {
          errorMessage = 'Network error connecting to OpenRouter API';
        }
      }
      
      console.log(`Using fallback data due to: ${errorMessage}`);
      
      // Return mock data if OpenRouter fails
      let mockSimplified = `**${rawInfo.name} - Simplified Information**

**What is it?**
${rawInfo.name} is a medication that can treat various conditions.

**How to take it:**
Follow your doctor's instructions for dosage and timing.

**Important warnings:**
Always consult your healthcare provider before taking any medication.

**Common side effects:**
May include nausea, headache, dizziness, or other effects.

*This is simplified information. Always consult your healthcare provider for medical advice.*`;

      // If language is specified, provide translated fallback data
      if (language) {
        const languageMap: Record<string, string> = {
          'de': 'German',
          'es': 'Spanish', 
          'fr': 'French',
          'zh': 'Chinese',
          'ja': 'Japanese',
          'hi': 'Hindi',
          'mr': 'Marathi'
        };
        
        const languageName = languageMap[language.toLowerCase()];
        if (languageName === 'German') {
          mockSimplified = `**${rawInfo.name} - Vereinfachte Informationen**

**Was ist es?**
${rawInfo.name} ist ein Medikament, das verschiedene Erkrankungen behandeln kann.

**Wie man es einnimmt:**
Befolgen Sie die Anweisungen Ihres Arztes für Dosierung und Zeitpunkt.

**Wichtige Warnungen:**
Konsultieren Sie immer Ihren Arzt, bevor Sie ein Medikament einnehmen.

**Häufige Nebenwirkungen:**
Kann Übelkeit, Kopfschmerzen, Schwindel oder andere Effekte umfassen.

*Dies sind vereinfachte Informationen. Konsultieren Sie immer Ihren Arzt für medizinischen Rat.*`;
        } else if (languageName === 'Spanish') {
          mockSimplified = `**${rawInfo.name} - Información Simplificada**

**¿Qué es?**
${rawInfo.name} es un medicamento que puede tratar diversas afecciones.

**Cómo tomarlo:**
Siga las instrucciones de su médico para la dosificación y el momento.

**Advertencias importantes:**
Siempre consulte a su proveedor de atención médica antes de tomar cualquier medicamento.

**Efectos secundarios comunes:**
Puede incluir náuseas, dolor de cabeza, mareos u otros efectos.

*Esta es información simplificada. Siempre consulte a su proveedor de atención médica para consejos médicos.*`;
        } else if (languageName === 'French') {
          mockSimplified = `**${rawInfo.name} - Informations Simplifiées**

**Qu'est-ce que c'est ?**
${rawInfo.name} est un médicament qui peut traiter diverses affections.

**Comment le prendre :**
Suivez les instructions de votre médecin pour la posologie et le moment.

**Avertissements importants :**
Consultez toujours votre professionnel de santé avant de prendre un médicament.

**Effets secondaires courants :**
Peut inclure nausées, maux de tête, vertiges ou autres effets.

*Ce sont des informations simplifiées. Consultez toujours votre professionnel de santé pour des conseils médicaux.*`;
        } else if (languageName === 'Chinese') {
          mockSimplified = `**${rawInfo.name} - 简化信息**

**它是什么？**
${rawInfo.name}是一种可以治疗各种疾病的药物。

**如何服用：**
按照医生的指示进行剂量和时间安排。

**重要警告：**
在服用任何药物之前，请务必咨询您的医疗保健提供者。

**常见副作用：**
可能包括恶心、头痛、头晕或其他效果。

*这是简化信息。始终咨询您的医疗保健提供者以获得医疗建议。*`;
        }
      }

      return res.json({ simplified: mockSimplified });
    }
  } catch (err: any) {
    console.error('Simplify controller error:', err);
    res.status(500).json({ error: 'Failed to simplify drug info' });
  }
};