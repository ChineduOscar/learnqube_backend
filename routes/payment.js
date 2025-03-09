import { Router } from 'express'
const router = Router()
import {createPayment, verifyPayment} from '../controllers/payment.js';

router.post('/', createPayment);
router.get('/hook/:reference', verifyPayment);

export default router
