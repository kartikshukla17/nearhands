module.exports = (sequelize, DataTypes) => {
  const Payment = sequelize.define(
    'Payment',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: true, // optional for direct payments
        references: {
          model: 'users',
          key: 'id',
        },
      },
      provider_id: {
        type: DataTypes.UUID,
        allowNull: false, // always tied to a provider
        references: {
          model: 'service_providers',
          key: 'id',
        },
      },
      job_id: {
        type: DataTypes.UUID,
        allowNull: true, // some payments might be for subscriptions
        references: {
          model: 'service_requests', // <-- correct table
          key: 'id',
        },
      },
      amount: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      method: {
        type: DataTypes.STRING,
        allowNull: false, // required per schema
      },
      status: {
        type: DataTypes.STRING,
        defaultValue: 'pending',
      },
    },
    {
      tableName: 'payments',
      timestamps: true,
      underscored: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  Payment.associate = (models) => {
    Payment.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user',
    });
    Payment.belongsTo(models.ServiceProvider, {
      foreignKey: 'provider_id',
      as: 'provider',
    });
    Payment.belongsTo(models.ServiceRequest, {
      foreignKey: 'job_id',
      as: 'job',
    });
  };

  return Payment;
};
