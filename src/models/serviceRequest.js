module.exports = (sequelize, DataTypes) => {
    const ServiceRequest = sequelize.define('ServiceRequest', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        user_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id',
            },
        },
        provider_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'service_providers',
                key: 'id',
            },
        },
        category: {
            type: DataTypes.STRING,
        },
        description: {
            type: DataTypes.TEXT,
        },
        summary: {
            type: DataTypes.TEXT,
        },
        media_images: {
            type: DataTypes.JSONB,
            defaultValue: [],
        },
        media_audio: {
            type: DataTypes.JSONB,
            defaultValue: [],
        },
        location_type: {
            type: DataTypes.STRING,
            defaultValue: 'Point',
        },
        location_coordinates: {
            type: DataTypes.GEOMETRY('POINT'),
        },
        otp: {
            type: DataTypes.STRING,
        },
        status: {
            type: DataTypes.STRING,
            defaultValue: 'pending',
        },
        base_price: {
            type: DataTypes.FLOAT,
        },
        extra_charges: {
            type: DataTypes.FLOAT,
            defaultValue: 0,
        },
        payment_status: {
            type: DataTypes.STRING,
            defaultValue: 'pending',
        },
    }, {
        tableName: 'service_requests',
        timestamps: true,
        underscored: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    });

    return ServiceRequest;
};