import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const GROK_API_KEY = process.env.GROK_API_KEY;

// TODO: Requires credits to activate Grok
// API returns 403 if no payment added
// Backend integration is complete


if (!GROK_API_KEY) {
  throw new Error('Missing GROK_API_KEY in .env file');
}
const GROK_ENDPOINT = 'https://api.x.ai/v1/chat/completions'; 
function buildPrompt(rawData: {
  name: string;
  uses?: string;
  dosage?: string;
  warnings?: string;
  sideEffects?: string;
}) {
  return `
Simplify this medical info in friendly, non-technical English.
Add a helpful tip and a common mistake to avoid.

Name: ${rawData.name}
Use: ${rawData.uses || 'N/A'}
Dose: ${rawData.dosage || 'N/A'}
Side Effects: ${rawData.sideEffects || 'N/A'}
Warnings: ${rawData.warnings || 'N/A'}
`;
}

export async function simplifyMedicineInfo(rawData: any, lang = 'en') {
  try {
    console.log('GROK_API_KEY exists:', !!GROK_API_KEY);
    console.log('GROK_API_KEY length:', GROK_API_KEY?.length);
    
    const prompt = buildPrompt(rawData);
    console.log('Built prompt:', prompt);

    const response = await axios.post(
      GROK_ENDPOINT,
      {
        model: 'grok-1',
        messages: [
          { role: 'system', content: 'You are a helpful and friendly medical assistant.' },
          { role: 'user', content: prompt }
        ]
      },
      {
        headers: {
          'Authorization': `Bearer ${GROK_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const message = response.data?.choices?.[0]?.message?.content;
    return { simplified: message };
  } catch (err: any) {
    console.error('Failed to simplify with Grok:', err?.response?.data || err.message);
    console.error('Full error:', err);
    return { error: true, message: 'Failed to simplify medicine info' };
  }
}
