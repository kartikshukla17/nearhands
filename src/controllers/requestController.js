exports.acceptRequest = async (req, res) => {
  try {
    const { id } = req.params;

    // Provider comes from Firebase token middleware
    const firebaseUid = req.user.uid;

    // Fetch provider by UID
    const provider = await ServiceProvider.findOne({
      where: { firebase_uid: firebaseUid }
    });

    if (!provider) {
      return res.status(404).json({ message: 'Provider not found' });
    }

    // Find request assigned to this provider
    const request = await ServiceRequest.findOne({
      where: {
        id,
        provider_id: provider.id,
        status: 'matched'
      }
    });

    if (!request) {
      return res.status(400).json({
        message: "Request is no longer available or already taken by someone else."
      });
    }

    // Check expiry
    if (request.match_expiry && request.match_expiry < new Date()) {
      await request.update({ status: 'expired' });
      return res.status(400).json({ message: "Request expired." });
    }

    // Accept job
    await request.update({
      status: 'accepted'
    });

    return res.status(200).json({
      message: 'Request accepted successfully',
      request
    });

  } catch (error) {
    console.error('Error accepting request:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

exports.declineRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const firebaseUid = req.user.uid;

    const provider = await ServiceProvider.findOne({
      where: { firebase_uid: firebaseUid }
    });

    if (!provider) return res.status(404).json({ message: 'Provider not found' });

    const request = await ServiceRequest.findOne({
      where: {
        id,
        provider_id: provider.id,
        status: 'matched'
      }
    });

    if (!request) {
      return res.status(400).json({
        message: "Request not available for decline or already taken."
      });
    }

    await request.update({
      provider_id: null,  
      status: 'pending'
    });

    return res.status(200).json({
      message: 'Request declined. Searching for next provider.'
    });

  } catch (error) {
    console.error('Error declining request:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};
