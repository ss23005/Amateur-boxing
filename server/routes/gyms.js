import express from 'express'
import { getGyms, getGym, searchGym, updateGym } from '../controllers/gymController.js'
import protect from '../middleware/authMiddleware.js'

const router = express.Router()

router.get('/', getGyms)
router.get('/search', searchGym)
router.get('/:id', getGym)
router.put('/:id', protect, updateGym)

export default router
