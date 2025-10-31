//it acts as a bridge to connect all the models and sequelize instance
//it connects sequelize with the DB, loads all the models, and sets up associations between them.
//exports single db object containing everything

'use strict';
//imports and setup
const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
//environment setup and config
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.js')[env];
const db = {};

//create sequelize instance
let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

//auto import all models in the models directory
//reads every file synchronously, filters out non-JS files and this index file itself, then imports each model and adds it to the db object.
fs
  .readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });


  //set up associations if defined
  //If a model defines relationships (like User.hasMany(Jobs)), it runs them here.
  //This ensures relationships are setup after all models are loaded.
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

//export the db object containing all models and the sequelize instance
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
