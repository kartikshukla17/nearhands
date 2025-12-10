// Script to populate test service providers
// Run this with: node populate-test-providers.js

const { sequelize, ServiceProvider } = require('./src/models');

const testProviders = [
  {
    firebaseUid: 'test-provider-1-plumbing',
    name: 'John Plumber',
    phone: '+919876543210',
    email: 'john.plumber@test.com',
    services: ['plumbing'],
    verified: true,
    subscription_active: true,
    location_coordinates: [77.5626843, 12.9010822], // Near Bangalore
    rating: 4.5,
    total_jobs: 50,
  },
  {
    firebaseUid: 'test-provider-2-electrical',
    name: 'Mike Electrician',
    phone: '+919876543211',
    email: 'mike.electrician@test.com',
    services: ['electrical'],
    verified: true,
    subscription_active: true,
    location_coordinates: [77.5636843, 12.9020822], // Near Bangalore
    rating: 4.8,
    total_jobs: 75,
  },
  {
    firebaseUid: 'test-provider-3-cleaning',
    name: 'Sarah Cleaner',
    phone: '+919876543212',
    email: 'sarah.cleaner@test.com',
    services: ['cleaning'],
    verified: true,
    subscription_active: true,
    location_coordinates: [77.5616843, 12.9000822], // Near Bangalore
    rating: 4.7,
    total_jobs: 100,
  },
  {
    firebaseUid: 'test-provider-4-multi',
    name: 'Multi Service Provider',
    phone: '+919876543213',
    email: 'multi.service@test.com',
    services: ['plumbing', 'electrical', 'cleaning', 'carpentry'],
    verified: true,
    subscription_active: true,
    location_coordinates: [77.5646843, 12.9030822], // Near Bangalore
    rating: 4.9,
    total_jobs: 200,
  },
];

(async () => {
  try {
    console.log('🔧 Populating test service providers...');
    
    // Connect to database
    await sequelize.authenticate();
    console.log('✅ Database connected');
    
    // Clear existing test providers (optional - comment out if you want to keep existing)
    // await ServiceProvider.destroy({ where: { firebaseUid: { [Op.like]: 'test-provider-%' } } });
    
    // Create test providers
    for (const providerData of testProviders) {
      const [provider, created] = await ServiceProvider.findOrCreate({
        where: { firebaseUid: providerData.firebaseUid },
        defaults: providerData,
      });
      
      if (created) {
        console.log(`✅ Created provider: ${provider.name} (${provider.services.join(', ')})`);
      } else {
        // Update existing provider
        await provider.update(providerData);
        console.log(`🔄 Updated provider: ${provider.name} (${provider.services.join(', ')})`);
      }
    }
    
    console.log('\n✅ Successfully populated test providers!');
    console.log('📊 Summary:');
    const count = await ServiceProvider.count({ where: { verified: true, subscription_active: true } });
    console.log(`   - Total active providers: ${count}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error populating providers:', error);
    process.exit(1);
  }
})();

