import FoodRequest, { calculateExpiresAt, getUrgencyLevel } from '../models/FoodRequest.js';
import Assignment from '../models/Assignment.js';
import User from '../models/User.js';

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

// Helper to ensure urgency fields and virtual getters are present
const ensureRequestUrgency = (doc) => {
  if (!doc) return doc;
  const obj = doc.toObject ? doc.toObject({ virtuals: true }) : { ...doc };
  if (!obj.foodCategory) obj.foodCategory = 'cooked';
  if (!obj.expiresAt) {
    obj.expiresAt = calculateExpiresAt(obj.foodCategory, obj.createdAt || new Date());
  }
  obj.urgencyLevel = getUrgencyLevel(obj);
  return obj;
};

// @desc    Create a new food request
// @route   POST /api/requests
// @access  Private (Requester, Admin)
export const createFoodRequest = async (req, res) => {
  try {
    const {
      foodType,
      foodCategory,
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

    const validCategories = ['cooked', 'perishable', 'packaged'];
    const category = foodCategory && validCategories.includes(foodCategory) ? foodCategory : 'cooked';
    const expiresAt = calculateExpiresAt(category);

    let finalLocation = location || { lat: null, lng: null };

    // Geocode address using OpenStreetMap Nominatim API if no explicit location provided
    if (!finalLocation.lat && !finalLocation.lng && pickupAddress) {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(pickupAddress.trim())}&limit=1`,
          {
            headers: {
              'User-Agent': 'FoodWastageApp/1.0 (Contact: support@foodwastage.local)'
            }
          }
        );
        const data = await response.json();
        if (data && data.length > 0) {
          finalLocation = {
            lat: parseFloat(data[0].lat),
            lng: parseFloat(data[0].lon) // Nominatim returns 'lon' instead of 'lng'
          };
        }
      } catch (geocodeError) {
        console.error('[Geocoding Error]:', geocodeError);
        // Silently proceed if geocoding fails so user isn't blocked from submitting
      }
    }

    // Create food request record
    const foodRequestDoc = await FoodRequest.create({
      requesterId: req.user._id,
      foodType: foodType.trim(),
      foodCategory: category,
      expiresAt,
      quantity: numericQuantity,
      unit: unit.trim(),
      pickupAddress: pickupAddress.trim(),
      location: finalLocation,
      timeWindowStart: timeWindowStart ? new Date(timeWindowStart) : null,
      timeWindowEnd: timeWindowEnd ? new Date(timeWindowEnd) : null,
      photos: Array.isArray(photos) ? photos : photos ? [photos] : [],
      status: 'pending'
    });

    const foodRequest = ensureRequestUrgency(foodRequestDoc);

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

// @desc    Get all food requests (admin: filterable by status)
// @route   GET /api/requests
// @access  Private (Admin, Volunteer, Requester)
export const getAllFoodRequests = async (req, res) => {
  try {
    const filter = {};

    // Allow admin/volunteer to filter by status via ?status=pending etc.
    if (req.query.status && req.query.status !== 'all') {
      filter.status = req.query.status;
    }

    const requests = await FoodRequest.find(filter)
      .populate('requesterId', 'name email phone')
      .sort({ createdAt: -1 });

    const formattedRequests = requests.map(ensureRequestUrgency);

    return res.status(200).json({
      success: true,
      count: formattedRequests.length,
      requests: formattedRequests
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

    const formattedRequests = requests.map(ensureRequestUrgency);

    return res.status(200).json({
      success: true,
      count: formattedRequests.length,
      requests: formattedRequests
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

// @desc    Get critical pending/accepted food requests sorted by soonest expiry
// @route   GET /api/requests/critical
// @access  Private (Admin only)
export const getCriticalRequests = async (req, res) => {
  try {
    const requests = await FoodRequest.find({
      status: { $in: ['pending', 'accepted'] }
    }).populate('requesterId', 'name email phone');

    const formatted = requests.map(ensureRequestUrgency);
    const criticalRequests = formatted.filter((r) => r.urgencyLevel === 'critical');

    // Sort by soonest expiry (ascending)
    criticalRequests.sort((a, b) => new Date(a.expiresAt) - new Date(b.expiresAt));

    return res.status(200).json({
      success: true,
      count: criticalRequests.length,
      requests: criticalRequests
    });
  } catch (error) {
    const userMessage = sanitizeErrorMessage(
      error,
      'Unable to load critical food requests.'
    );
    return res.status(500).json({
      success: false,
      message: userMessage
    });
  }
};

// @desc    Update request status (accept / reject / etc.)
// @route   PATCH /api/requests/:id/status
// @access  Private (Admin only)
export const updateRequestStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'accepted', 'rejected', 'assigned', 'collected', 'delivered'];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${validStatuses.join(', ')}`
      });
    }

    const foodRequestDoc = await FoodRequest.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).populate('requesterId', 'name email');

    if (!foodRequestDoc) {
      return res.status(404).json({
        success: false,
        message: 'Food request not found'
      });
    }

    const foodRequest = ensureRequestUrgency(foodRequestDoc);

    return res.status(200).json({
      success: true,
      message: `Request status updated to "${status}"`,
      foodRequest
    });
  } catch (error) {
    const userMessage = sanitizeErrorMessage(
      error,
      'Unable to update request status. Please try again.'
    );
    return res.status(500).json({
      success: false,
      message: userMessage
    });
  }
};

// @desc    Assign a volunteer to a food request (creates Assignment record)
// @route   POST /api/requests/:id/assign
// @access  Private (Admin only)
export const assignVolunteer = async (req, res) => {
  try {
    const { volunteerId } = req.body;

    if (!volunteerId) {
      return res.status(400).json({
        success: false,
        message: 'Volunteer ID is required'
      });
    }

    const foodRequest = await FoodRequest.findById(req.params.id);
    if (!foodRequest) {
      return res.status(404).json({
        success: false,
        message: 'Food request not found'
      });
    }

    const volunteer = await User.findOne({ _id: volunteerId, role: 'volunteer' });
    if (!volunteer) {
      return res.status(404).json({
        success: false,
        message: 'Volunteer not found'
      });
    }

    // Create the assignment record
    const assignment = await Assignment.create({
      requestId: foodRequest._id,
      volunteerId: volunteer._id,
      status: 'assigned'
    });

    // Update food request status to assigned
    foodRequest.status = 'assigned';
    await foodRequest.save();

    const populated = await assignment.populate([
      { path: 'requestId', select: 'foodType pickupAddress status' },
      { path: 'volunteerId', select: 'name email phone' }
    ]);

    return res.status(201).json({
      success: true,
      message: `Volunteer "${volunteer.name}" assigned successfully`,
      assignment: populated
    });
  } catch (error) {
    const userMessage = sanitizeErrorMessage(
      error,
      'Unable to assign volunteer. Please try again.'
    );
    return res.status(500).json({
      success: false,
      message: userMessage
    });
  }
};

