const { ServiceRequest, ServiceProvider, User } = require('../models');

/**
 * Notify provider when a request is matched to them
 * This service handles provider notifications when they are assigned to a service request
 */
exports.notifyProviderOfMatch = async (requestId, providerId) => {
  try {
    const request = await ServiceRequest.findByPk(requestId, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'phone'] },
      ],
    });

    const provider = await ServiceProvider.findByPk(providerId);

    if (!request || !provider) {
      console.error(`❌ Cannot notify: Request ${requestId} or Provider ${providerId} not found`);
      return false;
    }

    // Log notification (in production, this could send push notifications, emails, SMS, etc.)
    console.log(`🔔 NOTIFICATION: Provider ${provider.name} (${provider.id}) has been matched with request ${requestId}`);
    console.log(`   Customer: ${request.user?.name || 'Unknown'}`);
    console.log(`   Category: ${request.category || 'N/A'}`);
    console.log(`   Status: ${request.status}`);

    // In the future, you can add:
    // - Push notifications via Firebase Cloud Messaging
    // - SMS notifications
    // - Email notifications
    // - WebSocket real-time updates

    return true;
  } catch (error) {
    console.error('Error notifying provider:', error);
    return false;
  }
};

/**
 * Get unread/new requests for a provider
 * A request is considered "new" if it was matched recently (within last 24 hours)
 * and hasn't been started yet
 */
exports.getNewRequestsForProvider = async (providerId) => {
  try {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const { Op } = require('sequelize');
    const newRequests = await ServiceRequest.findAll({
      where: {
        provider_id: providerId,
        status: 'matched',
        updated_at: {
          [Op.gte]: oneDayAgo,
        },
      },
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'phone', 'email'] },
      ],
      order: [['updated_at', 'DESC']],
    });

    return newRequests;
  } catch (error) {
    console.error('Error getting new requests for provider:', error);
    return [];
  }
};

