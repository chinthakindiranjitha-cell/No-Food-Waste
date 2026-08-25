import FoodRequest from '../models/FoodRequest.js';

// Helper for user-friendly error messages
const sanitizeErrorMessage = (error, defaultMessage) => {
  console.error('[Backend Request Error]', error);

  if (error.name === 'ValidationError') {
    return 'Please provide valid information for all request fields.';
  }

  if (
    error.name === 'MongooseError' ||
    error.name === 'MongoNetworkError' ||
    (error.message && error.message.includes('buffering timed out'))
  ) {
    return 'Database service is currently experiencing connection delays. Please try again shortly.';
  }

  return defaultMessage || 'An unexpected error occurred. Please try again.';
};

// @desc    Create a new food request
// @route   POST /api/requests
// @access  Private (Requester, Admin)
export const createFoodRequest = async (req, res) => {
  try {
    const {
      foodType,
      quantity,
      unit,
      pickupAddress,
      location,
      timeWindowStart,
      timeWindowEnd,
      photos
    } = req.body;

    // Input validation
    if (!foodType || !quantity || !unit || !pickupAddress) {
      return res.status(400).json({
        success: false,
        message: 'Please provide food type, quantity, unit, and pickup address'
      });
    }

    const numericQuantity = Number(quantity);
    if (isNaN(numericQuantity) || numericQuantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be a positive number'
      });
    }

    // Create food request record
    const foodRequest = await FoodRequest.create({
      requesterId: req.user._id,
      foodType: foodType.trim(),
      quantity: numericQuantity,
      unit: unit.trim(),
      pickupAddress: pickupAddress.trim(),
      location: location || { lat: null, lng: null },
      timeWindowStart: timeWindowStart ? new Date(timeWindowStart) : null,
      timeWindowEnd: timeWindowEnd ? new Date(timeWindowEnd) : null,
      photos: Array.isArray(photos) ? photos : photos ? [photos] : [],
      status: 'pending'
    });

    return res.status(201).json({
      success: true,
      message: 'Food request submitted successfully',
      foodRequest
    });
  } catch (error) {
    const userMessage = sanitizeErrorMessage(
      error,
      'Unable to submit food request right now. Please try again.'
    );
    return res.status(500).json({
      success: false,
      message: userMessage
    });
  }
};

// @desc    Get all food requests in the system (for Admin / Volunteer overview)
// @route   GET /api/requests
// @access  Private (Admin, Volunteer, Requester)
export const getAllFoodRequests = async (req, res) => {
  try {
    const requests = await FoodRequest.find()
      .populate('requesterId', 'name email phone')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: requests.length,
      requests
    });
  } catch (error) {
    const userMessage = sanitizeErrorMessage(
      error,
      'Unable to load food requests at this time.'
    );
    return res.status(500).json({
      success: false,
      message: userMessage
    });
  }
};

// @desc    Get all requests submitted by the logged-in requester
// @route   GET /api/requests/my
// @access  Private (Requester, Admin)
export const getMyFoodRequests = async (req, res) => {
  try {
    const requests = await FoodRequest.find({ requesterId: req.user._id })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: requests.length,
      requests
    });
  } catch (error) {
    const userMessage = sanitizeErrorMessage(
      error,
      'Unable to load your food requests right now. Please try again.'
    );
    return res.status(500).json({
      success: false,
      message: userMessage
    });
  }
};
