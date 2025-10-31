module.exports = (sequelize, DataTypes) => {
   const ServiceRequest = sequelize.define('ServiceRequest', {
       id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
   });

   
    return ServiceRequest;
   };