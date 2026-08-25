import FoodRequest from '../models/FoodRequest.js';

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
      foodType,
      quantity: numericQuantity,
      unit,
      pickupAddress,
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
    console.error('[Create Food Request Error]', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error creating food request'
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
    console.error('[Get My Food Requests Error]', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching your food requests'
    });
  }
};
