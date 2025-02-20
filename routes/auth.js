import { Router } from 'express'
const router = Router()
import { register, login, googleCallback, logout, authenticated } from '../controllers/auth.js'

router.post('/register', register)
router.post('/login', login)
router.get('/google/callback', googleCallback)
router.get('/authenticated', authenticated)
router.get('/logout', logout)

export default router
