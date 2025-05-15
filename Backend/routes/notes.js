import express from "express";
import multer from "multer";
import { addNote, deleteNote, getNotes, updateNote } from "../controllers/notes.js";


const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// POST route for adding a note (with image upload)
router.post("/", upload.single("image"), addNote);

// GET route to retrieve all notes
router.get("/", getNotes);

// PUT route to update an existing note (with image upload)
router.put("/:id", upload.single("image"), updateNote);

// DELETE route to delete a note by ID
router.delete("/:id", deleteNote);

export default router;