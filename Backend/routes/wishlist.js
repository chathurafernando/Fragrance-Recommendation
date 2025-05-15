import express from 'express';
import { addToWishlist, getUserWishlist, removeFromWishlist } from '../controllers/wishlist.js';

const router = express.Router();

// Route to save favorite notes for a user
router.post('/add', addToWishlist);
router.post('/remove',removeFromWishlist)

router.get('/:id',getUserWishlist)

export default router;