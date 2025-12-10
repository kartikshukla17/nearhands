const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
require("dotenv").config();

const app = express();


//  middleware

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));


//  Import Routes

const authRoutes = require("./src/routes/authRoutes.js");
const userRoutes = require("./src/routes/userRoutes.js");
const providerRoutes = require("./src/routes/serviceProviderRoutes.js");
const serviceRequestRoutes = require("./src/routes/serviceRequestRoutes.js");
const paymentRoutes = require("./src/routes/paymentRoutes.js");
const ratingRoutes = require("./src/routes/ratingRoutes.js");


//  Health Check

app.get("/", (req, res) => {
  res.json({ message: "NearHands API running 🚀" });
});


//  Mount Routes

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/providers", providerRoutes);
app.use("/api/service-requests", serviceRequestRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/ratings", ratingRoutes);


// Global Error Handler 
app.use((err, req, res, next) => {
  console.error(" Error:", err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

module.exports = app;
