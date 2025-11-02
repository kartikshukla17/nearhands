// providerController.js
const { ServiceProvider } = require('../models');

// Create a new service provider (POST /api/providers)
// Creates provider in DB if already exists returns 200, else makes new provider and returns 201
exports.create = async (req, res) => {
  try {
    const { 
      name, 
      email, 
      phone, 
      services, 
      custom_services,
      location_coordinates,
      document_aadhaar,
      document_selfie_url,
      document_additional_docs
    } = req.body;
    
    // Firebase UID comes from middleware (decoded token)
    const firebase_uid = req.user.uid;
    
    // Check if provider already exists
    const existing = await ServiceProvider.findOne({ where: { firebase_uid } });
    if (existing) {
      return res.status(200).json({ message: 'Provider already exists', provider: existing });
    }
    
    const provider = await ServiceProvider.create({
      firebase_uid,
      name,
      email,
      phone,
      services: services || [],
      custom_services: custom_services || [],
      location_coordinates,
      document_aadhaar,
      document_selfie_url,
      document_additional_docs: document_additional_docs || [],
    });
    
    return res.status(201).json({ message: 'Provider created successfully', provider });
  } catch (error) {
    console.error('Error creating provider:', error);
    return res.status(500).json({ message: 'Internal server error', error });
  }
};

// Get all service providers (GET /api/providers)
exports.getAll = async (req, res) => {
  try {
    const providers = await ServiceProvider.findAll(
      {where: { verified:true, is_deleted: false }}
    );
    return res.status(200).json(providers);
  } catch (error) {
    console.error('Error fetching providers:', error);
    return res.status(500).json({ message: 'Internal server error', error });
  }
};

// Get service provider by ID (GET /api/providers/:id)
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const provider = await ServiceProvider.findByPk(id);
    if (!provider) return res.status(404).json({ message: 'Provider not found' });
    return res.status(200).json(provider);
  } catch (error) {
    console.error('Error fetching provider by ID:', error);
    return res.status(500).json({ message: 'Internal server error', error });
  }
};

// Get verified providers (GET /api/providers/verified)
exports.getVerified = async (req, res) => {
  try {
    const providers = await ServiceProvider.findAll({ 
      where: { verified: true , is_deleted: false} 
    });
    return res.status(200).json(providers);
  } catch (error) {
    console.error('Error fetching verified providers:', error);
    return res.status(500).json({ message: 'Internal server error', error });
  }
};

// Get providers by service (GET /api/providers/service/:service)
exports.getByService = async (req, res) => {
  try {
    const { service } = req.params;
    const { Sequelize, where } = require('sequelize');
    
    // Search in services JSONB array
    const providers = await ServiceProvider.findAll({
      where: Sequelize.literal(`services @> '["${service}"]'`),
      is_deleted: false
    });
    
    return res.status(200).json(providers);
  } catch (error) {
    console.error('Error fetching providers by service:', error);
    return res.status(500).json({ message: 'Internal server error', error });
  }
};

// Get providers with active subscription (GET /api/providers/subscribed)
exports.getSubscribed = async (req, res) => {
  try {
    const providers = await ServiceProvider.findAll({ 
      where: { subscription_active: true, is_deleted: false } 
    });
    return res.status(200).json(providers);
  } catch (error) {
    console.error('Error fetching subscribed providers:', error);
    return res.status(500).json({ message: 'Internal server error', error });
  }
};

// Update service provider (PUT /api/providers/:id)
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const [updated] = await ServiceProvider.update(req.body, { where: { id } });
    if (!updated) return res.status(404).json({ message: 'Provider not found' });
    
    const updatedProvider = await ServiceProvider.findByPk(id);
    return res.status(200).json({ 
      message: 'Provider updated successfully', 
      provider: updatedProvider 
    });
  } catch (error) {
    console.error('Error updating provider:', error);
    return res.status(500).json({ message: 'Internal server error', error });
  }
};

// Update provider verification status (PUT /api/providers/:id/verify)
exports.updateVerification = async (req, res) => {
  try {
    const { id } = req.params;
    const { verified } = req.body;
    
    const provider = await ServiceProvider.findByPk(id);
    if (!provider) return res.status(404).json({ message: 'Provider not found' });
    
    await provider.update({ verified });
    
    return res.status(200).json({ 
      message: `Provider ${verified ? 'verified' : 'unverified'} successfully`, 
      provider 
    });
  } catch (error) {
    console.error('Error updating verification:', error);
    return res.status(500).json({ message: 'Internal server error', error });
  }
};

// Update provider subscription (PUT /api/providers/:id/subscription)
exports.updateSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const { subscription_plan, subscription_active, subscription_expiry_date } = req.body;
    
    const provider = await ServiceProvider.findByPk(id);
    if (!provider) return res.status(404).json({ message: 'Provider not found' });
    
    const expiry = subscription_plan === 'daily'
      ? new Date(Date.now() + 24 * 60 * 60 * 1000)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await provider.update({
      subscription_plan,
      subscription_active: true,
      subscription_expiry_date: expiry,
    });
    
    return res.status(200).json({ 
      message: 'Subscription updated successfully', 
      provider 
    });
  } catch (error) {
    console.error('Error updating subscription:', error);
    return res.status(500).json({ message: 'Internal server error', error });
  }
};

// Delete service provider (DELETE /api/providers/:id)
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;

    const provider = await ServiceProvider.findByPk(id);

    if (!provider) {
      return res.status(404).json({ message: 'Provider not found' });
    }

    if (provider.is_deleted) {
      return res.status(400).json({ message: 'Provider already deleted' });
    }

    await provider.update({ is_deleted: true });

    return res.status(200).json({ message: 'Provider soft-deleted successfully' });
  } catch (error) {
    console.error('Error deleting provider:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};


// Get current provider profile (GET /api/providers/me)
exports.getProfile = async (req, res) => {
  try {
    const firebase_uid = req.user.uid;
    const provider = await ServiceProvider.findOne({ where: { firebase_uid } });
    if (!provider) return res.status(404).json({ message: 'Provider not found' });
    return res.status(200).json(provider);
  } catch (error) {
    console.error('Error fetching profile:', error);
    return res.status(500).json({ message: 'Internal server error', error });
  }
};