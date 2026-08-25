import express from 'express';
import { createFoodRequest, getMyFoodRequests } from '../controllers/requestController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// POST /api/requests - Create request (Requester & Admin)
router.post('/', authorize('requester', 'admin'), createFoodRequest);

// GET /api/requests/my - Get user's requests (Requester & Admin)
router.get('/my', authorize('requester', 'admin'), getMyFoodRequests);

export default router;
