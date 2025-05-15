import express from "express";
import multer from "multer";
import { addVendor, deleteVendor, getVendors, updateVendor } from "../controllers/vendor.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// POST route for adding a note (with image upload)
router.post("/", upload.single("img"), addVendor);

// // // GET route to retrieve all notes
router.get("/", getVendors);

// // // PUT route to update an existing note (with image upload)
router.put("/:id", upload.single("img"), updateVendor);


// // // DELETE route to delete a note by ID
router.delete("/:id", deleteVendor);

export default router;