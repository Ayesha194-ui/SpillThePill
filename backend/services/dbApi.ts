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
  // No more mock data - everything goes to LLM now
  // This function now just validates the drug name and returns basic info for LLM processing
  const searchTerm = drugName.toLowerCase().trim();
  
  // Return basic drug info for LLM to process
  return {
    name: drugName,
    searchTerm: searchTerm,
    // LLM will generate all the detailed information
  };
}