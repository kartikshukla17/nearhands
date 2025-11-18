const { ServiceRequest } = require('../models');
const { Op } = require('sequelize');
const { matchRequest } = require('../services/matchingService');
const logger = require('../utils/logger');

async function runMatching() {
  try {
    // 1️⃣ Handle expired matches
    const expired = await ServiceRequest.findAll({
      where: {
        status: 'matched',
        match_expiry: { [Op.lt]: new Date() }
      }
    });

    for (const req of expired) {
      logger.info(`⏳ Match expired for request ${req.id}. Resetting to pending.`);

      await req.update({
        status: 'pending',
        provider_id: null,
        match_expiry: null
      });

      // Now this request will be picked up again in the next matching cycle
    }

    // 2️⃣ Now match pending requests
    const pendingRequests = await ServiceRequest.findAll({
      where: { status: 'pending' }
    });

    for (const req of pendingRequests) {
      await matchRequest(req);
    }

  } catch (err) {
    logger.error('Worker / Matching Error:', err);
  }
}

setInterval(runMatching, 10000);
logger.info("Matching Worker Started...");
