import express from 'express';
import { getMyAssignments, updateAssignmentStatus } from '../controllers/assignmentController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// GET /api/assignments/my - List requests assigned to logged-in volunteer
router.get('/my', protect, authorize('volunteer', 'admin'), getMyAssignments);

// PATCH /api/assignments/:id/status - Update assignment status (mark collected/delivered)
router.patch('/:id/status', protect, authorize('volunteer', 'admin'), updateAssignmentStatus);

export default router;
