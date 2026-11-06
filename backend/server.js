
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const db = require("./config/db");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Authentication routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api", require("./routes/productRoutes"));

// Home API
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to SHOPORA API!",
    status: "Backend is running"
  });
});

// Database connection test
app.get("/api/db-test", (req, res) => {
  db.query("SELECT DATABASE() AS database_name", (error, results) => {
    if (error) {
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }

    res.json({
      success: true,
      message: "Database connection verified!",
      database: results[0].database_name
    });
  });
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`SHOPORA backend running at http://localhost:${PORT}`);
});
