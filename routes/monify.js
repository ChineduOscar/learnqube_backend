import { Router } from 'express'
const router = Router()
import createPayment from '../controllers/monify.js'

router.post('/', createPayment);

export default router
