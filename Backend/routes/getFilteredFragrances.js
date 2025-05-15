import express from "express";
import { getFilteredFragrances } from "../controllers/getFilteredFragrances.js";

const router = express.Router();

router.get("/filter", getFilteredFragrances);

export default router;
