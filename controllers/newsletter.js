// import { Newsletter } from "../models/Newsletter.js";
// import { sendWelcomeEmail } from "../middlewares/sendMail.js";
// import TryCatch from "../middlewares/TryCatch.js";
// import crypto from "crypto";

// // Subscribe to newsletter
// export const subscribeNewsletter = TryCatch(async (req, res) => {
//   const { email } = req.body;

//   if (!email) {
//     return res.status(400).json({
//       message: "Email is required",
//     });
//   }

//   // Check if already subscribed
//   let subscriber = await Newsletter.findOne({ email });

//   if (subscriber) {
//     if (subscriber.isActive) {
//       return res.status(400).json({
//         message: "Email already subscribed",
//       });
//     } else {
//       // Reactivate subscription
//       subscriber.isActive = true;
//       subscriber.subscribedAt = new Date();
//       subscriber.unsubscribedAt = null;
//       subscriber.unsubscribeToken = null;
//       await subscriber.save();

//       return res.json({
//         message: "Successfully resubscribed to newsletter",
//       });
//     }
//   }

//   // Create new subscription
//   subscriber = await Newsletter.create({
//     email,
//     isActive: true,
//   });

//   // Send welcome email
//   try {
//     await sendWelcomeEmail(email);
//   } catch (error) {
//     console.error("Error sending welcome email:", error);
//   }

//   res.status(201).json({
//     message: "Successfully subscribed to newsletter",
//     subscriber: {
//       email: subscriber.email,
//       subscribedAt: subscriber.subscribedAt,
//     },
//   });
// });

// // Unsubscribe from newsletter
// export const unsubscribeNewsletter = TryCatch(async (req, res) => {
//   const { email, token } = req.query;

//   if (!email) {
//     return res.status(400).json({
//       message: "Email is required",
//     });
//   }

//   const subscriber = await Newsletter.findOne({ email });

//   if (!subscriber) {
//     return res.status(404).json({
//       message: "Email not found in our records",
//     });
//   }

//   if (!subscriber.isActive) {
//     return res.status(400).json({
//       message: "Email is already unsubscribed",
//     });
//   }

//   // Generate unsubscribe token if not provided
//   if (!token) {
//     const unsubscribeToken = crypto.randomBytes(32).toString("hex");
//     subscriber.unsubscribeToken = unsubscribeToken;
//     await subscriber.save();

//     return res.json({
//       message: "Unsubscribe token generated",
//       unsubscribeUrl: `${
//         process.env.frontendurl
//       }/unsubscribe?email=${encodeURIComponent(
//         email
//       )}&token=${unsubscribeToken}`,
//     });
//   }

//   // Verify token and unsubscribe
//   if (subscriber.unsubscribeToken !== token) {
//     return res.status(400).json({
//       message: "Invalid unsubscribe token",
//     });
//   }

//   subscriber.isActive = false;
//   subscriber.unsubscribedAt = new Date();
//   subscriber.unsubscribeToken = null;
//   await subscriber.save();

//   res.json({
//     message: "Successfully unsubscribed from newsletter",
//   });
// });

// // Get newsletter statistics (Admin only)
// export const getNewsletterStats = TryCatch(async (req, res) => {
//   const totalSubscribers = await Newsletter.countDocuments({
//     isActive: true,
//   });

//   const totalUnsubscribed = await Newsletter.countDocuments({
//     isActive: false,
//   });

//   const recentSubscribers = await Newsletter.countDocuments({
//     isActive: true,
//     subscribedAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
//   });

//   res.json({
//     totalSubscribers,
//     totalUnsubscribed,
//     recentSubscribers,
//   });
// });

// // Get all subscribers (Admin only)
// export const getAllSubscribers = TryCatch(async (req, res) => {
//   const page = parseInt(req.query.page) || 1;
//   const limit = parseInt(req.query.limit) || 10;
//   const skip = (page - 1) * limit;

//   const subscribers = await Newsletter.find({})
//     .sort({ subscribedAt: -1 })
//     .skip(skip)
//     .limit(limit)
//     .select("-unsubscribeToken");

//   const total = await Newsletter.countDocuments({});

//   res.json({
//     subscribers,
//     pagination: {
//       page,
//       limit,
//       total,
//       pages: Math.ceil(total / limit),
//     },
//   });
// });

