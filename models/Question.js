import mongoose from "mongoose";
// Define the schema for a single quiz question
const QuestionSchema = new mongoose.Schema({
  // The category of the quiz (e.g., 'Java', 'Python', 'JavaScript')
  category: {
    type: String,
    required: [true, "Question category is required"],
    trim: true,
    // Ensure category names are consistent for querying
    lowercase: true,
  },
  // The actual question text
  questionText: {
    type: String,
    required: [true, "Question text is required"],
    trim: true,
  },
  // An array of possible options for the question
  options: {
    type: [String], // Array of strings
    required: [true, "Options are required"],
    validate: {
      validator: function (v) {
        // Ensure there are at least 2 options
        return v && v.length >= 2;
      },
      message: "A question must have at least two options",
    },
  },
  // The correct answer (index of the option in the 'options' array)
  // For example, if options = ['A', 'B', 'C'] and 'B' is correct, correctAnswer = 1
  correctAnswer: {
    type: Number,
    required: [true, "Correct answer index is required"],
    validate: {
      validator: function (v) {
        // Ensure the correct answer index is within the bounds of the options array
        return v >= 0 && v < this.options.length;
      },
      message: "Correct answer index is out of bounds for the provided options",
    },
  },
  // Optional: Difficulty level for different rounds (e.g., 'easy', 'medium', 'hard')
  difficulty: {
    type: String,
    enum: ["easy", "medium", "hard"], // Restrict to these values
    default: "easy",
  },
  // Timestamp for when the question was created
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create a Mongoose model from the schema
const Question = mongoose.model("Question", QuestionSchema);

export default Question;
