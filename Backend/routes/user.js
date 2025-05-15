import express from "express";
import multer from "multer";
import { addUser, deleteUser, getUsers, updateUser } from "../controllers/user.js";


const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// POST route for adding a note (with image upload)
router.post("/", upload.single("img"), addUser);

// // // GET route to retrieve all notes
router.get("/", getUsers);

// // // PUT route to update an existing note (with image upload)
router.put("/:id", upload.single("img"), updateUser);


// // // DELETE route to delete a note by ID
router.delete("/:id", deleteUser);

export default router;