// // server/controllers/quizController.js

// import Question from "../models/Question.js"; // Import the Question model
// import UserQuizAttempt from "../models/UserQuizAttempt.js"; // Import the UserQuizAttempt model

// // Utility function to generate a random subset of questions
// const getRandomQuestions = (questions, count) => {
//   // Shuffle the array to randomize question order
//   const shuffled = questions.sort(() => 0.5 - Math.random());
//   // Return a slice of the shuffled array up to the desired count
//   return shuffled.slice(0, count);
// };

// // @desc    Get quiz categories
// // @route   GET /api/quiz/categories
// // @access  Public (or Private, depending on your auth strategy)
// export const getQuizCategories = async (req, res) => {
//   try {
//     // Find all distinct categories from the Question collection
//     const categories = await Question.distinct("category");
//     res.status(200).json({ success: true, categories });
//   } catch (error) {
//     console.error("Error fetching quiz categories:", error);
//     res
//       .status(500)
//       .json({
//         success: false,
//         message: "Server error fetching quiz categories",
//       });
//   }
// };

// // @desc    Get questions for a specific quiz category and round
// // @route   GET /api/quiz/:category/:roundNumber/questions
// // @access  Private (requires authentication)
// export const getQuizQuestions = async (req, res) => {
//   const { category, roundNumber } = req.params;
//   const userId = req.user._id; // Assuming user ID is available from authentication middleware

//   // Define the number of questions per round
//   const QUESTIONS_PER_ROUND = 5; // Changed to 5 for easier testing. You had 25.

//   try {
//     // Check if the user has already completed this round
//     const existingAttempt = await UserQuizAttempt.findOne({
//       userId,
//       quizCategory: category.toLowerCase(),
//       roundNumber: parseInt(roundNumber),
//     });

//     if (existingAttempt) {
//       // If an attempt exists, prevent starting a new one for this round
//       // Instead, suggest navigating to results
//       return res.status(400).json({
//         success: false,
//         message: `You have already completed round ${roundNumber} for ${category}. Please check your results.`,
//       });
//     }

//     // Determine difficulty based on round number (example logic)
//     let difficulty = "easy";
//     if (roundNumber == 2) {
//       difficulty = "medium";
//     } else if (roundNumber >= 3) {
//       difficulty = "hard";
//     }

//     // Find questions for the given category and difficulty
//     const questions = await Question.find({
//       category: category.toLowerCase(),
//       difficulty,
//     });

//     if (questions.length === 0) {
//       return res
//         .status(404)
//         .json({
//           success: false,
//           message: "No questions found for this category and difficulty.",
//         });
//     }

//     // Get a random subset of questions
//     const selectedQuestions = getRandomQuestions(
//       questions,
//       QUESTIONS_PER_ROUND
//     );

//     // Map questions to hide the correct answer before sending to frontend
//     const questionsForUser = selectedQuestions.map((q) => ({
//       _id: q._id,
//       questionText: q.questionText,
//       options: q.options,
//       category: q.category,
//       difficulty: q.difficulty,
//     }));

//     res.status(200).json({ success: true, questions: questionsForUser });
//   } catch (error) {
//     console.error("Error fetching quiz questions:", error);
//     res
//       .status(500)
//       .json({
//         success: false,
//         message: "Server error fetching quiz questions",
//       });
//   }
// };

// // @desc    Submit a quiz attempt
// // @route   POST /api/quiz/submit
// // @access  Private (requires authentication)
// export const submitQuizAttempt = async (req, res) => {
//   const { quizCategory, roundNumber, answers } = req.body;
//   const userId = req.user._id; // Assuming user ID is available from authentication middleware

//   if (!quizCategory || !roundNumber || !answers || !Array.isArray(answers)) {
//     return res
//       .status(400)
//       .json({ success: false, message: "Invalid quiz submission data." });
//   }

//   try {
//     // Check if the user has already completed this round to prevent duplicate submissions
//     const existingAttempt = await UserQuizAttempt.findOne({
//       userId,
//       quizCategory: quizCategory.toLowerCase(),
//       roundNumber: parseInt(roundNumber),
//     });

//     if (existingAttempt) {
//       return res.status(400).json({
//         success: false,
//         message: `You have already submitted round ${roundNumber} for ${quizCategory}.`,
//       });
//     }

