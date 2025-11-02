const { ServiceRequest, User, ServiceProvider } = require('../models');

// Create a new service request (POST /api/requests)
exports.create = async (req, res) => {
  try {
    const {
      provider_id,
      category,
      description,
      summary,
      media_images,
      media_audio,
      location_coordinates,
      base_price,
      extra_charges,
    } = req.body;

    // Firebase UID comes from middleware (decoded token)
    const firebase_uid = req.user.uid;

    // Get the user from firebase UID
    const user = await User.findOne({ where: { firebase_uid: firebase_uid } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify service provider exists
    const provider = await ServiceProvider.findByPk(provider_id);
    if (!provider) {
      return res.status(404).json({ message: 'Service provider not found' });
    }

    // Generate OTP (6-digit)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Create the service request
    const serviceRequest = await ServiceRequest.create({
      user_id: user.id,
      provider_id: provider_id || null,
      category,
      description,
      summary,
      media_images: media_images || [],
      media_audio: media_audio || [],
      location_type: 'Point',
      location_coordinates,
      otp,
      status: 'pending',
      base_price,
      extra_charges: extra_charges || 0,
      payment_status: 'pending',
    });

    return res.status(201).json({ 
      message: 'Service request created successfully', 
      request: serviceRequest 
    });
  } catch (error) {
    console.error('Error creating service request:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Get all service requests (GET /api/requests)
exports.getAll = async (req, res) => {
  try {
    const requests = await ServiceRequest.findAll({
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'phone'] },
        { model: ServiceProvider, as: 'provider', attributes: ['id', 'name', 'phone', 'rating'] },
      ],
      order: [['created_at', 'DESC']],
    });
    return res.status(200).json(requests);
  } catch (error) {
    console.error('Error fetching service requests:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Get service request by ID (GET /api/requests/:id)
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const request = await ServiceRequest.findByPk(id, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'phone', 'email'] },
        { model: ServiceProvider, as: 'provider', attributes: ['id', 'name', 'phone', 'email', 'rating'] },
      ],
    });

    if (!request) return res.status(404).json({ message: 'Service request not found' });

    return res.status(200).json(request);
  } catch (error) {
    console.error('Error fetching service request by ID:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Get service requests by user (GET /api/requests/user/me)
exports.getByUser = async (req, res) => {
  try {
    const firebase_uid = req.user.uid;

    // Get the user from firebase UID
    const user = await User.findOne({ where: { firebase_uid: firebase_uid } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const requests = await ServiceRequest.findAll({
      where: { user_id: user.id },
      include: [
        { model: ServiceProvider, as: 'provider', attributes: ['id', 'name', 'phone', 'rating'] },
      ],
      order: [['created_at', 'DESC']],
    });

    return res.status(200).json(requests);
  } catch (error) {
    console.error('Error fetching user service requests:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Get service requests by provider (GET /api/requests/provider/:providerId)
exports.getByProvider = async (req, res) => {
  try {
    const { providerId } = req.params;

    const requests = await ServiceRequest.findAll({
      where: { provider_id: providerId },
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'phone'] },
      ],
      order: [['created_at', 'DESC']],
    });

    return res.status(200).json(requests);
  } catch (error) {
    console.error('Error fetching provider service requests:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Get service requests by status (GET /api/requests/status/:status)
exports.getByStatus = async (req, res) => {
  try {
    const { status } = req.params;

    const requests = await ServiceRequest.findAll({
      where: { status },
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'phone'] },
        { model: ServiceProvider, as: 'provider', attributes: ['id', 'name', 'phone', 'rating'] },
      ],
      order: [['created_at', 'DESC']],
    });

    return res.status(200).json(requests);
  } catch (error) {
    console.error('Error fetching service requests by status:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Update service request (PUT /api/requests/:id)
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const [updated] = await ServiceRequest.update(updateData, { where: { id } });
    
    if (!updated) return res.status(404).json({ message: 'Service request not found' });

    const updatedRequest = await ServiceRequest.findByPk(id, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'phone'] },
        { model: ServiceProvider, as: 'provider', attributes: ['id', 'name', 'phone', 'rating'] },
      ],
    });

    return res.status(200).json({ 
      message: 'Service request updated successfully', 
      request: updatedRequest 
    });
  } catch (error) {
    console.error('Error updating service request:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Update service request status (PATCH /api/requests/:id/status)
exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ['pending', 'matched', 'in-progress', 'completed', 'cancelled'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    const request = await ServiceRequest.findByPk(id);
    if (!request) {
      return res.status(404).json({ message: 'Service request not found' });
    }

    await ServiceRequest.update({ status }, { where: { id } });

    const updatedRequest = await ServiceRequest.findByPk(id);

    return res.status(200).json({ 
      message: 'Status updated successfully', 
      request: updatedRequest 
    });
  } catch (error) {
    console.error('Error updating status:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Update payment status (PATCH /api/requests/:id/payment)
//for razorpay integration will have to rename the path to /api/payment/webhook cause' will be writing the webhook!
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { payment_status } = req.body;

    if (!payment_status) {
      return res.status(400).json({ message: 'Payment status is required' });
    }

    const request = await ServiceRequest.findByPk(id);
    if (!request) {
      return res.status(404).json({ message: 'Service request not found' });
    }

    await ServiceRequest.update({ payment_status }, { where: { id } });

    const updatedRequest = await ServiceRequest.findByPk(id);

    return res.status(200).json({ 
      message: 'Payment status updated successfully', 
      request: updatedRequest 
    });
  } catch (error) {
    console.error('Error updating payment status:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Verify OTP and update status (POST /api/requests/:id/verify-otp)
exports.verifyOTP = async (req, res) => {
  try {
    const { id } = req.params;
    const { otp, type } = req.body; 
    // type = 'start' or 'complete' to specify what OTP is for

    if (!otp) {
      return res.status(400).json({ message: 'OTP is required' });
    }

    const request = await ServiceRequest.findByPk(id);
    if (!request) {
      return res.status(404).json({ message: 'Service request not found' });
    }

    // Check OTP validity
    if (request.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // ✅ Decide next status
    let newStatus;
    if (type === 'start') newStatus = 'in-progress';
    else if (type === 'complete') newStatus = 'completed';
    else return res.status(400).json({ message: 'Invalid OTP type' });

    await ServiceRequest.update({ status: newStatus }, { where: { id } });
    const updatedRequest = await ServiceRequest.findByPk(id);

    return res.status(200).json({
      message: `OTP verified — job marked as ${newStatus}`,
      request: updatedRequest,
    });

  } catch (error) {
    console.error('Error verifying OTP:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};


// Delete service request (DELETE /api/requests/:id)
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if request exists
    const request = await ServiceRequest.findByPk(id);
    if (!request) {
      return res.status(404).json({ message: 'Service request not found' });
    }

    // Prevent deleting if already completed
    if (request.status === 'completed') {
      return res.status(400).json({ message: 'Completed requests cannot be deleted' });
    }

    // Mark as cancelled
    await ServiceRequest.update({ status: 'cancelled' }, { where: { id } });

    const updatedRequest = await ServiceRequest.findByPk(id);

    return res.status(200).json({
      message: 'Service request cancelled successfully',
      request: updatedRequest,
    });
  } catch (error) {
    console.error('Error cancelling service request:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};