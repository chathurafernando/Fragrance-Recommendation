import express from "express";
import { getCompareFragrances, searchFragrances } from "../controllers/compareFragrances.js";

const router = express.Router();

router.get("/search", searchFragrances);
router.get("/compare", getCompareFragrances);

export default router;
