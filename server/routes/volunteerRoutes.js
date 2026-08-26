import express from 'express';
import { getAvailableVolunteers, toggleAvailability } from '../controllers/volunteerController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// GET /api/volunteers/available - List all volunteers (Admin only)
router.get('/available', protect, authorize('admin'), getAvailableVolunteers);

// PATCH /api/volunteers/availability - Toggle availability (Volunteer, Admin)
router.patch('/availability', protect, authorize('volunteer', 'admin'), toggleAvailability);

export default router;
