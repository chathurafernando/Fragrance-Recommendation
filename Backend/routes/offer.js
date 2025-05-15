import express from 'express';
import { getAllOffers, getWebsiteUrlByCompany } from '../controllers/offer.js';

const router = express.Router();

// Route to get all offers
router.get('/', getAllOffers);
router.get('/:offerId/website', getWebsiteUrlByCompany);


export default router;
