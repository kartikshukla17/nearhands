const { Rating, User, ServiceProvider } = require('../models');


// Create a new rating (POST /api/ratings)
// Create a new rating (POST /api/ratings)
exports.create = async (req, res) => {
  try {
    const { job_id, reviewee_id, rating, comment } = req.body;

    // Firebase UID comes from middleware (decoded token)
    const firebaseUid = req.user.uid;

    // 1️⃣ Identify reviewer (User or Provider)
    let reviewer = await User.findOne({ where: { firebaseUid } });
    let reviewer_type = "user";

    if (!reviewer) {
      reviewer = await ServiceProvider.findOne({ where: { firebaseUid } });
      reviewer_type = "provider";
    }

    if (!reviewer) {
      return res.status(404).json({ message: "Reviewer not found" });
    }

    // 2️⃣ Identify reviewee (User or Provider)
    let reviewee = await ServiceProvider.findByPk(reviewee_id);
    let reviewee_type = "provider";

    if (!reviewee) {
      reviewee = await User.findByPk(reviewee_id);
      reviewee_type = "user";
    }

    if (!reviewee) {
      return res.status(404).json({ message: "Reviewee not found" });
    }

    // 3️⃣ Prevent duplicate rating for same job by same reviewer
    const existing = await Rating.findOne({
      where: {
        job_id,
        reviewer_id: reviewer.id,
      },
    });

    if (existing) {
      return res.status(200).json({ message: "Rating already exists", rating: existing });
    }

    // 4️⃣ Validate rating
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    // 5️⃣ Create new rating
    const newRating = await Rating.create({
      job_id,
      reviewer_id: reviewer.id,
      reviewer_type,      // REQUIRED
      reviewee_id,
      reviewee_type,      // REQUIRED
      rating,
      comment,
    });

    // 6️⃣ Update provider's rating
    await updateProviderRating(reviewee_id);

    return res.status(201).json({
      message: "Rating created successfully",
      rating: newRating,
    });

  } catch (error) {
    console.error("Error creating rating:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};


// Get all ratings (GET /api/ratings)
exports.getAll = async (req, res) => {
  try {
    const ratings = await Rating.findAll({
      where: { is_deleted: false },
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
      where: { is_deleted: false },
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
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;
    const ratings = await Rating.findAll({
      where: { is_deleted: false },
      where: { reviewee_id: providerId },
      include: [
        { model: User, as: 'reviewer', attributes: ['id', 'name'] },
      ],
      order: [['created_at', 'DESC']],
      limit,
      offset
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
      where: { is_deleted: false },
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

    await existingRating.update({ rating, comment });

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
    
    // Find the rating
    const rating = await Rating.findByPk(id);
    if (!rating) {
      return res.status(404).json({ message: 'Rating not found' });
    }

    // Soft delete: mark as inactive
    await rating.update({ is_deleted: true });

    // Update provider's average rating excluding deleted ratings
    await updateProviderRating(rating.reviewee_id);

    return res.status(200).json({ message: 'Rating soft-deleted successfully' });
  } catch (error) {
    console.error('Error soft deleting rating:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};


