const { Rating, User, ServiceProvider } = require('../models');

// Create a new rating (POST /api/ratings)
exports.create = async (req, res) => {
  try {
    const { job_id, reviewee_id, rating, comment } = req.body;

    // Firebase UID comes from middleware (decoded token)
    const firebaseUid = req.user.uid;

    // Get the user (reviewer) from firebase UID
    const reviewer = await User.findOne({ where: { firebase_uid: firebaseUid } });
    if (!reviewer) {
      return res.status(404).json({ message: 'Reviewer not found' });
    }

    // Check if rating already exists for this job
    const existing = await Rating.findOne({ 
      where: { 
        job_id,
        reviewer_id: reviewer.id 
      } 
    });
    
    if (existing) {
      return res.status(200).json({ message: 'Rating already exists', rating: existing });
    }

    // Validate rating value
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    // Create the rating
    const newRating = await Rating.create({
      job_id,
      reviewer_id: reviewer.id,
      reviewee_id,
      rating,
      comment,
    });

    // Update service provider's average rating
    await updateProviderRating(reviewee_id);

    return res.status(201).json({ message: 'Rating created successfully', rating: newRating });
  } catch (error) {
    console.error('Error creating rating:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Get all ratings (GET /api/ratings)
exports.getAll = async (req, res) => {
  try {
    const ratings = await Rating.findAll({
      include: [
        { model: User, as: 'reviewer', attributes: ['id', 'name'] },
        { model: ServiceProvider, as: 'reviewee', attributes: ['id', 'name'] },
      ],
    });
    return res.status(200).json(ratings);
  } catch (error) {
    console.error('Error fetching ratings:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Get rating by ID (GET /api/ratings/:id)
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const rating = await Rating.findByPk(id, {
      include: [
        { model: User, as: 'reviewer', attributes: ['id', 'name'] },
        { model: ServiceProvider, as: 'reviewee', attributes: ['id', 'name'] },
      ],
    });

    if (!rating) return res.status(404).json({ message: 'Rating not found' });

    return res.status(200).json(rating);
  } catch (error) {
    console.error('Error fetching rating by ID:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Get ratings for a specific service provider (GET /api/ratings/provider/:providerId)
exports.getByProvider = async (req, res) => {
  try {
    const { providerId } = req.params;
    const ratings = await Rating.findAll({
      where: { reviewee_id: providerId },
      include: [
        { model: User, as: 'reviewer', attributes: ['id', 'name'] },
      ],
      order: [['created_at', 'DESC']],
    });

    return res.status(200).json(ratings);
  } catch (error) {
    console.error('Error fetching ratings by provider:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Get ratings by a specific user (GET /api/ratings/user/:userId)
exports.getByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const ratings = await Rating.findAll({
      where: { reviewer_id: userId },
      include: [
        { model: ServiceProvider, as: 'reviewee', attributes: ['id', 'name'] },
      ],
      order: [['created_at', 'DESC']],
    });

    return res.status(200).json(ratings);
  } catch (error) {
    console.error('Error fetching ratings by user:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Update rating (PUT /api/ratings/:id)
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    // Validate rating value if provided
    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const existingRating = await Rating.findByPk(id);
    if (!existingRating) {
      return res.status(404).json({ message: 'Rating not found' });
    }

    const [updated] = await Rating.update(
      { rating, comment },
      { where: { id } }
    );

    if (!updated) return res.status(404).json({ message: 'Rating not found' });

    const updatedRating = await Rating.findByPk(id);

    // Update service provider's average rating
    await updateProviderRating(existingRating.reviewee_id);

    return res.status(200).json({ message: 'Rating updated successfully', rating: updatedRating });
  } catch (error) {
    console.error('Error updating rating:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Delete rating (DELETE /api/ratings/:id)
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    
    const rating = await Rating.findByPk(id);
    if (!rating) {
      return res.status(404).json({ message: 'Rating not found' });
    }

    const reviewee_id = rating.reviewee_id;
    
    const deleted = await Rating.destroy({ where: { id } });

    if (!deleted) return res.status(404).json({ message: 'Rating not found' });

    // Update service provider's average rating after deletion
    await updateProviderRating(reviewee_id);

    return res.status(200).json({ message: 'Rating deleted successfully' });
  } catch (error) {
    console.error('Error deleting rating:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Helper function to update provider's average rating
async function updateProviderRating(providerId) {
  try {
    const ratings = await Rating.findAll({
      where: { reviewee_id: providerId },
      attributes: ['rating'],
    });

    if (ratings.length === 0) {
      await ServiceProvider.update(
        { rating: 0 },
        { where: { id: providerId } }
      );
      return;
    }

    const totalRating = ratings.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = totalRating / ratings.length;

    await ServiceProvider.update(
      { rating: averageRating },
      { where: { id: providerId } }
    );
  } catch (error) {
    console.error('Error updating provider rating:', error);
  }
}