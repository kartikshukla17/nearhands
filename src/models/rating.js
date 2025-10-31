module.exports = (sequelize, DataTypes) => {
    const Rating = sequelize.define('Rating', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        job_id: {
            type: DataTypes.UUID,
            references: {
                model: 'bookings',
                key: 'id',
            },
        },
        reviewer_id: {
            type: DataTypes.UUID,
            references: {
                model: 'users',
                key: 'id',
            },
        },
        reviewee_id: {
            type: DataTypes.UUID,
            references: {
                model: 'service_providers',
                key: 'id',
            },
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
    }, {
        tableName: 'ratings',
        timestamps: true,
        underscored: true,
        createdAt: 'created_at',
        updatedAt: false,
    });

    return Rating;
};