// routes/userFavoriteNotesRoutes.js
import express from 'express';
import { saveUserPreferences } from '../controllers/userPersonalTaste.js';

const router = express.Router();

// Route to save favorite notes for a user
router.post('/', saveUserPreferences);

export default router;
