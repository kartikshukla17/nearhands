const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
require("dotenv").config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Routes (add later)
app.get("/", (req, res) => {
  res.json({ message: "NearHands API running 🚀" });
});

module.exports = app;
