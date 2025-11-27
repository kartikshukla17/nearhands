module.exports = (sequelize, DataTypes) => {
  const Rating = sequelize.define(
    'Rating',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      job_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'ServiceRequests', // ✅ correct table
          key: 'id',
        },
      },
      reviewer_id: {
        type: DataTypes.UUID,
        allowNull: false,
        comment: 'ID of user or provider who gives rating',
      },
      reviewee_id: {
        type: DataTypes.UUID,
        allowNull: false,
        comment: 'ID of user or provider who receives rating',
      },
      reviewer_type: {
        type: DataTypes.ENUM('user', 'provider'),
        allowNull: false,
      },
      reviewee_type: {
        type: DataTypes.ENUM('user', 'provider'),
        allowNull: false,
      },
      rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
          max: 5,
        },
      },
      comment: {
        type: DataTypes.TEXT,
      },
      is_deleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },

    },
    {
      tableName: 'ratings',
      timestamps: true,
      underscored: true,
      createdAt: 'created_at',
      updatedAt: false,
    }
  );

  Rating.associate = (models) => {
    // Job reference
    Rating.belongsTo(models.ServiceRequest, {
      foreignKey: 'job_id',
      as: 'job',
    });
    Rating.belongsTo(models.User, { foreignKey: 'reviewer_id', as: 'reviewer' });
    Rating.belongsTo(models.ServiceProvider, { foreignKey: 'reviewee_id', as: 'reviewee' });


    // No strict foreign key for reviewer/reviewee because they can belong to either table
    // You’ll handle logic in your backend using reviewer_type / reviewee_type
  };

  return Rating;
};
