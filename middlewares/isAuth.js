
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import dotenv from "dotenv"; // Ensure dotenv is imported if needed for Jwt_Sec

dotenv.config();

export const isAuth = async (req, res, next) => {
  try {
    let token;

    // Check Authorization: Bearer
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
      console.log(
        "Token received from Authorization header:",
        token ? "Yes" : "No"
      );
    }
    // Check custom 'token' header (which your frontend is using)
    else if (req.headers.token) {
      token = req.headers.token;
      console.log("Token received from 'token' header:", token ? "Yes" : "No");
    }

    if (!token) {
      console.log("isAuth: No token found. Sending 403.");
      return res.status(403).json({
        message: "Please Login",
      });
    }

    // Verify token
    // Use the correct secret from your environment variables
    const secret = process.env.Jwt_Sec;
    console.log(
      "Verification Secret used:",
      secret ? "Loaded" : "Error - Missing Secret"
    );

    const decodedData = jwt.verify(token, secret);
    console.log(
      "Token verified successfully. Decoded User ID:",
      decodedData._id
    );

    // Find the user
    req.user = await User.findById(decodedData._id);

    if (!req.user) {
      console.log("isAuth: User not found in DB for decoded ID.");
      return res.status(403).json({ message: "User not found." });
    }

    console.log("Authentication successful for user:", req.user.email);
    next(); // Proceed to the controller
  } catch (error) {
    // Log the specific error details when verification fails
    console.error("isAuth middleware error (JWT or DB error):", error.message);

    // This is where the 403 is likely originating if a token is present but invalid/expired
    res.status(403).json({
      message: "Login First (Authentication Failed - Invalid Token)",
    });
  }
};

// ... (isAdmin middleware remains the same)
// / Your isAdmin middleware (no changes needed here as it depends on req.user from isAuth)
export const isAdmin = (req, res, next) => {
  try {
    if (req.user.role !== "admin")
      return res.status(403).json({
        message: "You are not admin",
      });

    next();
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
