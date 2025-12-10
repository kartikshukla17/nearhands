// Script to fix the provider_id column to allow NULL values
// Run this with: node fix-database.js

const { sequelize } = require('./src/models');

(async () => {
  try {
    console.log('🔧 Fixing database schema...');
    
    // Connect to database
    await sequelize.authenticate();
    console.log('✅ Database connected');
    
    // Alter the provider_id column to allow NULL
    await sequelize.query(`
      ALTER TABLE "ServiceRequests" 
      ALTER COLUMN "provider_id" DROP NOT NULL;
    `);
    
    console.log('✅ Successfully updated provider_id column to allow NULL values');
    
    // Verify the change
    const [results] = await sequelize.query(`
      SELECT column_name, is_nullable, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'ServiceRequests' AND column_name = 'provider_id';
    `);
    
    console.log('📊 Column info:', results[0]);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing database:', error);
    process.exit(1);
  }
})();

