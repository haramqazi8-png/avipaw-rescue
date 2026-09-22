const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "avipaw_rescue_secret_2026";

process.env.JWT_SECRET = JWT_SECRET;

/* =========================
   MIDDLEWARE
========================= */

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:3000",
      "http://localhost:5174"
    ],
    credentials: true
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* =========================
   STATIC UPLOADS
========================= */

app.use("/uploads", express.static("uploads"));

/* =========================
   MONGODB CONNECTION
========================= */

const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb://127.0.0.1:27017/avipaw_rescue";

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected successfully");
    console.log("Database:", mongoose.connection.name);
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error.message);
  });

/* =========================
   ROUTES
========================= */

const animalRoutes = require("./routes/animalRoutes");
const storyRoutes = require("./routes/storyRoutes");
const requestRoutes = require("./routes/requestRoutes");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const uploadRoutes = require("./routes/uploadRoutes");

app.use("/api/animals", animalRoutes);
app.use("/api/stories", storyRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/upload", uploadRoutes);

/* =========================
   TEST ROUTE
========================= */

app.get("/", (req, res) => {
  res.json({
    message: "Avipaw Rescue Backend is Running"
  });
});

/* =========================
   ERROR HANDLER
========================= */

app.use((err, req, res, next) => {
  console.error("Server error:", err);

  res.status(err.status || 500).json({
    message: err.message || "Internal server error"
  });
});

/* =========================
   START SERVER
========================= */

app.listen(PORT, () => {
  console.log(
    `Backend server running at http://localhost:${PORT}`
  );
});
