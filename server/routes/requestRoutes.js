import express from 'express';
import {
  createFoodRequest,
  getMyFoodRequests,
  getAllFoodRequests,
  updateRequestStatus,
  assignVolunteer,
  getBatchSuggestions
} from '../controllers/requestController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// GET /api/requests - Get all requests (Admin, Volunteer, Requester) — supports ?status= filter
router.get('/', authorize('admin', 'volunteer', 'requester'), getAllFoodRequests);

// POST /api/requests - Create request (Requester & Admin)
router.post('/', authorize('requester', 'admin'), createFoodRequest);

// GET /api/requests/my - Get user's requests (Requester & Admin)
router.get('/my', authorize('requester', 'admin'), getMyFoodRequests);

// GET /api/requests/batch-suggestions - Get clustered batch suggestions (Admin only)
// NOTE: Must be before /:id routes to avoid param collision
router.get('/batch-suggestions', authorize('admin'), getBatchSuggestions);

// PATCH /api/requests/:id/status - Update request status (Admin only)
router.patch('/:id/status', authorize('admin'), updateRequestStatus);

// POST /api/requests/:id/assign - Assign volunteer to request (Admin only)
router.post('/:id/assign', authorize('admin'), assignVolunteer);

export default router;
