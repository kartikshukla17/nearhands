const admin = require('firebase-admin');
const { User } = require('../models');

// In-memory store for OTPs (use Redis in production)
const otpStore = new Map();

// Test user configuration (for development/testing without SMS service)
// Set TEST_PHONE_NUMBER in .env or use default test number
const TEST_PHONE_NUMBER = process.env.TEST_PHONE_NUMBER || '+919999999999';
const TEST_OTP = '123456'; // Fixed OTP for test user

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP via phone number
exports.sendOTP = async (req, res) => {
  try {
    console.log(`📥 Received OTP request from ${req.ip}`);
    console.log(`📥 Request body:`, req.body);
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({ message: 'Phone number is required' });
    }

    // Validate phone number format (basic validation)
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phoneNumber)) {
      return res.status(400).json({ 
        message: 'Invalid phone number format. Please include country code (e.g., +1234567890)' 
      });
    }

    // Check if this is a test user (bypass SMS)
    const isTestUser = phoneNumber === TEST_PHONE_NUMBER;
    const otp = isTestUser ? TEST_OTP : generateOTP();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Store OTP (in production, use Redis with TTL)
    otpStore.set(phoneNumber, {
      otp,
      expiresAt,
      attempts: 0,
    });

    if (isTestUser) {
      console.log(`🧪 TEST USER: ${phoneNumber} - Use OTP: ${TEST_OTP}`);
    } else {
      // TODO: Integrate with SMS service (Twilio, AWS SNS, etc.)
      // For now, log the OTP for development/testing
      console.log(`📱 OTP for ${phoneNumber}: ${otp} (expires in 10 minutes)`);
      
      // In production, send SMS here:
      // await sendSMS(phoneNumber, `Your NearHands verification code is: ${otp}`);
    }

    const responseData = {
      message: 'OTP sent successfully',
      // In development, include OTP for testing (remove in production)
      ...(process.env.NODE_ENV !== 'production' && { otp, phoneNumber }),
    };
    
    console.log(`✅ Sending OTP response for ${phoneNumber}`);
    return res.status(200).json(responseData);
  } catch (error) {
    console.error('❌ Error sending OTP:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Verify OTP and create/return Firebase custom token
exports.verifyOTP = async (req, res) => {
  try {
    const { phoneNumber, otp } = req.body;

    if (!phoneNumber || !otp) {
      return res.status(400).json({ message: 'Phone number and OTP are required' });
    }

    // Check if Firebase Admin is initialized
    if (admin.apps.length === 0) {
      return res.status(500).json({ 
        message: 'Firebase Admin not configured. Please set Firebase credentials in environment variables.' 
      });
    }

    // Check if this is a test user (bypass OTP verification)
    const isTestUser = phoneNumber === TEST_PHONE_NUMBER;
    
    if (isTestUser && otp === TEST_OTP) {
      // Test user with correct OTP - bypass normal verification
      console.log(`🧪 TEST USER: ${phoneNumber} - OTP verified (bypassed)`);
      // Clean up any stored OTP for test user
      otpStore.delete(phoneNumber);
    } else {
      // Normal OTP verification flow
      const storedData = otpStore.get(phoneNumber);

      if (!storedData) {
        return res.status(400).json({ message: 'OTP not found or expired. Please request a new OTP.' });
      }

      // Check if OTP expired
      if (Date.now() > storedData.expiresAt) {
        otpStore.delete(phoneNumber);
        return res.status(400).json({ message: 'OTP expired. Please request a new OTP.' });
      }

      // Check attempts (prevent brute force)
      if (storedData.attempts >= 5) {
        otpStore.delete(phoneNumber);
        return res.status(400).json({ message: 'Too many failed attempts. Please request a new OTP.' });
      }

      // Verify OTP
      if (storedData.otp !== otp) {
        storedData.attempts += 1;
        otpStore.set(phoneNumber, storedData);
        return res.status(400).json({ message: 'Invalid OTP. Please try again.' });
      }

      // OTP verified - remove from store
      otpStore.delete(phoneNumber);
    }

    // Check if user exists in Firebase Auth by phone number
    let firebaseUser;
    try {
      // Try to get user by phone number
      firebaseUser = await admin.auth().getUserByPhoneNumber(phoneNumber);
    } catch (error) {
      // User doesn't exist, create new user
      if (error.code === 'auth/user-not-found') {
        firebaseUser = await admin.auth().createUser({
          phoneNumber: phoneNumber,
        });
      } else {
        throw error;
      }
    }

    // Create custom token for the user
    const customToken = await admin.auth().createCustomToken(firebaseUser.uid, {
      phoneNumber: phoneNumber,
    });

    // Check if user exists in our database
    let user = await User.findOne({ where: { firebaseUid: firebaseUser.uid } });
    
    // If user doesn't exist in database, we'll create it when they complete profile
    // For now, just return the token

    return res.status(200).json({
      message: 'OTP verified successfully',
      customToken,
      firebaseUid: firebaseUser.uid,
      phoneNumber: phoneNumber,
      userExists: !!user,
    });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return res.status(500).json({ 
      message: 'Internal server error', 
      error: error.message 
    });
  }
};

