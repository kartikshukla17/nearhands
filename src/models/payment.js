module.exports = (sequelize, DataTypes) => {
   const payment = sequelize.define('payment', {
       id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
   });

   
    return payment;
   };