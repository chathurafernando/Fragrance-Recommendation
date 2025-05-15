import express from "express";
import multer from "multer";
import { addBrand, deleteBrand, getBrands, getBrandsByFragrance, updateBrand } from "../controllers/brands.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// POST route for adding a note (with image upload)
router.post("/", upload.single("image"), addBrand);

// // GET route to retrieve all notes
router.get("/byFragrance", getBrandsByFragrance);

router.get("/", getBrands);

// // PUT route to update an existing note (with image upload)
router.put("/:id", upload.single("image"), updateBrand);

// // DELETE route to delete a note by ID
router.delete("/:id", deleteBrand);

export default router;