//     let score = 0;
//     const processedAnswers = [];
//     const questionIds = answers.map((a) => a.questionId);

//     // Fetch all questions involved in this attempt to verify answers
//     const questionsInAttempt = await Question.find({
//       _id: { $in: questionIds },
//     });
//     const questionMap = new Map(
//       questionsInAttempt.map((q) => [q._id.toString(), q])
//     );

//     for (const userAnswer of answers) {
//       const question = questionMap.get(userAnswer.questionId);

//       if (!question) {
//         // If a question ID is invalid, skip it or handle as an error
//         console.warn(`Question with ID ${userAnswer.questionId} not found.`);
//         continue;
//       }

//       const isCorrect = userAnswer.userAnswerIndex === question.correctAnswer;
//       if (isCorrect) {
//         score++;
//       }

//       processedAnswers.push({
//         questionId: userAnswer.questionId,
//         userAnswerIndex: userAnswer.userAnswerIndex,
//         isCorrect: isCorrect,
//       });
//     }

//     // Create a new quiz attempt record
//     const newAttempt = new UserQuizAttempt({
//       userId,
//       quizCategory: quizCategory.toLowerCase(),
//       roundNumber: parseInt(roundNumber),
//       answers: processedAnswers,
//       score,
//       totalQuestions: answers.length, // Total questions submitted in this attempt
//     });

//     await newAttempt.save();

//     res.status(201).json({
//       success: true,
//       message: "Quiz attempt submitted successfully!",
//       score,
//       totalQuestions: answers.length,
//       attemptId: newAttempt._id,
//     });
//   } catch (error) {
//     console.error("Error submitting quiz attempt:", error);
//     res
//       .status(500)
//       .json({
//         success: false,
//         message: "Server error submitting quiz attempt",
//       });
//   }
// };

// // @desc    Get user's quiz results for a specific category and round
// // @route   GET /api/quiz/:category/:roundNumber/results
// // @access  Private (requires authentication)
// export const getQuizResults = async (req, res) => {
//   const { category, roundNumber } = req.params;
//   const userId = req.user._id; // Assuming user ID is available from authentication middleware

//   try {
//     const attempt = await UserQuizAttempt.findOne({
//       userId,
//       quizCategory: category.toLowerCase(),
//       roundNumber: parseInt(roundNumber),
//     }).populate({
//       path: "answers.questionId", // Populate the question details for each answer
//       select: "questionText options correctAnswer", // Select specific fields
//     });

//     if (!attempt) {
//       return res
//         .status(404)
//         .json({
//           success: false,
//           message: "Quiz attempt not found for this user, category, and round.",
//         });
//     }

//     res.status(200).json({ success: true, attempt });
//   } catch (error) {
//     console.error("Error fetching quiz results:", error);
//     res
//       .status(500)
//       .json({ success: false, message: "Server error fetching quiz results" });
//   }
// };

// // NEW: @desc    Get user's completed quiz rounds for a specific category
// // NEW: @route   GET /api/quiz/:category/progress
// // NEW: @access  Private (requires authentication)
// export const getUserQuizProgress = async (req, res) => {
//   const { category } = req.params;
//   const userId = req.user._id; // Assuming user ID is available from authentication middleware

//   try {
//     // Find all attempts for the user in the given category
//     const completedAttempts = await UserQuizAttempt.find({
//       userId,
//       quizCategory: category.toLowerCase(),
//     }).select("roundNumber -_id"); // Select only roundNumber and exclude _id

//     // Extract unique round numbers
//     const completedRounds = completedAttempts
//       .map((attempt) => attempt.roundNumber)
//       .sort((a, b) => a - b);

//     res.status(200).json({ success: true, completedRounds });
//   } catch (error) {
//     console.error("Error fetching user quiz progress:", error);
//     res
//       .status(500)
//       .json({
//         success: false,
//         message: "Server error fetching user quiz progress",
//       });
//   }
// };

// server/controllers/quizController.js

//Previous file

// import Question from "../models/Question.js"; // Import the Question model
// import UserQuizAttempt from "../models/UserQuizAttempt.js"; // Import the UserQuizAttempt model

// // Utility function to generate a random subset of questions
// const getRandomQuestions = (questions, count) => {
//   // Shuffle the array to randomize question order
//   const shuffled = questions.sort(() => 0.5 - Math.random());
//   // Return a slice of the shuffled array up to the desired count
//   return shuffled.slice(0, count);
// };

