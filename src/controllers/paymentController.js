// paymentController.js
const { Payment, ServiceRequest, User, ServiceProvider } = require('../models');

// Create a new payment (POST /api/payments)
exports.create = async (req, res) => {
  try {
    const idempotencyKey = req.headers['idempotency-key'];
    if (!idempotencyKey) {
      return res.status(400).json({ message: 'Idempotency key required' });
    }

    // Check for existing payment with same idempotency key
    const existingPayment = await Payment.findOne({ 
      where: { idempotency_key: idempotencyKey } 
    });
    if (existingPayment) {
      return res.status(200).json({ payment: existingPayment });
    }

    // Queue payment processing
    await paymentQueue.add('CREATE_PAYMENT', {
      ...req.body,
      idempotency_key: idempotencyKey
    });

    return res.status(202).json({ 
      message: 'Payment processing initiated' 
    });
  } catch (error) {
    console.error('Error initiating payment:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Get all payments (GET /api/payments)
exports.getAll = async (req, res) => {
  try {
    const payments = await Payment.findAll({ where: { is_deleted: false } });
    return res.status(200).json(payments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    return res.status(500).json({ message: 'Internal server error', error });
  }
};

// Get payment by ID (GET /api/payments/:id)
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const payment = await Payment.findByPk(id, { where: { is_deleted: false } });
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    return res.status(200).json(payment);
  } catch (error) {
    console.error('Error fetching payment by ID:', error);
    return res.status(500).json({ message: 'Internal server error', error });
  }
};

// Get payments by user ID (GET /api/payments/user/:user_id)
exports.getByUserId = async (req, res) => {
  try {
    const { user_id } = req.params;
    const payments = await Payment.findAll({ where: { user_id, is_deleted: false } });
    return res.status(200).json(payments);
  } catch (error) {
    console.error('Error fetching payments by user ID:', error);
    return res.status(500).json({ message: 'Internal server error', error });
  }
};

// Get payments by provider ID (GET /api/payments/provider/:provider_id)
exports.getByProviderId = async (req, res) => {
  try {
    const { provider_id } = req.params;
    const payments = await Payment.findAll({ where: { provider_id, is_deleted:false } });
    return res.status(200).json(payments);
  } catch (error) {
    console.error('Error fetching payments by provider ID:', error);
    return res.status(500).json({ message: 'Internal server error', error });
  }
};

// Get payment by job ID (GET /api/payments/job/:job_id)
exports.getByJobId = async (req, res) => {
  try {
    const { job_id } = req.params;
    const payment = await Payment.findOne({ where: { job_id, is_deleted: false } });
    if (!payment) return res.status(404).json({ message: 'Payment not found for this job' });
    return res.status(200).json(payment);
  } catch (error) {
    console.error('Error fetching payment by job ID:', error);
    return res.status(500).json({ message: 'Internal server error', error });
  }
};

// Update payment (PUT /api/payments/:id)
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const [updated] = await Payment.update(req.body, { where: { id,is_deleted: false } });
    if (!updated) return res.status(404).json({ message: 'Payment not found' });
    
    const updatedPayment = await Payment.findByPk(id);
    
    // Update job payment status if payment status changed to completed
    if (req.body.status === 'completed') {
      const job = await ServiceRequest.findByPk(updatedPayment.job_id);
      if (job) {
        await job.update({ payment_status: 'completed' });
      }
    }

    return res.status(200).json({ message: 'Payment updated successfully', payment: updatedPayment });
  } catch (error) {
    console.error('Error updating payment:', error);
    return res.status(500).json({ message: 'Internal server error', error });
  }
};

// Delete payment (DELETE /api/payments/:id)
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const payment = await Payment.findByPk(id);
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    if (payment.is_deleted) return res.status(400).json({ message: 'Payment already deleted' });

    await payment.update({ is_deleted: true });

    return res.status(200).json({ message: 'Payment soft-deleted successfully' });
  } catch (error) {
    console.error('Error deleting payment:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};


// Get current user's payments (GET /api/payments/me)
exports.getMyPayments = async (req, res) => {
  try {
    const firebase_uid = req.user.uid;

    let actor = await User.findOne({ where: { firebase_uid } });
    let whereClause = {};

    if (actor) {
      whereClause.user_id = actor.id;
    } else {
      actor = await ServiceProvider.findOne({ where: { firebase_uid } });
      if (!actor) return res.status(404).json({ message: 'Account not found' });
      whereClause.provider_id = actor.id;
    }

    const payments = await Payment.findAll({ where: whereClause });
    return res.status(200).json(payments);
  } catch (error) {
    console.error('Error fetching my payments:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};
