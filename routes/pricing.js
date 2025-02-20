import { Router } from 'express'
const router = Router()
import getAllPricing from '../controllers/pricing.js'

router.get('/', getAllPricing);

export default router