// // @desc    Get quiz categories
// // @route   GET /api/quiz/categories
// // @access  Public (or Private, depending on your auth strategy)
// export const getQuizCategories = async (req, res) => {
//   try {
//     // Find all distinct categories from the Question collection
//     const categories = await Question.distinct("category");
//     res.status(200).json({ success: true, categories });
//   } catch (error) {
//     console.error("Error fetching quiz categories:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error fetching quiz categories",
//     });
//   }
// };

// // @desc    Get questions for a specific quiz category and round
// // @route   GET /api/quiz/:category/:roundNumber/questions
// // @access  Private (requires authentication)
// export const getQuizQuestions = async (req, res) => {
//   const { category, roundNumber } = req.params;
//   const userId = req.user._id; // Assuming user ID is available from authentication middleware

//   // Define the number of questions per round, updated to 15
//   const QUESTIONS_PER_ROUND = 15; // Updated to 15 questions per round

//   try {
//     // Check if the user has already completed this round
//     const existingAttempt = await UserQuizAttempt.findOne({
//       userId,
//       quizCategory: category.toLowerCase(),
//       roundNumber: parseInt(roundNumber),
//     });

//     if (existingAttempt) {
//       // If an attempt exists, prevent starting a new one for this round
//       // Instead, suggest navigating to results
//       return res.status(400).json({
//         success: false,
//         message: `You have already completed round ${roundNumber} for ${category}. Please check your results.`,
//       });
//     }

//     // Determine difficulty based on round number for 9 rounds
//     let difficulty = "easy";
//     const round = parseInt(roundNumber);
//     if (round >= 1 && round <= 3) {
//       difficulty = "easy";
//     } else if (round >= 4 && round <= 6) {
//       difficulty = "medium";
//     } else if (round >= 7 && round <= 9) {
//       difficulty = "hard";
//     } else {
//       // Default for rounds outside 1-9, or if roundNumber is invalid
//       difficulty = "easy";
//     }

//     // Find questions for the given category and difficulty
//     const questions = await Question.find({
//       category: category.toLowerCase(),
//       difficulty,
//     });

//     if (questions.length < QUESTIONS_PER_ROUND) {
//       // If not enough questions of the specified difficulty, try fetching from other difficulties
//       // This ensures a round can always be started if enough questions exist in total for the category
//       console.warn(
//         `Not enough '${difficulty}' questions for ${category} round ${round}. Attempting to fetch from other difficulties.`
//       );
//       const allCategoryQuestions = await Question.find({
//         category: category.toLowerCase(),
//       });
//       if (allCategoryQuestions.length < QUESTIONS_PER_ROUND) {
//         return res.status(404).json({
//           success: false,
//           message: `Not enough questions available for ${category} to create a round of ${QUESTIONS_PER_ROUND} questions.`,
//         });
//       }
//       // Use all available questions for the category and select randomly
//       const selectedQuestions = getRandomQuestions(
//         allCategoryQuestions,
//         QUESTIONS_PER_ROUND
//       );
//       const questionsForUser = selectedQuestions.map((q) => ({
//         _id: q._id,
//         questionText: q.questionText,
//         options: q.options,
//         category: q.category,
//         difficulty: q.difficulty,
//       }));
//       return res
//         .status(200)
//         .json({ success: true, questions: questionsForUser });
//     }

//     // Get a random subset of questions
//     const selectedQuestions = getRandomQuestions(
//       questions,
//       QUESTIONS_PER_ROUND
//     );

//     // Map questions to hide the correct answer before sending to frontend
//     const questionsForUser = selectedQuestions.map((q) => ({
//       _id: q._id,
//       questionText: q.questionText,
//       options: q.options,
//       category: q.category,
//       difficulty: q.difficulty,
//     }));

//     res.status(200).json({ success: true, questions: questionsForUser });
//   } catch (error) {
//     console.error("Error fetching quiz questions:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error fetching quiz questions",
//     });
//   }
// };

// // @desc    Submit a quiz attempt
// // @route   POST /api/quiz/submit
// // @access  Private (requires authentication)
// export const submitQuizAttempt = async (req, res) => {
//   const { quizCategory, roundNumber, answers } = req.body;
//   const userId = req.user._id; // Assuming user ID is available from authentication middleware

