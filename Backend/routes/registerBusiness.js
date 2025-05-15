import express from "express";
import multer from "multer";
import { addBusiness, deleteBusiness, getBusinesses, getCompanyByUserId, updateBusiness, updateVerification } from "../controllers/registerBusiness.js";
import { verifyToken } from "../controllers/auth.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// POST route for adding a note (with image upload)
router.post("/", upload.single("image"), verifyToken, addBusiness);

// // // // GET route to retrieve all notes
router.get("/", getBusinesses);

router.get("/:id", getCompanyByUserId);

// // // // PUT route to update an existing note (with image upload)
router.put("/:id", upload.single("image"), updateBusiness);

router.put("/:id/verify",updateVerification);

// // // // DELETE route to delete a note by ID
router.delete("/:id", deleteBusiness);

export default router;