// routes/admin.js
import express from "express";
import { verifyAdmin } from "../middlewares/roleMiddleware.js";

const router = express.Router();

router.get("/dashboard", verifyAdmin, (req, res) => {
  res.json("Welcome to the Admin Dashboard");
});

export default router;
