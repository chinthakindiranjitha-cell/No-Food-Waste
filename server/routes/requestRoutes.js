import express from 'express';
import { createFoodRequest, getMyFoodRequests, getAllFoodRequests } from '../controllers/requestController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// GET /api/requests - Get all requests (Admin, Volunteer, Requester)
router.get('/', authorize('admin', 'volunteer', 'requester'), getAllFoodRequests);

// POST /api/requests - Create request (Requester & Admin)
router.post('/', authorize('requester', 'admin'), createFoodRequest);

// GET /api/requests/my - Get user's requests (Requester & Admin)
router.get('/my', authorize('requester', 'admin'), getMyFoodRequests);

export default router;
