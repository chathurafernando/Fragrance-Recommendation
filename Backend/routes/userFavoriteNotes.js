// routes/userFavoriteNotesRoutes.js
import express from 'express';
import { addUserFavoriteNotes } from '../controllers/userFavoriteNotes.js';

const router = express.Router();

// Route to save favorite notes for a user
router.post('/', addUserFavoriteNotes);

export default router;
