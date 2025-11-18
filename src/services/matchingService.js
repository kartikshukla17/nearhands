exports.matchRequest = async (rawRequest) => {
  try {
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
      return null;
    }

    // STEP 2: fetch the locked request
    const request = await ServiceRequest.findByPk(rawRequest.id);

    // STEP 3: find available providers (your logic)
    const providers = await ServiceProvider.findAll({
      where: {
        verified: true,
        subscription_active: true,
        is_available: true,
        services: { [Op.contains]: [request.category] }
      }
    });

    if (!providers.length) {
      // No provider found, revert status back to pending
      await request.update({ status: 'pending' });
      return null;
    }

    // STEP 4: choose nearest provider
    let nearest = null;
    let minDistance = Infinity;

    for (const provider of providers) {
      const dist = calculateDistanceKm(
        request.location_coordinates,
        provider.location_coordinates.coordinates
      );

      if (dist < minDistance) {
        minDistance = dist;
        nearest = provider;
      }
    }

    // STEP 5: assign final match
    await request.update({
      provider_id: nearest.id,
      status: 'matched'
    });

    return nearest;

  } catch (err) {
    logger.error("Matching error: %o", err);
    return null;
  }
};
