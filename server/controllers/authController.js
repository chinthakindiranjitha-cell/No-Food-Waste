import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Helper to generate JWT Token
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'fallback_jwt_secret_dev_key',
    { expiresIn: '30d' }
  );
};

// Helper for user-friendly error messages (hides internal DB details from client)
const sanitizeErrorMessage = (error, defaultMessage) => {
  console.error('[Backend Auth Error]', error);

  // Duplicate key (unique constraint)
  if (error.code === 11000) {
    return 'An account with this email address already exists.';
  }

  // Mongoose validation error
  if (error.name === 'ValidationError') {
    return 'Please provide valid information for all required fields.';
  }

  // Database connection / buffering / network error
  if (
    error.name === 'MongooseError' ||
    error.name === 'MongoNetworkError' ||
    (error.message && error.message.includes('buffering timed out'))
  ) {
    return 'Database service is currently experiencing connection delays. Please try again shortly.';
  }

  return defaultMessage || 'An unexpected error occurred. Please try again.';
};

// @desc    Register a new user (Does NOT issue JWT token; user must log in)
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, phone, location } = req.body;

    const normalizedName = name ? name.trim() : '';
    const normalizedEmail = email ? email.trim().toLowerCase() : '';

    // Validation
    if (!normalizedName || !normalizedEmail || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Check if user exists
    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists'
      });
    }

    // Validate role if provided
    const validRoles = ['requester', 'volunteer', 'admin'];
    const userRole = role && validRoles.includes(role) ? role : 'requester';

    // Create user
    const user = await User.create({
      name: normalizedName,
      email: normalizedEmail,
      password,
      role: userRole,
      phone: phone || '',
      location: location || { lat: null, lng: null }
    });

    if (user) {
      return res.status(201).json({
        success: true,
        message: 'Registration successful! Please sign in with your credentials.',
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          createdAt: user.createdAt
        }
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid user data received. Please check your inputs.'
      });
    }
  } catch (error) {
    const userMessage = sanitizeErrorMessage(
      error,
      'Unable to complete registration. Please try again.'
    );
    return res.status(500).json({
      success: false,
      message: userMessage
    });
  }
};

// @desc    Authenticate a user & set HTTP-Only cookie token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const normalizedEmail = email ? email.trim().toLowerCase() : '';

    // Validation
    if (!normalizedEmail || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Check for user
    const user = await User.findOne({ email: normalizedEmail }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password match
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate token
    const token = generateToken(user._id);

    // Cookie options: HTTP-Only cookie for maximum security against XSS
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    };

    // Send HTTP-Only Cookie
    res.cookie('token', token, cookieOptions);

    return res.status(200).json({
      success: true,
      message: 'Signed in successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        location: user.location,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    const userMessage = sanitizeErrorMessage(
      error,
      'Unable to log in at this time. Please try again.'
    );
    return res.status(500).json({
      success: false,
      message: userMessage
    });
  }
};

// @desc    Log out current user & clear HTTP-Only cookie
// @route   POST /api/auth/logout
// @access  Public / Private
export const logoutUser = async (req, res) => {
  try {
    res.cookie('token', '', {
      httpOnly: true,
      expires: new Date(0),
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    });

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('[Logout Error]', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to complete logout. Please try again.'
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found'
      });
    }
    return res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    const userMessage = sanitizeErrorMessage(
      error,
      'Unable to fetch user profile.'
    );
    return res.status(500).json({
      success: false,
      message: userMessage
    });
  }
};
