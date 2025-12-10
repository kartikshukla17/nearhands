const app = require("./app");
const { sequelize, ServiceRequest } = require("./src/models");
const { matchRequest } = require("./src/services/matchingService");
const { Op } = require("sequelize");

const PORT = process.env.PORT || 5000;

(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected successfully");
    
    await sequelize.sync({ alter: true });
    
    // Start matching worker (runs every 5 seconds to match pending requests)
    setInterval(async () => {
      try {
        const pendingRequests = await ServiceRequest.findAll({
          where: { status: 'pending' },
          limit: 10 // Process up to 10 requests at a time
        });
        
        for (const request of pendingRequests) {
          await matchRequest(request);
        }
      } catch (error) {
        console.error('Error in matching worker:', error);
      }
    }, 5000); // Run every 5 seconds
    
    console.log('✅ Matching worker started (runs every 5 seconds)');
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌐 Server accessible at:`);
      console.log(`   - http://localhost:${PORT}`);
      console.log(`   - http://127.0.0.1:${PORT}`);
      console.log(`   - http://192.168.0.3:${PORT} (local network)`);
      console.log(`\n💡 If connection fails from mobile device, check Windows Firewall settings!`);
    });
  } catch (error) {
    console.error("❌ Database connection failed:", error);
  }
})();
