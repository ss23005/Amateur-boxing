import express from 'express'
import protect from '../middleware/authMiddleware.js'
import { requireSuperAdmin } from '../middleware/adminMiddleware.js'
import {
  getAnalytics,
  getChangeRequests,
  reviewChangeRequest,
  getNews,
  createNews,
  updateNews,
  deleteNews,
  adminCreateEvent,
  adminUpdateEvent,
  adminDeleteEvent,
  getUsers,
  updateUserRole,
  adminGetGyms,
  adminCreateGym,
  adminUpdateGym,
  adminDeleteGym,
} from '../controllers/adminController.js'

const router = express.Router()

// All admin routes require auth + superadmin role
router.use(protect, requireSuperAdmin)

router.get('/analytics',                    getAnalytics)

router.get('/change-requests',              getChangeRequests)
router.put('/change-requests/:id/review',   reviewChangeRequest)

router.get('/news',                         getNews)
router.post('/news',                        createNews)
router.put('/news/:id',                     updateNews)
router.delete('/news/:id',                  deleteNews)

router.post('/events',                      adminCreateEvent)
router.put('/events/:id',                   adminUpdateEvent)
router.delete('/events/:id',               adminDeleteEvent)

router.get('/users',                        getUsers)
router.put('/users/:id/role',               updateUserRole)

router.get('/gyms',                         adminGetGyms)
router.post('/gyms',                        adminCreateGym)
router.put('/gyms/:id',                     adminUpdateGym)
router.delete('/gyms/:id',                  adminDeleteGym)

export default router