// // Update subscription preferences
// export const updatePreferences = TryCatch(async (req, res) => {
//   const { email, preferences } = req.body;

//   if (!email) {
//     return res.status(400).json({
//       message: "Email is required",
//     });
//   }

//   const subscriber = await Newsletter.findOne({ email });

//   if (!subscriber) {
//     return res.status(404).json({
//       message: "Email not found in our records",
//     });
//   }

//   if (!subscriber.isActive) {
//     return res.status(400).json({
//       message: "Email is not subscribed",
//     });
//   }

//   // Update preferences
//   subscriber.preferences = {
//     ...subscriber.preferences,
//     ...preferences,
//   };

//   await subscriber.save();

//   res.json({
//     message: "Preferences updated successfully",
//     preferences: subscriber.preferences,
//   });
// });

// import TryCatch from "../middlewares/TryCatch.js";
// import { Newsletter } from "../models/Newsletter.js";
// import { sendWelcomeEmail } from "../middlewares/sendMail.js";

// // Helper function for basic email validation
// const validateEmail = (email) => {
//   const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//   return re.test(String(email).toLowerCase());
// };

// // Handle Newsletter Subscription (Public Route)
// export const subscribeNewsletter = TryCatch(async (req, res) => {
//   const { email } = req.body;

//   if (!email || !validateEmail(email)) {
//     return res.status(400).json({ error: "Invalid email address." });
//   }

//   // Check if the email is already subscribed
//   const existingSubscriber = await Newsletter.findOne({ email });

//   if (existingSubscriber) {
//     if (existingSubscriber.isActive) {
//       // If already active, return a conflict message
//       return res
//         .status(409)
//         .json({ error: "This email is already subscribed." });
//     } else {
//       // If previously unsubscribed, reactivate the subscription
//       existingSubscriber.isActive = true;
//       existingSubscriber.subscribedAt = Date.now();
//       existingSubscriber.unsubscribedAt = null;
//       await existingSubscriber.save();

//       // Send welcome email upon reactivation (asynchronously)
//       sendWelcomeEmail(email).catch(console.error);

//       return res
//         .status(200)
//         .json({ message: "Successfully re-subscribed to the newsletter." });
//     }
//   }

//   // Create new subscription if email is not found
//   const newSubscriber = await Newsletter.create({ email });

//   // Send welcome email (asynchronously)
//   sendWelcomeEmail(email).catch((error) => {
//     console.error("Error sending welcome email:", error);
//   });

//   res.status(201).json({
//     message: "Successfully subscribed! A welcome email has been sent.",
//     subscriber: newSubscriber,
//   });
// });

// // Admin Route: Get all subscribers
// export const getAllSubscribers = TryCatch(async (req, res) => {
//   const subscribers = await Newsletter.find({ isActive: true }).select(
//     "email subscribedAt"
//   );
//   res.status(200).json({ subscribers });
// });

// // Admin Route: Get Newsletter Stats (Example placeholder)
// export const getNewsletterStats = TryCatch(async (req, res) => {
//   const totalSubscribers = await Newsletter.countDocuments();
//   const activeSubscribers = await Newsletter.countDocuments({ isActive: true });

//   res.status(200).json({
//     stats: {
//       totalSubscribers,
//       activeSubscribers,
//     },
//   });
// });

// // Unsubscribe (Placeholder)
// export const unsubscribeNewsletter = TryCatch(async (req, res) => {
//   // Logic to handle unsubscribe requests (e.g., via a link with a token)
//   res
//     .status(501)
//     .json({ message: "Unsubscribe endpoint not fully implemented." });
// });

// // Update Preferences (Placeholder)
// export const updatePreferences = TryCatch(async (req, res) => {
//   // Logic to update user preferences (e.g., newCourses, promotions)
//   res
//     .status(501)
//     .json({ message: "Update preferences endpoint not fully implemented." });
// });

// import TryCatch from "../middlewares/TryCatch.js";
// import { Newsletter } from "../models/Newsletter.js";
// // CORRECTED IMPORT PATH: Assuming sendMail.js is in a 'utils' folder relative to 'controllers'
// import { sendWelcomeEmail } from "../middlewares/sendMail.js"; // <-- THIS IS THE CRITICAL CHANGE

