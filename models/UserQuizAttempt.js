// server/models/UserQuizAttempt.js

import mongoose from "mongoose"; // Changed to ES6 import

// Define the schema for a user's answer to a specific question within an attempt
const AnswerSchema = new mongoose.Schema(
  {
    questionId: {
      type: mongoose.Schema.Types.ObjectId, // Reference to the Question model
      ref: "Question",
      required: true,
    },
    userAnswerIndex: {
      type: Number, // The index of the option chosen by the user
      required: true,
    },
    isCorrect: {
      type: Boolean, // Whether the user's answer was correct
      required: true,
    },
  },
  { _id: false }
); // Do not create an _id for subdocuments

// Define the schema for a user's overall quiz attempt
const UserQuizAttemptSchema = new mongoose.Schema({
  // ID of the user who made the attempt (assuming you have a User model)
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference to your User model (adjust if your User model name is different)
    required: true,
  },
  // The category of the quiz attempted (e.g., 'java', 'python')
  quizCategory: {
    type: String,
    required: [true, "Quiz category is required"],
    trim: true,
    lowercase: true,
  },
  // The round number for this attempt (e.g., 1, 2, 3)
  roundNumber: {
    type: Number,
    required: [true, "Round number is required"],
    min: 1, // Round numbers should start from 1
  },
  // An array of answers for each question in this attempt
  answers: {
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: "Question" },
    type: [AnswerSchema],
    default: [],
  },
  // The total score obtained in this attempt
  score: {
    type: Number,
    required: true,
    min: 0,
  },
  // The total number of questions in this attempt
  totalQuestions: {
    type: Number,
    required: true,
    min: 0,
  },
  questionId: { type: mongoose.Schema.Types.ObjectId, ref: "Question" },
  // Timestamp for when the attempt was submitted
  submittedAt: {
    type: Date,
    default: Date.now,
  },
});

// Add an index for faster querying by user and category/round
UserQuizAttemptSchema.index({ userId: 1, quizCategory: 1, roundNumber: 1 });

// Create a Mongoose model from the schema
const UserQuizAttempt = mongoose.model(
  "UserQuizAttempt",
  UserQuizAttemptSchema
);

export default UserQuizAttempt; // Changed to ES6 export
