import axios from "axios";
import { Request, Response } from "express";

// GET /api/drugs/rxcui?name=ibuprofen
export const getRxCui = async (req: Request, res: Response) => {
  const name = req.query.name as string;
  try {
    const { data } = await axios.get(
      `https://rxnav.nlm.nih.gov/REST/rxcui.json?name=${name}`
    );
    const rxcui = data.idGroup.rxnormId?.[0];
    if (!rxcui) return res.status(404).json({ message: "RxCUI not found" });
    res.json({ rxcui });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch RxCUI" });
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
    const { data } = await axios.get(
      `https://rxnav.nlm.nih.gov/REST/drugs.json?name=${encodeURIComponent(term)}`
    );
    const suggestions = (data.drugGroup.conceptGroup || [])
      .flatMap((group: any) => group.conceptProperties || [])
      .map((prop: any) => prop.name);
    res.json({ suggestions });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch autocomplete suggestions" });
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

// GET /api/drugs/medlineplus/:rxcui
// export const getMedlinePlusInfo = async (req: Request, res: Response) => {
//     const { rxcui } = req.params;
//     try {
//       const response = await fetch(
//         `https://connect.medlineplus.gov/application?mainSearchCriteria.v.c=${rxcui}&mainSearchCriteria.v.cs=2.16.840.1.113883.6.88&informationRecipient.languageCode.c=en`,
//         {
//           method: "GET",
//           headers: {
//             "User-Agent": "Mozilla/5.0",
//             "Accept": "text/html",
//           },
//         }
//       );
  
//       const html = await response.text();
//       const $ = cheerio.load(html);
//       const results: { title: string; link?: string; summary: string }[] = [];
  
//       $(".result").each((_, el) => {
//         const title = $(el).find(".resource-title a").text().trim();
//         const link = $(el).find(".resource-title a").attr("href");
//         const summary = $(el).find("p").first().text().trim();
//         results.push({ title, link, summary });
//       });
  
//       if (results.length === 0) {
//         console.log("DEBUG: HTML loaded, but no results extracted.");
//         return res.status(404).json({ message: "No MedlinePlus results found." });
//       }
  
//       res.json({ results });
//     } catch (error: any) {
//       console.error("MedlinePlus fetch failed:", {
//         message: error.message,
//         stack: error.stack,
//       });
//       res.status(500).json({ message: "Failed to fetch MedlinePlus info" });
//     }
//   };