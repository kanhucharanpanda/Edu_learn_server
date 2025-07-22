
import express from "express";
import {
  subscribeNewsletter,
  unsubscribeNewsletter,
  getNewsletterStats,
  getAllSubscribers,
  updatePreferences,
} from "../controllers/newsletter.js";
import { isAuth } from "../middlewares/isAuth.js";
import { isAdmin } from "../middlewares/isAdmin.js";

const router = express.Router();

// Public routes
router.post("/newsletter/subscribe", subscribeNewsletter);
router.get("/newsletter/unsubscribe", unsubscribeNewsletter);
router.put("/newsletter/preferences", updatePreferences);

// Admin routes
router.get("/newsletter/stats", isAuth, isAdmin, getNewsletterStats);
router.get("/newsletter/subscribers", isAuth, isAdmin, getAllSubscribers);

export default router;