// // Helper function for basic email validation
// const validateEmail = (email) => {
//   const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//   return re.test(String(email).toLowerCase());
// };

// // Handle Newsletter Subscription (Public Route)
// export const subscribeNewsletter = TryCatch(async (req, res) => {
//   const { email } = req.body;

//   if (!email || !validateEmail(email)) {
//     return res.status(400).json({ error: "Invalid email address." });
//   }

//   // Check if the email is already subscribed
//   const existingSubscriber = await Newsletter.findOne({ email });

//   if (existingSubscriber) {
//     if (existingSubscriber.isActive) {
//       // If already active, return a conflict message
//       return res
//         .status(409)
//         .json({ error: "This email is already subscribed." });
//     } else {
//       // If previously unsubscribed, reactivate the subscription
//       existingSubscriber.isActive = true;
//       existingSubscriber.subscribedAt = Date.now();
//       existingSubscriber.unsubscribedAt = null;
//       await existingSubscriber.save();

//       // Send welcome email upon reactivation (asynchronously)
//       // Added await here to ensure the email sending promise is handled
//       try {
//         await sendWelcomeEmail(email);
//       } catch (emailError) {
//         console.error(
//           "Error sending welcome email on re-subscribe:",
//           emailError
//         );
//         // Optionally, you might want to log this error but still send success response
//         // if the subscription itself was successful.
//       }

//       return res
//         .status(200)
//         .json({ message: "Successfully re-subscribed to the newsletter." });
//     }
//   }

//   // Create new subscription if email is not found
//   const newSubscriber = await Newsletter.create({ email });

//   // Send welcome email (asynchronously)
//   // Added await here to ensure the email sending promise is handled
//   try {
//     await sendWelcomeEmail(email);
//   } catch (emailError) {
//     console.error("Error sending welcome email on new subscribe:", emailError);
//     // Log the error, but still send success response if DB save was successful
//   }

//   res.status(201).json({
//     message: "Successfully subscribed! A welcome email has been sent.",
//     subscriber: newSubscriber,
//   });
// });

// // Admin Route: Get all subscribers
// export const getAllSubscribers = TryCatch(async (req, res) => {
//   const subscribers = await Newsletter.find({ isActive: true }).select(
//     "email subscribedAt"
//   );
//   res.status(200).json({ subscribers });
// });

// // Admin Route: Get Newsletter Stats (Example placeholder)
// export const getNewsletterStats = TryCatch(async (req, res) => {
//   const totalSubscribers = await Newsletter.countDocuments();
//   const activeSubscribers = await Newsletter.countDocuments({ isActive: true });

//   res.status(200).json({
//     stats: {
//       totalSubscribers,
//       activeSubscribers,
//     },
//   });
// });

// // Unsubscribe (Placeholder)
// export const unsubscribeNewsletter = TryCatch(async (req, res) => {
//   // Logic to handle unsubscribe requests (e.g., via a link with a token)
//   res
//     .status(501)
//     .json({ message: "Unsubscribe endpoint not fully implemented." });
// });

// // Update Preferences (Placeholder)
// export const updatePreferences = TryCatch(async (req, res) => {
//   // Logic to update user preferences (e.g., newCourses, promotions)
//   res
//     .status(501)
//     .json({ message: "Update preferences endpoint not fully implemented." });
// });

import TryCatch from "../middlewares/TryCatch.js";
import { Newsletter } from "../models/Newsletter.js";
// Assuming sendMail.js is in a 'middlewares' folder as per your previous statement
import { sendWelcomeEmail } from "../middlewares/sendMail.js";
import crypto from "crypto"; // Added for unsubscribe token generation

// Helper function for basic email validation
const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
};

