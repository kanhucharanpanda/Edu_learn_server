
import express from "express";
import {
  getAllCourses,
  getSingleCourse,
  fetchLectures,
  fetchLecture,
  getMyCourses,
  checkout,
  paymentVerification,
  checkCourseCompletion,
  generateCertificateData,
} from "../controllers/course.js";
import { isAuth } from "../middlewares/isAuth.js";

const router = express.Router();

// Public routes for anyone
router.get("/course/all", getAllCourses);
router.get("/course/:id", getSingleCourse);

// Routes for logged-in users
router.get("/lectures/:id", isAuth, fetchLectures);
router.get("/lecture/:id", isAuth, fetchLecture);
router.get("/mycourse", isAuth, getMyCourses);
router.post("/course/checkout/:id", isAuth, checkout);
router.post("/verification/:id", isAuth, paymentVerification);
router.get("/course/completion/:courseId", isAuth, checkCourseCompletion);
router.get("/course/:courseId/certificate", isAuth, generateCertificateData);

export default router;
