import multer from "multer";
import express from "express";
import { addAdvertisement, getBannersByPlacement, getPlacements, getVendorAdvertisements } from "../controllers/Advertisement.js";

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

// POST route for adding advertisement (with image upload)
router.post("/:id", upload.single("banner"), addAdvertisement);
router.get("/",getPlacements)
//New GET route to fetch vendor's advertisements
router.get("/:id", getVendorAdvertisements);

router.get('/promotion/:placement', getBannersByPlacement);

// router.get('/price/:id', getAdvertisementByUserId);


export default router;
