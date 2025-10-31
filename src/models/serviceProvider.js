module.exports = (sequelize, DataTypes) => {
    const ServiceProvider = sequelize.define('ServiceProvider', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        firebase_uid: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        phone: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            validate: { isEmail: true },
        },
        services: {
            type: DataTypes.JSONB,
            allowNull: false,
            defaultValue: [],
        },
        custom_services: {
            type: DataTypes.JSONB,
            defaultValue: [],
        },
        subscription_plan: {
            type: DataTypes.STRING,
        },
        subscription_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        subscription_expiry_date: {
            type: DataTypes.DATE,
        },
        verified: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        document_aadhaar: {
            type: DataTypes.STRING,
        },
        document_selfie_url: {
            type: DataTypes.STRING,
        },
        document_additional_docs: {
            type: DataTypes.JSONB,
            defaultValue: [],
        },
        rating: {
            type: DataTypes.FLOAT,
            defaultValue: 0,
        },
        total_jobs: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        location_type: {
            type: DataTypes.STRING,
            defaultValue: 'Point',
        },
        location_coordinates: {
            type: DataTypes.GEOMETRY('POINT'),
        },
    }, {
        tableName: 'service_providers',
        timestamps: true,
        underscored: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    });

    return ServiceProvider;
};