// Handle Newsletter Subscription (Public Route)
export const subscribeNewsletter = TryCatch(async (req, res) => {
  // Trim the email received from the request body
  const email = req.body.email ? req.body.email.trim() : "";

  if (!email || !validateEmail(email)) {
    return res.status(400).json({ error: "Invalid email address." });
  }

  // Check if the email is already subscribed
  const existingSubscriber = await Newsletter.findOne({ email });

  if (existingSubscriber) {
    if (existingSubscriber.isActive) {
      // If already active, return a conflict message
      return res
        .status(409)
        .json({ error: "This email is already subscribed." });
    } else {
      // If previously unsubscribed, reactivate the subscription
      existingSubscriber.isActive = true;
      existingSubscriber.subscribedAt = Date.now();
      existingSubscriber.unsubscribedAt = null;
      existingSubscriber.unsubscribeToken = null; // Clear token on resubscribe
      await existingSubscriber.save();

      // Send welcome email upon reactivation (asynchronously)
      try {
        await sendWelcomeEmail(email);
      } catch (emailError) {
        console.error(
          "Error sending welcome email on re-subscribe:",
          emailError
        );
        // Log the error, but still send success response if the subscription itself was successful.
      }

      return res
        .status(200)
        .json({ message: "Successfully re-subscribed to the newsletter." });
    }
  }

  // Create new subscription if email is not found
  const newSubscriber = await Newsletter.create({ email });

  // Send welcome email (asynchronously)
  try {
    await sendWelcomeEmail(email);
  } catch (emailError) {
    console.error("Error sending welcome email on new subscribe:", emailError);
    // Log the error, but still send success response if DB save was successful
  }

  res.status(201).json({
    message: "Successfully subscribed! A welcome email has been sent.",
    subscriber: newSubscriber,
  });
});

// Unsubscribe from newsletter
export const unsubscribeNewsletter = TryCatch(async (req, res) => {
  const { email, token } = req.query;

  if (!email) {
    return res.status(400).json({
      message: "Email is required",
    });
  }

  const subscriber = await Newsletter.findOne({ email });

  if (!subscriber) {
    return res.status(404).json({
      message: "Email not found in our records",
    });
  }

  if (!subscriber.isActive) {
    return res.status(400).json({
      message: "Email is already unsubscribed",
    });
  }

  // Generate unsubscribe token if not provided (for first click on unsubscribe link)
  if (!token) {
    const unsubscribeToken = crypto.randomBytes(32).toString("hex");
    subscriber.unsubscribeToken = unsubscribeToken;
    await subscriber.save();

    // Construct the unsubscribe URL for the user to click
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const unsubscribeUrl = `${frontendUrl}/unsubscribe?email=${encodeURIComponent(
      email
    )}&token=${unsubscribeToken}`;

    return res.json({
      message:
        "Please click the link sent to your email to confirm unsubscribe.",
      unsubscribeUrl: unsubscribeUrl,
    });
  }

  // Verify token and unsubscribe
  if (subscriber.unsubscribeToken !== token) {
    return res.status(400).json({
      message: "Invalid unsubscribe token",
    });
  }

  subscriber.isActive = false;
  subscriber.unsubscribedAt = new Date();
  subscriber.unsubscribeToken = null;
  await subscriber.save();

  res.json({
    message: "Successfully unsubscribed from newsletter",
  });
});

// Get newsletter statistics (Admin only)
export const getNewsletterStats = TryCatch(async (req, res) => {
  const totalSubscribers = await Newsletter.countDocuments({
    isActive: true,
  });

  const totalUnsubscribed = await Newsletter.countDocuments({
    isActive: false,
  });

  const recentSubscribers = await Newsletter.countDocuments({
    isActive: true,
    subscribedAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
  });

  res.json({
    totalSubscribers,
    totalUnsubscribed,
    recentSubscribers,
  });
});

// Get all subscribers (Admin only)
export const getAllSubscribers = TryCatch(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const subscribers = await Newsletter.find({})
    .sort({ subscribedAt: -1 })
    .skip(skip)
    .limit(limit)
    .select("-unsubscribeToken");

  const total = await Newsletter.countDocuments({});

  res.json({
    subscribers,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

// Update subscription preferences
export const updatePreferences = TryCatch(async (req, res) => {
  const { email, preferences } = req.body;

  if (!email) {
    return res.status(400).json({
      message: "Email is required",
    });
  }

  const subscriber = await Newsletter.findOne({ email });

  if (!subscriber) {
    return res.status(404).json({
      message: "Email not found in our records",
    });
  }

  if (!subscriber.isActive) {
    return res.status(400).json({
      message: "Email is not subscribed",
    });
  }

  // Update preferences
  subscriber.preferences = {
    ...subscriber.preferences,
    ...preferences,
  };

  await subscriber.save();

  res.json({
    message: "Preferences updated successfully",
    preferences: subscriber.preferences,
  });
});
