import express from "express";
import multer from "multer";
import { register, login, logout } from "../controllers/auth.js";
import { verifyToken, verifyRole } from "../middlewares/roleMiddleware.js"; // Import both middlewares

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });


// Public routes
router.post("/register",upload.single("img"), register);
router.post("/login", login);

// Private routes
router.post("/logout", verifyToken, logout); // Only logged-in users can log out

// Only 'user' can access the home page
router.get("/", verifyToken, verifyRole("user"), (req, res) => {
  res.status(200).json("Welcome to the home page!");
});

// Only 'vendor' can access the write page
router.get("/write", verifyToken, verifyRole("vendor"), (req, res) => {
  res.status(200).json("Welcome to the write page!");
});

export default router;
