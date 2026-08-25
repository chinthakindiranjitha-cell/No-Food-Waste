import express from 'express';
import { getAvailableVolunteers } from '../controllers/volunteerController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// GET /api/volunteers/available - List all volunteers (Admin only)
router.get('/available', protect, authorize('admin'), getAvailableVolunteers);

export default router;
