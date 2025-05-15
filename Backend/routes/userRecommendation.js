import express from 'express';
import { getNewArrivals, getPopularPicks, getRecommendedFragrances } from '../controllers/userRecommendation.js';

const router = express.Router();

// Route to get recommended fragrances based on user preferences
router.get('/:userId', getRecommendedFragrances);

router.get('/fragrances/new', getNewArrivals);

router.get('/fragrances/popular-picks',getPopularPicks)


export default router;
