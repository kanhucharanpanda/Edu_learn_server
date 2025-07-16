// server/routes/quizRoutes.js

import express from "express";
import {
  getQuizCategories,
  getQuizQuestions,
  submitQuizAttempt,
  getQuizResults,
  getUserQuizProgress, // NEW: Import the new controller function
} from "../controllers/quizController.js";

import { isAuth } from "../middlewares/isAuth.js"; // Your existing authentication middleware

const router = express.Router();

// Route to get all available quiz categories
router.get("/categories", getQuizCategories);

// Route to get questions for a specific quiz category and round.
router.get("/:category/:roundNumber/questions", isAuth, getQuizQuestions);

// Route to submit a user's quiz attempt.
router.post("/submit", isAuth, submitQuizAttempt);

// Route to get a user's quiz results for a specific category and round.
router.get("/:category/:roundNumber/results", isAuth, getQuizResults);

// NEW: Route to get user's completed quiz rounds for a specific category
router.get("/:category/progress", isAuth, getUserQuizProgress); // NEW: Protected route

export default router;
