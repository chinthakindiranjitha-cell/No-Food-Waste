import express from 'express';
import { getGlobalStats } from '../controllers/statsController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// GET /api/stats - Retrieve system stats (Admin only)
router.get('/', protect, authorize('admin'), getGlobalStats);

export default router;
