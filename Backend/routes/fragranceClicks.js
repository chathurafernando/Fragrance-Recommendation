import express from 'express';
import { getClickStats, recordClick } from '../controllers/fragranceClick.js';


const router = express.Router();

router.post('/click', recordClick);
router.get('/click', getClickStats);

export default router;
