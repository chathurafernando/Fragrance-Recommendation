import express from 'express';
import { handleNotification, startPayment } from '../controllers/payment.js';

const router = express.Router();

router.post('/start', startPayment);
router.post('/notify', handleNotification);

export default router;
