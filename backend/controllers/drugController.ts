import axios from "axios";
import { Request, Response } from "express";
import { getRawDrugData } from '../services/dbApi';
import { simplifyMedicineInfo } from "../services/llmSimplifier";

// GET /api/drugs/rxcui?name=ibuprofen
export const getRxCui = async (req: Request, res: Response) => {
  const name = (req.query.name as string)?.toLowerCase();
  // Mock RxCUI values for known drugs
  const mockRxcuiMap: Record<string, string> = {
    'ibuprofen': '12345',
    'paracetamol': '23456',
    'aspirin': '34567',
    'cetirizine': '45678',
    'metformin': '56789',
    'rantac': '67890',
    'amoxicillin': '78901',
    'azithromycin': '89012',
    'atorvastatin': '90123',
    'simvastatin': '01234',
    'lisinopril': '11223',
    'omeprazole': '22334',
    'pantoprazole': '33445',
    'levothyroxine': '44556',
    'metoprolol': '55667',
    'losartan': '66778',
    'gabapentin': '77889',
    'hydrochlorothiazide': '88990',
    'furosemide': '99001',
    'sertraline': '10112'
  };
  if (name && mockRxcuiMap[name]) {
    res.json({ rxcui: mockRxcuiMap[name] });
  } else {
    res.status(404).json({ message: 'RxCUI not found' });
  }
};

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
    // Mock data for development
    const allDrugs = ['Ibuprofen', 'Paracetamol', 'Aspirin', 'Cetirizine', 'Metformin', 'Rantac', 'Amoxicillin', 'Azithromycin', 'Atorvastatin', 'Simvastatin', 'Lisinopril', 'Omeprazole', 'Pantoprazole', 'Levothyroxine', 'Metoprolol', 'Losartan', 'Gabapentin', 'Hydrochlorothiazide', 'Furosemide', 'Sertraline'];
    const suggestions = allDrugs.filter(drug => drug.toLowerCase().includes(term.toLowerCase()));
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
    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
    const OPENROUTER_ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";
    
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
            role: 'user',
            content: `Translate the following medical information to ${targetLang}. Keep the same formatting and structure:\n\n${text}`
          }
        ],
        max_tokens: 1000,
        temperature: 0.3
      })
    });

    if (!response.ok) {
      throw new Error('Translation failed');
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || text;
  } catch (err) {
    console.error('Translation error:', err);
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

    if (model === 'regular') {
      // Option 1: Autocomplete to get RxCUI, then fetch raw data
      try {
        // 1. Autocomplete to get best match name
        const { data: autoData } = await axios.get(`http://localhost:5050/api/drugs/autocomplete?term=${encodeURIComponent(input)}`);
        const matchedName = autoData.suggestions?.[0];
        if (!matchedName) {
          return res.status(404).json({ error: 'No match found for input' });
        }
        drugName = matchedName;
        // 2. Get RxCUI for matched name
        const { data: rxcuiData } = await axios.get(`http://localhost:5050/api/drugs/rxcui?name=${encodeURIComponent(matchedName)}`);
        const rxcui = rxcuiData.rxcui;
        if (!rxcui) {
          return res.status(404).json({ error: 'No RxCUI found for matched name' });
        }
        // 3. Fetch raw drug data using RxCUI
        rawInfo = await getRawDrugData(rxcui);
      } catch (err) {
        console.error('Detailed model autocomplete/RxCUI lookup failed:', err);
        return res.status(500).json({ error: 'Failed to find drug details for input' });
      }
    } else {
      // Option 2: Use getRawDrugData directly (for simplified)
      rawInfo = await getRawDrugData(input);
    }

    if (rawInfo.error) {
      console.log('Raw drug data fetch failed:', rawInfo.message);
      return res.status(404).json({ error: rawInfo.message });
    }

    console.log('Raw drug data fetched successfully, calling OpenRouter...');
    // Use the new OpenRouter service
    const result = await simplifyMedicineInfo(rawInfo, 'en', model);

    let simplified = result.simplified;
    
    // If language is specified, translate the result
    if (language) {
      console.log('Translating to:', language);
      simplified = await translateText(result.simplified, language);
    }

    return res.json({ simplified });
  } catch (err: any) {
    console.error('Simplify controller error:', err);
    res.status(500).json({ error: 'Failed to simplify drug info' });
  }
};