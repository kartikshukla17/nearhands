const { User } = require('../models');

// Create a new user (POST /api/users)
//here it just creates a user in the db if already exists the return 200 else makes new user and returns 201.
exports.create = async (req, res) => {
  try {
    console.log('📥 Received user creation request');
    console.log('📥 Firebase UID:', req.user?.uid);
    console.log('📥 Request body:', req.body);
    
    const { name, email, phone, location_coordinates } = req.body;

    // Firebase UID comes from middleware (decoded token)
    const firebaseUid = req.user?.uid;
    
    if (!firebaseUid) {
      return res.status(401).json({ message: 'Firebase UID not found. Please authenticate first.' });
    }

    // Check if user already exists
    const existing = await User.findOne({ where: { firebaseUid } });
    if (existing) {
      console.log('✅ User already exists:', existing.id);
      return res.status(200).json({ message: 'User already exists', user: existing });
    }

    // Validate required fields
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Name is required' });
    }
    
    if (!phone || !phone.trim()) {
      return res.status(400).json({ message: 'Phone number is required' });
    }

    // Prepare user data (only include email if provided and not empty)
    const userData = {
      firebaseUid,
      name: name.trim(),
      phone: phone.trim(),
      location_coordinates,
    };
    
    // Only add email if it's provided and not empty
    if (email && email.trim()) {
      userData.email = email.trim();
    }

    console.log('📤 Creating user with data:', { ...userData, location_coordinates: userData.location_coordinates ? '[coordinates]' : undefined });
    
    const user = await User.create(userData);

    console.log('✅ User created successfully:', user.id);
    return res.status(201).json({ message: 'User created successfully', user });
  } catch (error) {
    console.error('❌ Error creating user:', error);
    
    // Handle specific Sequelize errors
    if (error.name === 'SequelizeUniqueConstraintError') {
      const field = error.errors?.[0]?.path || 'field';
      return res.status(400).json({ 
        message: `${field === 'phone' ? 'Phone number' : field === 'email' ? 'Email' : 'A field'} already exists. Please use a different value.`,
        error: error.message 
      });
    }
    
    if (error.name === 'SequelizeValidationError') {
      const validationError = error.errors?.[0]?.message || 'Validation error';
      return res.status(400).json({ 
        message: validationError,
        error: error.message 
      });
    }
    
    return res.status(500).json({ 
      message: 'Internal server error', 
      error: error.message,
      details: process.env.NODE_ENV !== 'production' ? error.stack : undefined
    });
  }
};

// Get all users (GET /api/users)
exports.getAll = async (req, res) => {
  try {
    const users = await User.findAll();
    return res.status(200).json(users);
  } catch (error) {
    console.error(' Error fetching users:', error);
    return res.status(500).json({ message: 'Internal server error', error });
  }
};

// Get user by ID (GET /api/users/:id)
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);

    if (!user) return res.status(404).json({ message: 'User not found' });

    return res.status(200).json(user);
  } catch (error) {
    console.error(' Error fetching user by ID:', error);
    return res.status(500).json({ message: 'Internal server error', error });
  }
};

// Update user (PUT /api/users/:id)
exports.update = async (req, res) => {
  try {
    const { id } = req.params;

    const [updated] = await User.update(req.body, { where: { id } });
    if (!updated) return res.status(404).json({ message: 'User not found' });

    const updatedUser = await User.findByPk(id);
    return res.status(200).json({ message: 'User updated successfully', user: updatedUser });
  } catch (error) {
    console.error(' Error updating user:', error);
    return res.status(500).json({ message: 'Internal server error', error });
  }
};

// Delete user (DELETE /api/users/:id)
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await User.destroy({ where: { id } });

    if (!deleted) return res.status(404).json({ message: 'User not found' });

    return res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error(' Error deleting user:', error);
    return res.status(500).json({ message: 'Internal server error', error });
  }
};

// Get current user profile (GET /api/users/me)
exports.getProfile = async (req, res) => {
  try {
    const firebaseUid = req.user.uid;
    const user = await User.findOne({ where: { firebaseUid } });

    if (!user) return res.status(404).json({ message: 'User not found' });

    return res.status(200).json(user);
  } catch (error) {
    console.error(' Error fetching profile:', error);
    return res.status(500).json({ message: 'Internal server error', error });
  }
};
