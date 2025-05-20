import express from 'express';
import { handleNotification, startPayment } from '../controllers/payment.js';
import bodyParser from 'body-parser';


const router = express.Router();
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());
router.post('/start', startPayment);
router.post('/notify', handleNotification);

export default router;
