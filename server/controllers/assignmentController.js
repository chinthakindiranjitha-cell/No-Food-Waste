import Assignment from '../models/Assignment.js';
import FoodRequest from '../models/FoodRequest.js';

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

// @desc    Get requests/assignments assigned to the logged-in volunteer
// @route   GET /api/assignments/my
// @access  Private (Volunteer, Admin)
export const getMyAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find({ volunteerId: req.user._id })
      .populate({
        path: 'requestId',
        populate: {
          path: 'requesterId',
          select: 'name email phone'
        }
      })
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
    return res.status(500).json({
      success: false,
      message: userMessage
    });
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
      return res.status(404).json({
        success: false,
        message: 'Assignment record not found'
      });
    }

    // Verify ownership unless admin
    if (req.user.role !== 'admin' && assignment.volunteerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this assignment'
      });
    }

    // Update assignment status
    assignment.status = status;
    await assignment.save();

    // Update associated FoodRequest status to match
    const foodRequest = await FoodRequest.findById(assignment.requestId);
    if (foodRequest) {
      foodRequest.status = status;
      await foodRequest.save();
    }

    const populated = await Assignment.findById(assignment._id).populate({
      path: 'requestId',
      populate: {
        path: 'requesterId',
        select: 'name email phone'
      }
    });

    return res.status(200).json({
      success: true,
      message: `Pickup status updated to "${status}"`,
      assignment: populated
    });
  } catch (error) {
    const userMessage = sanitizeErrorMessage(
      error,
      'Unable to update pickup status. Please try again.'
    );
    return res.status(500).json({
      success: false,
      message: userMessage
    });
  }
};
