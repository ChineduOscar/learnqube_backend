import { Router } from 'express'
const router = Router()
import { register, login, googleCallback, logout, getUserToken } from '../controllers/auth.js'

router.post('/register', register)
router.post('/login', login)
router.get('/google/callback', googleCallback)
router.get('/logout', logout)
router.get('/current-user', getUserToken)

export default router
