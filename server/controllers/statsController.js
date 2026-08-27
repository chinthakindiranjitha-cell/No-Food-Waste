import FoodRequest from '../models/FoodRequest.js';
import User from '../models/User.js';

// Helper for error responses
const sanitizeErrorMessage = (error, defaultMessage) => {
  console.error('[Backend Stats Error]', error);
  return defaultMessage || 'An error occurred while computing global statistics.';
};

// @desc    Get aggregate system statistics for admin dashboard
// @route   GET /api/stats
// @access  Private (Admin only)
export const getGlobalStats = async (req, res) => {
  try {
    // 1. Run parallel DB queries for optimal performance
    const [
      totalRequests,
      statusCountsRaw,
      totalDeliveredQtyRaw,
      totalRequesters,
      totalVolunteers
    ] = await Promise.all([
      FoodRequest.countDocuments(),
      
      // Group by status count
      FoodRequest.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),

      // Sum of quantity of delivered requests
      FoodRequest.aggregate([
        { $match: { status: { $in: ['collected', 'delivered'] } } },
        { $group: { _id: null, totalQty: { $sum: '$quantity' } } }
      ]),

      // Unique count of users by role
      User.countDocuments({ role: 'requester' }),
      User.countDocuments({ role: 'volunteer' })
    ]);

    // 2. Format status counts into clean object map
    const statusCounts = {
      pending: 0,
      accepted: 0,
      assigned: 0,
      collected: 0,
      delivered: 0,
      rejected: 0
    };

    statusCountsRaw.forEach((item) => {
      if (item._id && statusCounts.hasOwnProperty(item._id)) {
        statusCounts[item._id] = item.count;
      }
    });

    const totalQuantityDelivered = totalDeliveredQtyRaw[0]?.totalQty || 0;

    return res.status(200).json({
      success: true,
      stats: {
        totalRequests,
        statusCounts,
        totalQuantityDelivered,
        totalRequesters,
        totalVolunteers
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: sanitizeErrorMessage(error, 'Failed to fetch global statistics.')
    });
  }
};
