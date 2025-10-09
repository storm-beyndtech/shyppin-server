import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { User } from "./models/user.js";

// Connect to MongoDB
mongoose.set("strictQuery", false);

async function seedAdmin() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("Connected to MongoDB...");

    // Check if old admin user exists and remove it
    const oldAdmin = await User.findOne({ email: "admin@dashngshop.com" });
    if (oldAdmin) {
      await User.deleteOne({ email: "admin@dashngshop.com" });
      console.log("Removed old admin user...");
    }

    // Check if new admin user already exists
    const existingAdmin = await User.findOne({ email: "support@shyppin.com" });
    
    if (existingAdmin) {
      console.log("Admin user already exists!");
      process.exit(0);
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash("Shyppin$1", saltRounds);

    // Create admin user
    const adminUser = new User({
      firstName: "Support",
      lastName: "Admin",
      username: "support",
      email: "support@shyppin.com",
      password: hashedPassword,
      isAdmin: true,
      isEmailVerified: true,
      accountStatus: "active",
      kycStatus: "approved",
      country: "United States",
      phone: "+1-800-SHYPPIN",
      city: "San Francisco",
      state: "CA",
      zipCode: "94105",
      streetAddress: "123 Logistics Avenue"
    });

    // Save the admin user
    await adminUser.save();
    console.log("Admin user created successfully!");
    console.log("Email: support@shyppin.com");
    console.log("Password: Shyppin$1");
    
  } catch (error) {
    console.error("Error seeding admin user:", error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log("Database connection closed.");
    process.exit(0);
  }
}

// Run the seed function
seedAdmin();