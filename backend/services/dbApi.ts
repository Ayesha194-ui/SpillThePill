import axios from "axios";

// Helper function to convert RxCUI to drug name
async function getDrugNameFromRxCui(rxcui: string): Promise<string | null> {
  try {
    // Try properties first
    const { data: propertiesData } = await axios.get(
      `https://rxnav.nlm.nih.gov/REST/rxcui/${rxcui}/properties.json`
    );
    
    if (propertiesData.properties && propertiesData.properties.length > 0) {
      return propertiesData.properties[0].name;
    }
  } catch (error) {
    console.log('Properties approach failed for RxCUI:', rxcui);
  }
  
  try {
    // Try allrelated as fallback
    const { data: rxcuiData } = await axios.get(
      `https://rxnav.nlm.nih.gov/REST/rxcui/${rxcui}/allrelated.json`
    );
    
    const concepts = rxcuiData.allRelatedGroup?.conceptGroup?.[0]?.conceptProperties;
    if (concepts && concepts.length > 0) {
      return concepts[0].name;
    }
  } catch (error) {
    console.log('Allrelated approach also failed for RxCUI:', rxcui);
  }
  
  return null;
}

export async function getRawDrugData(drugName: string) {
  // Mock data for development
  const mockDrugData: Record<string, any> = {
    'ibuprofen': {
      name: 'Ibuprofen',
      rxcui: '12345',
      uses: 'Reduces fever and relieves mild to moderate pain such as headaches, toothaches, menstrual cramps, muscle aches, or arthritis.',
      dosage: '200-400 mg every 4-6 hours as needed. Do not exceed 1200 mg in 24 hours without doctor supervision.',
      warnings: 'Do not use if you have a history of allergic reaction to NSAIDs. Use with caution in patients with stomach ulcers, heart, or kidney problems.',
      sideEffects: 'Nausea, vomiting, headache, dizziness, stomach pain, rash.'
    },
    'paracetamol': {
      name: 'Paracetamol',
      rxcui: '23456',
      uses: 'Relieves mild to moderate pain and reduces fever.',
      dosage: '500-1000 mg every 4-6 hours as needed. Do not exceed 4000 mg in 24 hours.',
      warnings: 'Do not use with other products containing acetaminophen. Overdose can cause liver damage.',
      sideEffects: 'Rash, low blood cell count, liver damage (overdose).'
    },
    'aspirin': {
      name: 'Aspirin',
      rxcui: '34567',
      uses: 'Reduces pain, fever, and inflammation. Used for heart attack and stroke prevention.',
      dosage: '325-650 mg every 4-6 hours as needed. For heart protection, 81-325 mg daily as directed.',
      warnings: 'Do not use in children with viral infections (risk of Reye’s syndrome). Avoid if you have bleeding disorders.',
      sideEffects: 'Stomach upset, bleeding, allergic reactions.'
    }
    // Add more mock drugs as needed
  };
  const key = drugName.toLowerCase();
  // Check by name
  if (mockDrugData[key]) {
    return mockDrugData[key];
  }
  // Check by RxCUI
  const byRxcui = Object.values(mockDrugData).find(drug => drug.rxcui === drugName);
  if (byRxcui) {
    return byRxcui;
  }
  return { error: true, message: 'Drug data not available' };
}