//   if (!quizCategory || !roundNumber || !answers || !Array.isArray(answers)) {
//     return res
//       .status(400)
//       .json({ success: false, message: "Invalid quiz submission data." });
//   }

//   try {
//     // Check if the user has already completed this round to prevent duplicate submissions
//     const existingAttempt = await UserQuizAttempt.findOne({
//       userId,
//       quizCategory: quizCategory.toLowerCase(),
//       roundNumber: parseInt(roundNumber),
//     });

//     if (existingAttempt) {
//       return res.status(400).json({
//         success: false,
//         message: `You have already submitted round ${roundNumber} for ${quizCategory}.`,
//       });
//     }

//     let score = 0;
//     const processedAnswers = [];
//     const questionIds = answers.map((a) => a.questionId);

//     // Fetch all questions involved in this attempt to verify answers
//     const questionsInAttempt = await Question.find({
//       _id: { $in: questionIds },
//     });
//     const questionMap = new Map(
//       questionsInAttempt.map((q) => [q._id.toString(), q])
//     );

//     for (const userAnswer of answers) {
//       const question = questionMap.get(userAnswer.questionId);

//       if (!question) {
//         // If a question ID is invalid, skip it or handle as an error
//         console.warn(`Question with ID ${userAnswer.questionId} not found.`);
//         continue;
//       }

//       const isCorrect = userAnswer.userAnswerIndex === question.correctAnswer;
//       if (isCorrect) {
//         score++;
//       }

//       processedAnswers.push({
//         questionId: userAnswer.questionId,
//         userAnswerIndex: userAnswer.userAnswerIndex,
//         isCorrect: isCorrect,
//       });
//     }

//     // Create a new quiz attempt record
//     const newAttempt = new UserQuizAttempt({
//       userId,
//       quizCategory: quizCategory.toLowerCase(),
//       roundNumber: parseInt(roundNumber),
//       answers: processedAnswers,
//       score,
//       totalQuestions: answers.length, // Total questions submitted in this attempt
//     });

//     await newAttempt.save();

//     res.status(201).json({
//       success: true,
//       message: "Quiz attempt submitted successfully!",
//       score,
//       totalQuestions: answers.length,
//       attemptId: newAttempt._id,
//     });
//   } catch (error) {
//     console.error("Error submitting quiz attempt:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error submitting quiz attempt",
//     });
//   }
// };

// // @desc    Get user's quiz results for a specific category and round
// // @route   GET /api/quiz/:category/:roundNumber/results
// // @access  Private (requires authentication)
// export const getQuizResults = async (req, res) => {
//   const { category, roundNumber } = req.params;
//   const userId = req.user._id; // Assuming user ID is available from authentication middleware

//   try {
//     const attempt = await UserQuizAttempt.findOne({
//       userId,
//       quizCategory: category.toLowerCase(),
//       roundNumber: parseInt(roundNumber),
//     }).populate({
//       path: "answers.questionId", // Populate the question details for each answer
//       select: "questionText options correctAnswer", // Select specific fields
//     });

//     if (!attempt) {
//       return res.status(404).json({
//         success: false,
//         message: "Quiz attempt not found for this user, category, and round.",
//       });
//     }

//     res.status(200).json({ success: true, attempt });
//   } catch (error) {
//     console.error("Error fetching quiz results:", error);
//     res
//       .status(500)
//       .json({ success: false, message: "Server error fetching quiz results" });
//   }
// };

// // NEW: @desc    Get user's completed quiz rounds for a specific category
// // NEW: @route   GET /api/quiz/:category/progress
// // NEW: @access  Private (requires authentication)
// export const getUserQuizProgress = async (req, res) => {
//   const { category } = req.params;
//   const userId = req.user._id; // Assuming user ID is available from authentication middleware

//   try {
//     // Find all attempts for the user in the given category
//     const completedAttempts = await UserQuizAttempt.find({
//       userId,
//       quizCategory: category.toLowerCase(),
//     }).select("roundNumber -_id"); // Select only roundNumber and exclude _id

//     // Extract unique round numbers
//     const completedRounds = completedAttempts
//       .map((attempt) => attempt.roundNumber)
//       .sort((a, b) => a - b);

