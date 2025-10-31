module.exports = (sequelize, DataTypes) => {
   const rating = sequelize.define('rating', {
       id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
   });

  
    return rating;
   };