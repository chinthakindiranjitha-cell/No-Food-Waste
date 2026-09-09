import express from 'express';
import {
  getMyAssignments,
  updateAssignmentStatus,
  createBatchAssignment,
  updateBatchStopStatus
} from '../controllers/assignmentController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// GET /api/assignments/my - List requests assigned to logged-in volunteer
router.get('/my', protect, authorize('volunteer', 'admin'), getMyAssignments);

// POST /api/assignments/batch - Create a batch assignment (admin only)
router.post('/batch', protect, authorize('admin'), createBatchAssignment);

// PATCH /api/assignments/:id/status - Update assignment status (mark collected/delivered)
router.patch('/:id/status', protect, authorize('volunteer', 'admin'), updateAssignmentStatus);

// PATCH /api/assignments/:id/stops/:requestId/status - Update individual stop status in a batch
router.patch('/:id/stops/:requestId/status', protect, authorize('volunteer', 'admin'), updateBatchStopStatus);

export default router;
