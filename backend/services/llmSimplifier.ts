import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";

const MODEL_MAP: Record<string, string> = {
  regular: "deepseek/deepseek-chat-v3-0324:free",
  simplified: "deepseek/deepseek-chat-v3-0324:free"
};

function buildPrompt(rawData: {
  name: string;
  uses?: string;
  dosage?: string;
  warnings?: string;
  sideEffects?: string;
}, type: string, fromLang?: string, toLang?: string) {
  if (type === 'need translation' && toLang) {
    return `
Simplify this medical info in ${toLang}. The original is in ${fromLang || 'English'}. Add a tip and a common mistake to avoid.

Name: ${rawData.name}
Use: ${rawData.uses || 'N/A'}
Dose: ${rawData.dosage || 'N/A'}
Side Effects: ${rawData.sideEffects || 'N/A'}
Warnings: ${rawData.warnings || 'N/A'}
`;
  }
  return `
Simplify this medical info in friendly, non-technical English. Add a tip and a common mistake to avoid.

Name: ${rawData.name}
Use: ${rawData.uses || 'N/A'}
Dose: ${rawData.dosage || 'N/A'}
Side Effects: ${rawData.sideEffects || 'N/A'}
Warnings: ${rawData.warnings || 'N/A'}
`;
}

export async function simplifyMedicineInfo(
  rawInfo: any,
  language: string = 'en',
  model: string = 'regular'
): Promise<{ simplified: string }> {
  try {
    const modelId = MODEL_MAP[model];
    if (!modelId) {
      throw new Error(`Unknown model: ${model}`);
    }

    let prompt: string;
    
    if (model === 'regular') {
      // Detailed model - comprehensive information
      prompt = `You are a medical information assistant. Please provide comprehensive, detailed information about this medication in a clear, organized format. Include all important details from the FDA data.

Drug Information:
- Name: ${rawInfo.name}
- RxCUI: ${rawInfo.rxcui || 'Not available'}
- Uses: ${rawInfo.uses || 'Not available'}
- Dosage: ${rawInfo.dosage || 'Not available'}
- Warnings: ${rawInfo.warnings || 'Not available'}
- Side Effects: ${rawInfo.sideEffects || 'Not available'}

Please provide a comprehensive overview including:
1. What this medication is and how it works
2. What conditions it treats
3. How to take it (dosage, timing, administration)
4. Important warnings and precautions
5. Common and serious side effects
6. Drug interactions to be aware of
7. What to do if you miss a dose
8. When to contact a healthcare provider

Format the response in clear sections with headings.`;
    } else {
      // Simplified model - user-friendly, easy to understand
      prompt = `You are a medical information assistant. Please provide simple, easy-to-understand information about this medication in a user-friendly format. Focus on the most important information that patients need to know.

Drug Information:
- Name: ${rawInfo.name}
- Uses: ${rawInfo.uses || 'Not available'}
- Dosage: ${rawInfo.dosage || 'Not available'}
- Warnings: ${rawInfo.warnings || 'Not available'}
- Side Effects: ${rawInfo.sideEffects || 'Not available'}

Please provide simplified information including:
1. What this medication is for
2. How to take it (simple instructions)
3. Important tips and warnings
4. Common side effects
5. When to call a doctor

Use simple language that anyone can understand. Avoid medical jargon.`;
    }

    const response = await fetch(OPENROUTER_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://spillthepill.com',
        'X-Title': 'SpillThePill Drug Simplifier'
      },
      body: JSON.stringify({
        model: modelId,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 1000,
        temperature: 0.3,
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenRouter error: ${response.status} ${error}`);
    }

    const data = await response.json();
    const simplified = data.choices?.[0]?.message?.content || "Unable to simplify drug information.";
    return { simplified };
  } catch (error: any) {
    console.error("OpenRouter error:", error.message);
    throw new Error(`OpenRouter error: ${error.message}`);
  }
} 