//     res.status(200).json({ success: true, completedRounds });
//   } catch (error) {
//     console.error("Error fetching user quiz progress:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error fetching user quiz progress",
//     });
//   }
// };

import Question from "../models/Question.js"; // Import the Question model
import UserQuizAttempt from "../models/UserQuizAttempt.js"; // Import the UserQuizAttempt model

// Utility function to generate a random subset of questions
const getRandomQuestions = (questions, count) => {
  // Shuffle the array to randomize question order
  const shuffled = questions.sort(() => 0.5 - Math.random());
  // Return a slice of the shuffled array up to the desired count
  return shuffled.slice(0, count);
};

// @desc    Get quiz categories
// @route   GET /api/quiz/categories
// @access  Public (or Private, depending on your auth strategy)
export const getQuizCategories = async (req, res) => {
  try {
    // Find all distinct categories from the Question collection
    const categories = await Question.distinct("category");
    res.status(200).json({ success: true, categories });
  } catch (error) {
    console.error("Error fetching quiz categories:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching quiz categories",
    });
  }
};

// @desc    Get questions for a specific quiz category and round
// @route   GET /api/quiz/:category/:roundNumber/questions
// @access  Private (requires authentication)
export const getQuizQuestions = async (req, res) => {
  const { category, roundNumber } = req.params;
  const userId = req.user._id; // Assuming user ID is available from authentication middleware

  // Define the number of questions per round, updated to 15
  const QUESTIONS_PER_ROUND = 15; // Updated to 15 questions per round

  try {
    // Removed the check for existingAttempt here.
    // This allows users to fetch questions for a round even if they've completed it,
    // enabling the "retake quiz" functionality. The submission logic will handle updates.

    // Determine difficulty based on round number for 9 rounds
    let difficulty = "easy";
    const round = parseInt(roundNumber);
    if (round >= 1 && round <= 3) {
      difficulty = "easy";
    } else if (round >= 4 && round <= 6) {
      difficulty = "medium";
    } else if (round >= 7 && round <= 9) {
      difficulty = "hard";
    } else {
      // Default for rounds outside 1-9, or if roundNumber is invalid
      difficulty = "easy";
    } // Find questions for the given category and difficulty

    const questions = await Question.find({
      category: category.toLowerCase(),
      difficulty,
    });

    if (questions.length < QUESTIONS_PER_ROUND) {
      // If not enough questions of the specified difficulty, try fetching from other difficulties
      // This ensures a round can always be started if enough questions exist in total for the category
      console.warn(
        `Not enough '${difficulty}' questions for ${category} round ${round}. Attempting to fetch from other difficulties.`
      );
      const allCategoryQuestions = await Question.find({
        category: category.toLowerCase(),
      });
      if (allCategoryQuestions.length < QUESTIONS_PER_ROUND) {
        return res.status(404).json({
          success: false,
          message: `Not enough questions available for ${category} to create a round of ${QUESTIONS_PER_ROUND} questions.`,
        });
      } // Use all available questions for the category and select randomly
      const selectedQuestions = getRandomQuestions(
        allCategoryQuestions,
        QUESTIONS_PER_ROUND
      );
      const questionsForUser = selectedQuestions.map((q) => ({
        _id: q._id,
        questionText: q.questionText,
        options: q.options,
        category: q.category,
        difficulty: q.difficulty,
      }));
      return res
        .status(200)
        .json({ success: true, questions: questionsForUser });
    } // Get a random subset of questions

    const selectedQuestions = getRandomQuestions(
      questions,
      QUESTIONS_PER_ROUND
    ); // Map questions to hide the correct answer before sending to frontend

    const questionsForUser = selectedQuestions.map((q) => ({
      _id: q._id,
      questionText: q.questionText,
      options: q.options,
      category: q.category,
      difficulty: q.difficulty,
    }));

    res.status(200).json({ success: true, questions: questionsForUser });
  } catch (error) {
    console.error("Error fetching quiz questions:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching quiz questions",
    });
  }
};

