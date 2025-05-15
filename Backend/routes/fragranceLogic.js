// routes/userFavoriteNotesRoutes.js
import express from 'express';
import { getFragranceWithVendors } from '../controllers/fragranceLogic.js';

const router = express.Router();

// Route to save favorite notes for a user
router.get('/:id', getFragranceWithVendors);

export default router;
