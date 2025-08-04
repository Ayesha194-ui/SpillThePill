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
      // Detailed model - comprehensive information for healthcare professionals
      prompt = `You are a medical information assistant. Provide comprehensive, detailed information about "${rawInfo.name}" medication. This is for healthcare professionals or detailed research.

Please provide a comprehensive overview including:

**What is ${rawInfo.name}?**
- Drug class and mechanism of action
- How it works in the body
- What conditions it treats

**Dosage Information:**
- Standard dosages for different conditions
- Timing and administration instructions
- Special considerations (age, weight, kidney function)
- Maximum daily limits

**Important Warnings & Precautions:**
- Contraindications (when NOT to use)
- Drug interactions
- Special populations (pregnancy, breastfeeding, elderly)
- Pre-existing conditions to consider

**Side Effects:**
- Common side effects and their frequency
- Serious side effects and warning signs
- What to do if side effects occur
- When to seek immediate medical attention

**Drug Interactions:**
- Medications that should not be taken together
- Food interactions
- Alcohol and other substances

**Monitoring & Follow-up:**
- What to monitor while taking this medication
- When to contact healthcare provider
- Signs of overdose or adverse reactions

Format the response in clear sections with headings. Include specific medical terminology and detailed information.`;
    } else {
      // Simplified model - key info for busy people
      prompt = `You are a medical information assistant. Provide simple, easy-to-understand information about "${rawInfo.name}" medication. This is for people with limited time who need key information quickly.

Please provide simplified information including:

**What is ${rawInfo.name} for?**
- Simple explanation of what it treats
- How it helps (in plain language)

**How to take it:**
- Simple dosage instructions
- When to take it
- Basic tips (with food, etc.)

**Important warnings:**
- Key things to avoid
- When to call a doctor
- Emergency signs to watch for

**Common side effects:**
- Most likely side effects
- What to do if they happen

**Quick tips:**
- 2-3 important things to remember
- When to seek medical help

Use simple, everyday language. Avoid medical jargon. Focus on what patients need to know quickly. Keep it concise but helpful.`;
    }

    console.log('Making OpenRouter API call with model:', modelId);
    console.log('API Key exists:', !!OPENROUTER_API_KEY);
    console.log('API Key starts with:', OPENROUTER_API_KEY?.substring(0, 10) + '...');
    
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
    
    console.log('OpenRouter response status:', response.status);
    console.log('OpenRouter response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenRouter API error response:', error);
      console.error('OpenRouter API error status:', response.status);
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