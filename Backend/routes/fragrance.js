import express from "express";
import multer from "multer";
import { addFragrance, deleteFragrance, getFragrance, updateFragrance } from "../controllers/fragrance.js";


// Create the multer storage setup for image uploads
const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

// POST route to add a new fragrance (with image upload)
router.post("/", upload.single("image"), addFragrance);

// // GET route to retrieve all fragrances
router.get("/", getFragrance);

// // PUT route to update an existing fragrance (with image upload)
router.put("/:id", upload.single("image"), updateFragrance);

// // DELETE route to delete a fragrance by ID
router.delete("/:id", deleteFragrance);



export default router;
