import express from 'express';
import {
  createFoodRequest,
  getMyFoodRequests,
  getAllFoodRequests,
  getCriticalRequests,
  updateRequestStatus,
  assignVolunteer
} from '../controllers/requestController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// GET /api/requests - Get all requests (Admin, Volunteer, Requester) — supports ?status= filter
router.get('/', authorize('admin', 'volunteer', 'requester'), getAllFoodRequests);

// GET /api/requests/critical - Get critical pending/accepted requests (Admin only)
router.get('/critical', authorize('admin'), getCriticalRequests);

// POST /api/requests - Create request (Requester & Admin)
router.post('/', authorize('requester', 'admin'), createFoodRequest);

// GET /api/requests/my - Get user's requests (Requester & Admin)
router.get('/my', authorize('requester', 'admin'), getMyFoodRequests);

// PATCH /api/requests/:id/status - Update request status (Admin only)
router.patch('/:id/status', authorize('admin'), updateRequestStatus);

// POST /api/requests/:id/assign - Assign volunteer to request (Admin only)
router.post('/:id/assign', authorize('admin'), assignVolunteer);

export default router;

