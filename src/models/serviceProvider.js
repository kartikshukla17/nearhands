module.exports = (sequelize, DataTypes) => {
   const ServiceProvider = sequelize.define('ServiceProvider', {
       id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
   });

   
    return ServiceProvider;
   };