// @desc    Submit a quiz attempt
// @route   POST /api/quiz/submit
// @access  Private (requires authentication)
export const submitQuizAttempt = async (req, res) => {
  const { quizCategory, roundNumber, answers } = req.body;
  const userId = req.user._id; // Assuming user ID is available from authentication middleware

  if (!quizCategory || !roundNumber || !answers || !Array.isArray(answers)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid quiz submission data." });
  }

  try {
    let score = 0;
    const processedAnswers = [];
    const questionIds = answers.map((a) => a.questionId); // Fetch all questions involved in this attempt to verify answers

    const questionsInAttempt = await Question.find({
      _id: { $in: questionIds },
    });
    const questionMap = new Map(
      questionsInAttempt.map((q) => [q._id.toString(), q])
    );

    for (const userAnswer of answers) {
      const question = questionMap.get(userAnswer.questionId);

      if (!question) {
        // If a question ID is invalid, skip it or handle as an error
        console.warn(`Question with ID ${userAnswer.questionId} not found.`);
        continue;
      }

      const isCorrect = userAnswer.userAnswerIndex === question.correctAnswer;
      if (isCorrect) {
        score++;
      }

      processedAnswers.push({
        questionId: userAnswer.questionId,
        userAnswerIndex: userAnswer.userAnswerIndex,
        isCorrect: isCorrect,
      });
    } // Find existing attempt for this user, category, and round

    let existingAttempt = await UserQuizAttempt.findOne({
      userId,
      quizCategory: quizCategory.toLowerCase(),
      roundNumber: parseInt(roundNumber),
    });

    if (existingAttempt) {
      // If an attempt exists, update it with the new results
      existingAttempt.answers = processedAnswers;
      existingAttempt.score = score;
      existingAttempt.totalQuestions = answers.length;
      existingAttempt.attemptedAt = Date.now(); // Update the timestamp of the last attempt
      await existingAttempt.save();

      res.status(200).json({
        // Return 200 OK for a successful update
        success: true,
        message: "Quiz attempt updated successfully!",
        score,
        totalQuestions: answers.length,
        attemptId: existingAttempt._id,
      });
    } else {
      // If no existing attempt, create a new one
      const newAttempt = new UserQuizAttempt({
        userId,
        quizCategory: quizCategory.toLowerCase(),
        roundNumber: parseInt(roundNumber),
        answers: processedAnswers,
        score,
        totalQuestions: answers.length, // Total questions submitted in this attempt
      });

      await newAttempt.save();

      res.status(201).json({
        success: true,
        message: "Quiz attempt submitted successfully!",
        score,
        totalQuestions: answers.length,
        attemptId: newAttempt._id,
      });
    }
  } catch (error) {
    console.error("Error submitting quiz attempt:", error);
    res.status(500).json({
      success: false,
      message: "Server error submitting quiz attempt",
    });
  }
};

// @desc    Get user's quiz results for a specific category and round
// @route   GET /api/quiz/:category/:roundNumber/results
// @access  Private (requires authentication)
export const getQuizResults = async (req, res) => {
  const { category, roundNumber } = req.params;
  const userId = req.user._id; // Assuming user ID is available from authentication middleware

  try {
    const attempt = await UserQuizAttempt.findOne({
      userId,
      quizCategory: category.toLowerCase(),
      roundNumber: parseInt(roundNumber),
    }).populate({
      path: "answers.questionId", // Populate the question details for each answer
      select: "questionText options correctAnswer", // Select specific fields
    });

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: "Quiz attempt not found for this user, category, and round.",
      });
    }

    res.status(200).json({ success: true, attempt });
  } catch (error) {
    console.error("Error fetching quiz results:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error fetching quiz results" });
  }
};

// NEW: @desc    Get user's completed quiz rounds for a specific category
// NEW: @route   GET /api/quiz/:category/progress
// NEW: @access  Private (requires authentication)
export const getUserQuizProgress = async (req, res) => {
  const { category } = req.params;
  const userId = req.user._id; // Assuming user ID is available from authentication middleware

  try {
    // Find all attempts for the user in the given category
    const completedAttempts = await UserQuizAttempt.find({
      userId,
      quizCategory: category.toLowerCase(),
    }).select("roundNumber -_id"); // Select only roundNumber and exclude _id // Extract unique round numbers

    const completedRounds = completedAttempts
      .map((attempt) => attempt.roundNumber)
      .sort((a, b) => a - b);

    res.status(200).json({ success: true, completedRounds });
  } catch (error) {
    console.error("Error fetching user quiz progress:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching user quiz progress",
    });
  }
};
