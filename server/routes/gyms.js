import express from 'express'
import {
  getGyms, getGym, searchGym, updateGym,
  getJoinRequests, approveJoinRequest, rejectJoinRequest, requestJoin,
} from '../controllers/gymController.js'
import protect, { optionalProtect } from '../middleware/authMiddleware.js'

const router = express.Router()

router.get('/',        optionalProtect, getGyms)
router.get('/search',  searchGym)
router.get('/:id',     getGym)
router.put('/:id',     protect, updateGym)

// Fighter join requests
router.get('/:id/join-requests',                    protect, getJoinRequests)
router.post('/:id/join-requests/:userId/approve',   protect, approveJoinRequest)
router.post('/:id/join-requests/:userId/reject',    protect, rejectJoinRequest)
router.post('/:id/join',                            protect, requestJoin)

export default router
