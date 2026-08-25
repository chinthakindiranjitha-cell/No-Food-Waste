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

// @desc    Register a new user (Does NOT issue JWT token; user must log in)
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, phone, location } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password'
      });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Validate role if provided
    const validRoles = ['requester', 'volunteer', 'admin'];
    const userRole = role && validRoles.includes(role) ? role : 'requester';

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: userRole,
      phone: phone || '',
      location: location || { lat: null, lng: null }
    });

    if (user) {
      // NOTE: No JWT token generated here per design feedback.
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
        message: 'Invalid user data received'
      });
    }
  } catch (error) {
    console.error('[Register Error]', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error during registration'
    });
  }
};

// @desc    Authenticate a user & set HTTP-Only cookie token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password match
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
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
    console.error('[Login Error]', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error during login'
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
      message: 'Server error during logout'
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    return res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    console.error('[GetMe Error]', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching user profile'
    });
  }
};
