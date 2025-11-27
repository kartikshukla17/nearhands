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
          model: 'ServiceProviders',
          key: 'id',
        },
      },
      job_id: {
        type: DataTypes.UUID,
        allowNull: true, // some payments might be for subscriptions
        references: {
          model: 'ServiceRequests', // <-- correct table
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
      is_deleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      transaction_id: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
      },
      idempotency_key: {
        type: DataTypes.STRING,
        unique: true,
      },
      gateway: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      gateway_response: {
        type: DataTypes.JSON,
      },
      parent_transaction_id: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      plan_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      validity_start: {
        type: DataTypes.DATE,
      },
      validity_end: {
        type: DataTypes.DATE,
      },
      payment_type: {
        type: DataTypes.ENUM('FULL', 'EMI', 'SPLIT'),
        defaultValue: 'FULL',
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
