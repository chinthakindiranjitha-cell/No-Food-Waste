import User from '../models/User.js';

// Helper for user-friendly error messages
const sanitizeErrorMessage = (error, defaultMessage) => {
  console.error('[Backend Volunteer Error]', error);

  if (
    error.name === 'MongooseError' ||
    error.name === 'MongoNetworkError' ||
    (error.message && error.message.includes('buffering timed out'))
  ) {
    return 'Database service is temporarily unavailable. Please try again shortly.';
  }

  return defaultMessage || 'An unexpected error occurred. Please try again.';
};

// @desc    Get all volunteers (for admin assignment panel)
// @route   GET /api/volunteers/available
// @access  Private (Admin only)
export const getAvailableVolunteers = async (req, res) => {
  try {
    const volunteers = await User.find({ role: 'volunteer' })
      .select('name email phone location createdAt')
      .sort({ name: 1 });

    return res.status(200).json({
      success: true,
      count: volunteers.length,
      volunteers
    });
  } catch (error) {
    const userMessage = sanitizeErrorMessage(
      error,
      'Unable to load volunteer list at this time.'
    );
    return res.status(500).json({
      success: false,
      message: userMessage
    });
  }
};
