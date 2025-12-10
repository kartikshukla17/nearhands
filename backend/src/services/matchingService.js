const { ServiceRequest, ServiceProvider } = require('../models');
const { Op } = require('sequelize');
const { calculateDistanceKm } = require('../utils/geo');

exports.matchRequest = async (rawRequest) => {
  try {
    console.log(`🔍 Attempting to match request: ${rawRequest.id}`);
    
    // STEP 1: try to lock the request (atomic update)
    const locked = await ServiceRequest.update(
      { status: 'searching' },
      {
        where: {
          id: rawRequest.id,
          status: 'pending'  // only lock if still pending
        }
      }
    );

    // If no row updated → someone else already matched it
    if (locked[0] === 0) {
      console.log(`⚠️ Request ${rawRequest.id} already being processed`);
      return null;
    }

    // STEP 2: fetch the locked request
    const request = await ServiceRequest.findByPk(rawRequest.id);
    
    if (!request.category) {
      console.log(`⚠️ Request ${rawRequest.id} has no category, cannot match`);
      await request.update({ status: 'pending' });
      return null;
    }

    // STEP 3: find available providers
    const providers = await ServiceProvider.findAll({
      where: {
        verified: true,
        subscription_active: true,
        services: { [Op.contains]: [request.category] }
      }
    });

    console.log(`📊 Found ${providers.length} providers for category: ${request.category}`);

    if (!providers.length) {
      // No provider found, revert status back to pending
      console.log(`❌ No providers found for category: ${request.category}`);
      await request.update({ status: 'pending' });
      return null;
    }

    // STEP 4: choose nearest provider
    let nearest = null;
    let minDistance = Infinity;

    for (const provider of providers) {
      if (!request.location_coordinates || !provider.location_coordinates) {
        // If no location data, just pick the first provider
        nearest = provider;
        break;
      }
      
      const dist = calculateDistanceKm(
        request.location_coordinates,
        provider.location_coordinates
      );

      if (dist < minDistance) {
        minDistance = dist;
        nearest = provider;
      }
    }

    // STEP 5: assign final match
    await request.update({
      provider_id: nearest.id,
      status: 'matched',
      base_price: 500 // Default base price, can be customized per provider later
    });

    console.log(`✅ Matched request ${request.id} with provider ${nearest.name} (distance: ${minDistance.toFixed(2)} km)`);
    return nearest;

  } catch (err) {
    console.error("❌ Matching error:", err);
    return null;
  }
};
