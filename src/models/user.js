module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        firebaseUid: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        } ,
        email: {
            type: DataTypes.STRING,
            unique: true,
            validate: { isEmail: true },
        },
        phone: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false,
        },
        password: DataTypes.STRING,
        location_type: {
            type: DataTypes.STRING,
            defaultValue: 'Point',
        },
        location_coordinates: {
            type: DataTypes.ARRAY(DataTypes.FLOAT),
            Comment: '[longitude, latitude]',
        },
        rating: {
            type: DataTypes.FLOAT,
            defaultValue: 0,
        },
        total_services: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        updated_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    }, {
        tableName: 'users',
        timestamps: true,
    });

    
    return User;
};

