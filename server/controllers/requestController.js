import FoodRequest from '../models/FoodRequest.js';
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
    const foodRequest = await FoodRequest.create({
      requesterId: req.user._id,
      foodType: foodType.trim(),
      quantity: numericQuantity,
      unit: unit.trim(),
      pickupAddress: pickupAddress.trim(),
      location: finalLocation,
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

    const foodRequest = await FoodRequest.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).populate('requesterId', 'name email');

    if (!foodRequest) {
      return res.status(404).json({
        success: false,
        message: 'Food request not found'
      });
    }

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

// ─── Haversine distance (returns km) ─────────────────────────────────────────
const haversineKm = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// Check if two time windows overlap (null = flexible, always overlaps)
const windowsOverlap = (s1, e1, s2, e2) => {
  if (!s1 || !e1 || !s2 || !e2) return true; // flexible window — always overlaps
  return new Date(s1) <= new Date(e2) && new Date(s2) <= new Date(e1);
};

// @desc    Get batch suggestions — clusters of nearby pending requests within 2km & overlapping windows
// @route   GET /api/requests/batch-suggestions
// @access  Private (Admin only)
export const getBatchSuggestions = async (req, res) => {
  try {
    // Only pending requests with valid coordinates
    const requests = await FoodRequest.find({
      status: 'pending',
      'location.lat': { $ne: null },
      'location.lng': { $ne: null }
    })
      .populate('requesterId', 'name email phone')
      .sort({ createdAt: 1 });

    if (requests.length < 2) {
      return res.status(200).json({ success: true, clusters: [] });
    }

    // Greedy clustering: group requests within 2km radius of each other
    const RADIUS_KM = 2;
    const visited = new Set();
    const clusters = [];

    for (let i = 0; i < requests.length; i++) {
      if (visited.has(i)) continue;

      const seed = requests[i];
      const group = [seed];
      visited.add(i);

      for (let j = i + 1; j < requests.length; j++) {
        if (visited.has(j)) continue;

        const candidate = requests[j];
        const dist = haversineKm(
          seed.location.lat,
          seed.location.lng,
          candidate.location.lat,
          candidate.location.lng
        );

        if (
          dist <= RADIUS_KM &&
          windowsOverlap(
            seed.timeWindowStart,
            seed.timeWindowEnd,
            candidate.timeWindowStart,
            candidate.timeWindowEnd
          )
        ) {
          group.push(candidate);
          visited.add(j);
        }
      }

      // Only suggest clusters with >= 2 requests
      if (group.length >= 2) {
        // Compute centroid
        const centLat = group.reduce((s, r) => s + r.location.lat, 0) / group.length;
        const centLng = group.reduce((s, r) => s + r.location.lng, 0) / group.length;

        // Sort by distance from centroid (optimal visiting order)
        const ordered = [...group].sort((a, b) => {
          const dA = haversineKm(centLat, centLng, a.location.lat, a.location.lng);
          const dB = haversineKm(centLat, centLng, b.location.lat, b.location.lng);
          return dA - dB;
        });

        // Compute max spread distance (for display)
        let maxSpreadKm = 0;
        for (let a = 0; a < group.length; a++) {
          for (let b = a + 1; b < group.length; b++) {
            const d = haversineKm(
              group[a].location.lat,
              group[a].location.lng,
              group[b].location.lat,
              group[b].location.lng
            );
            if (d > maxSpreadKm) maxSpreadKm = d;
          }
        }

        // Total quantity (best-effort — only for same unit)
        const units = [...new Set(group.map((r) => r.unit))];
        const totalQuantity =
          units.length === 1
            ? group.reduce((s, r) => s + r.quantity, 0)
            : null;

        clusters.push({
          requestIds: ordered.map((r) => r._id),
          totalItems: group.length,
          totalQuantity,
          unit: units.length === 1 ? units[0] : 'mixed units',
          radiusKm: Math.round(maxSpreadKm * 100) / 100,
          centroid: { lat: centLat, lng: centLng },
          orderedRequests: ordered
        });
      }
    }

    return res.status(200).json({ success: true, clusters });
  } catch (error) {
    const userMessage = sanitizeErrorMessage(
      error,
      'Unable to compute batch suggestions at this time.'
    );
    return res.status(500).json({ success: false, message: userMessage });
  }
};

