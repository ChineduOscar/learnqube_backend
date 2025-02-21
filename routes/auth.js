import { Router } from 'express'
const router = Router()
import { register, login, googleCallback, logout, getCurrentUser } from '../controllers/auth.js'

router.post('/register', register)
router.post('/login', login)
router.get('/google/callback', googleCallback)
router.get('/logout', logout)
router.get('/current-user', getCurrentUser)

export default router
