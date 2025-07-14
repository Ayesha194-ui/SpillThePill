import axios from "axios";

export async function getRawDrugData(drugName: string) {
  try {
    // 1. Autocomplete to get actual name
    const { data: autoData } = await axios.get(`http://localhost:5050/api/drugs/autocomplete?term=${drugName}`);
    const matchedName = autoData.suggestions?.[0];

    if (!matchedName) throw new Error("Drug not found");

    // 2. RxCUI (can still be used later if needed)
    const { data: rxcuiData } = await axios.get(`http://localhost:5050/api/drugs/rxcui?name=${matchedName}`);
    const rxcui = rxcuiData.rxcui;

    // 3. Use OpenFDA to fetch info by drug name (not rxcui)
    const { data: fdaData } = await axios.get(`https://api.fda.gov/drug/label.json?search=openfda.generic_name:"${encodeURIComponent(drugName)}"&limit=1`);

    const result = fdaData.results?.[0];
    if (!result) throw new Error("No FDA results found");

    return {
      name: matchedName,
      rxcui,
      uses: result.indications_and_usage?.[0] || null,
      dosage: result.dosage_and_administration?.[0] || null,
      warnings: result.warnings?.[0] || null,
      sideEffects: result.adverse_reactions?.[0] || null,
    };
  } catch (err) {
    const error = err as Error;
    console.error("Drug fetch failed:", error.message);
    return {
      error: true,
      message: "Drug data not available",
    };
  }
}