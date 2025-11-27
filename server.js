const app = require("./app");
const { sequelize } = require("./src/models");

const PORT = process.env.PORT || 5000;

(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected successfully");
    
    await sequelize.sync({ alter: true });
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Database connection failed:", error);
  }
})();
