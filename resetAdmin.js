const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("./models/User");

async function resetAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected");

    const email = "admin@avipaw.com";
    const password = "admin123456";

    const hashedPassword = await bcrypt.hash(password, 10);

    let admin = await User.findOne({ email });

    if (admin) {
      admin.password = hashedPassword;
      admin.role = "admin";
      await admin.save();
      console.log("Admin password reset successfully.");
    } else {
      admin = await User.create({
        name: "Avipaw Admin",
        email,
        password: hashedPassword,
        role: "admin"
      });
      console.log("New admin created.");
    }

    console.log("----------------------------");
    console.log("Email:    " + email);
    console.log("Password: " + password);
    console.log("----------------------------");

    process.exit(0);
  } catch (error) {
    console.error("Reset error:", error.message);
    process.exit(1);
  }
}

resetAdmin();