import Assignment from '../models/Assignment.js';
import FoodRequest from '../models/FoodRequest.js';
import User from '../models/User.js';

// Helper for user-friendly error messages
const sanitizeErrorMessage = (error, defaultMessage) => {
  console.error('[Backend Assignment Error]', error);

  if (
    error.name === 'MongooseError' ||
    error.name === 'MongoNetworkError' ||
    (error.message && error.message.includes('buffering timed out'))
  ) {
    return 'Database service is temporarily unavailable. Please try again shortly.';
  }

  return defaultMessage || 'An unexpected error occurred. Please try again.';
};

// Shared populate config for single-request assignments
const singlePopulate = {
  path: 'requestId',
  populate: { path: 'requesterId', select: 'name email phone' }
};

// Shared populate config for batch assignments
const batchPopulate = {
  path: 'requestIds',
  populate: { path: 'requesterId', select: 'name email phone' }
};

// @desc    Get requests/assignments assigned to the logged-in volunteer
// @route   GET /api/assignments/my
// @access  Private (Volunteer, Admin)
export const getMyAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find({ volunteerId: req.user._id })
      .populate(singlePopulate)
      .populate(batchPopulate)
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: assignments.length,
      assignments
    });
  } catch (error) {
    const userMessage = sanitizeErrorMessage(
      error,
      'Unable to load your assigned pickups at this time.'
    );
    return res.status(500).json({ success: false, message: userMessage });
  }
};

// @desc    Update status of assignment and corresponding food request ('collected' / 'delivered')
// @route   PATCH /api/assignments/:id/status
// @access  Private (Volunteer, Admin)
export const updateAssignmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['assigned', 'collected', 'delivered'];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${validStatuses.join(', ')}`
      });
    }

    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment record not found' });
    }

    // Verify ownership unless admin
    if (req.user.role !== 'admin' && assignment.volunteerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this assignment' });
    }

    // Update assignment status
    assignment.status = status;
    await assignment.save();

    // Update associated FoodRequest(s) status
    if (assignment.isBatch && assignment.requestIds?.length > 0) {
      await FoodRequest.updateMany(
        { _id: { $in: assignment.requestIds } },
        { status }
      );
      // Also sync stopStatuses
      assignment.stopStatuses.forEach((stop) => { stop.status = status; });
      await assignment.save();
    } else if (assignment.requestId) {
      const foodRequest = await FoodRequest.findById(assignment.requestId);
      if (foodRequest) {
        foodRequest.status = status;
        await foodRequest.save();
      }
    }

    const populated = await Assignment.findById(assignment._id)
      .populate(singlePopulate)
      .populate(batchPopulate);

    return res.status(200).json({
      success: true,
      message: `Pickup status updated to "${status}"`,
      assignment: populated
    });
  } catch (error) {
    const userMessage = sanitizeErrorMessage(error, 'Unable to update pickup status. Please try again.');
    return res.status(500).json({ success: false, message: userMessage });
  }
};

// @desc    Create a batch assignment covering multiple requests with one volunteer
// @route   POST /api/assignments/batch
// @access  Private (Admin only)
export const createBatchAssignment = async (req, res) => {
  try {
    const { requestIds, volunteerId } = req.body;

    if (!Array.isArray(requestIds) || requestIds.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'requestIds must be an array with at least 2 requests'
      });
    }

    if (!volunteerId) {
      return res.status(400).json({ success: false, message: 'volunteerId is required' });
    }

    // Validate volunteer
    const volunteer = await User.findOne({ _id: volunteerId, role: 'volunteer' });
    if (!volunteer) {
      return res.status(404).json({ success: false, message: 'Volunteer not found' });
    }

    // Validate all requests exist and are assignable
    const foodRequests = await FoodRequest.find({
      _id: { $in: requestIds },
      status: { $in: ['pending', 'accepted'] }
    });

    if (foodRequests.length !== requestIds.length) {
      return res.status(400).json({
        success: false,
        message: 'One or more requests not found or not in assignable status (pending/accepted)'
      });
    }

    // Build per-stop status array
    const stopStatuses = requestIds.map((rid) => ({ requestId: rid, status: 'assigned' }));

    // Create batch assignment
    const assignment = await Assignment.create({
      requestIds,
      stopStatuses,
      isBatch: true,
      volunteerId: volunteer._id,
      status: 'assigned'
    });

    // Mark all food requests as assigned
    await FoodRequest.updateMany(
      { _id: { $in: requestIds } },
      { status: 'assigned' }
    );

    const populated = await Assignment.findById(assignment._id)
      .populate(batchPopulate)
      .populate('volunteerId', 'name email phone');

    return res.status(201).json({
      success: true,
      message: `Batch assignment created — volunteer "${volunteer.name}" assigned to ${requestIds.length} requests`,
      assignment: populated
    });
  } catch (error) {
    const userMessage = sanitizeErrorMessage(error, 'Unable to create batch assignment. Please try again.');
    return res.status(500).json({ success: false, message: userMessage });
  }
};

// @desc    Update a single stop's status within a batch assignment
// @route   PATCH /api/assignments/:id/stops/:requestId/status
// @access  Private (Volunteer, Admin)
export const updateBatchStopStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id, requestId } = req.params;
    const validStatuses = ['collected', 'delivered'];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Stop status must be one of: ${validStatuses.join(', ')}`
      });
    }

    const assignment = await Assignment.findById(id);
    if (!assignment || !assignment.isBatch) {
      return res.status(404).json({ success: false, message: 'Batch assignment not found' });
    }

    if (req.user.role !== 'admin' && assignment.volunteerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this assignment' });
    }

    // Find and update the specific stop
    const stop = assignment.stopStatuses.find((s) => s.requestId.toString() === requestId);
    if (!stop) {
      return res.status(404).json({ success: false, message: 'Stop not found in this batch assignment' });
    }

    stop.status = status;

    // Update the corresponding FoodRequest
    const foodRequest = await FoodRequest.findById(requestId);
    if (foodRequest) {
      foodRequest.status = status;
      await foodRequest.save();
    }

    // Auto-advance assignment status if all stops share the same status
    const allStatuses = assignment.stopStatuses.map((s) => s.status);
    const allSame = allStatuses.every((s) => s === status);
    if (allSame) {
      assignment.status = status;
    }

    await assignment.save();

    const populated = await Assignment.findById(assignment._id)
      .populate(batchPopulate)
      .populate('volunteerId', 'name email phone');

    return res.status(200).json({
      success: true,
      message: `Stop updated to "${status}"`,
      assignment: populated
    });
  } catch (error) {
    const userMessage = sanitizeErrorMessage(error, 'Unable to update stop status. Please try again.');
    return res.status(500).json({ success: false, message: userMessage });
  }
};

