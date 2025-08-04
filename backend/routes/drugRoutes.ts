import express from "express";
import {
    autocompleteDrug,
    getDrugInfo,
    // getMedlinePlusInfo,
    simplifyDrugInfoController
} from "../controllers/drugController";
import { getRawDrugData } from "../services/dbApi";

const router = express.Router();

router.get("/", (req, res) => {
  res.status(200).json({ message: "Welcome to the Drugs API!" });
});
// RxCUI route removed - no longer needed
router.get("/info/:rxcui", getDrugInfo);
router.get("/autocomplete", autocompleteDrug);
// // router.get("/medlineplus/:rxcui", getMedlinePlusInfo);
router.get("/simplify/:rxcui", simplifyDrugInfoController);
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

export default router;