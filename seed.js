// server/seed.js (assuming this file is directly inside the 'server' directory)

import dotenv from "dotenv";
// Corrected import: Use named import for connectDb
import { connectDb } from "./database/db.js"; // Changed to named import
import seedQuestions from "./seeds/quizSeeder.js"; // This path is relative to 'server/seeds'

import mongoose from "mongoose"; // Import mongoose to close connection

dotenv.config(); // Load environment variables

// Connect to the database
connectDb(); // Call the named function

// Run the seeding function
seedQuestions()
  .then(() => {
    console.log("Seeding complete. Database connection closing...");
    mongoose.connection.close(); // Close the database connection
    process.exit(0); // Exit successfully
  })
  .catch((err) => {
    console.error("Seeding failed:", err);
    mongoose.connection.close(); // Close the database connection even on error
    process.exit(1); // Exit with an error code
  });
