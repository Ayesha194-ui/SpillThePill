import express from "express";
import {
    autocompleteDrug,
    getDrugInfo,
    // getMedlinePlusInfo,
    getRxCui
} from "../controllers/drugController";
import { getRawDrugData } from "../services/dbApi";
import { simplifyMedicineInfo } from "../services/llmSimplifier";

const router = express.Router();

router.get("/", (req, res) => {
  res.status(200).json({ message: "Welcome to the Drugs API!" });
});
router.get("/rxcui", getRxCui);
router.get("/info/:rxcui", getDrugInfo);
router.get("/autocomplete", autocompleteDrug);
// // router.get("/medlineplus/:rxcui", getMedlinePlusInfo);
router.get("/rawdata/:name", async (req, res) => {      // Fetch from OpenFDA
    const name = req.params.name;
    try {
      const result = await getRawDrugData(name);
      res.json(result);
    } catch (error) {
      console.error("Error in rawdata route:", error);
      res.status(500).json({ message: "Failed to fetch raw drug data" });
    }
});
router.post("/simplify", async (req, res) => {
    try {
      const rawData = req.body;
  
      if (!rawData.name) {
        return res.status(400).json({ error: true, message: "Drug name is required." });
      }
  
      const result = await simplifyMedicineInfo(rawData);
  
      if (result.error) {
        return res.status(500).json({ error: true, message: result.message });
      }
  
      return res.json({ simplified: result.simplified });
    } catch (err: any) {
      console.error("Simplify route error:", err);
      res.status(500).json({ error: true, message: "Internal server error" });
    }
  });

export default router;