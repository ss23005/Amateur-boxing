import { Router } from 'express'
import {
  getFighters,
  getFighterById,
  createFighter,
  updateFighter,
  deleteFighter,
} from '../controllers/fighterController.js'
import protect from '../middleware/authMiddleware.js'

const router = Router()

router.get('/', getFighters)
router.get('/:id', getFighterById)
router.post('/', protect, createFighter)
router.put('/:id', protect, updateFighter)
router.delete('/:id', protect, deleteFighter)

export default router
