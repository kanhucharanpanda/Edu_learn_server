
import express from "express";
import {
  getAllCourses,
  getSingleCourse,
  fetchLectures,
  fetchLecture,
  getMyCourses,
  checkout,
  paymentVerification,
  createCourse,
  updateCourse,
  deleteCourse,
  getAdminCourses,
} from "../controllers/course.js";
import { isAuth } from "../middlewares/isAuth.js";
import { isAdmin } from "../middlewares/isAdmin.js";
import {
  checkCourseCompletion,
  generateCertificateData,
} from "../controllers/course.js";

const router = express.Router();

// Public routes
router.get("/course/all", getAllCourses);
router.get("/course/:id", getSingleCourse);

// User routes
router.get("/lectures/:id", isAuth, fetchLectures);
router.get("/lecture/:id", isAuth, fetchLecture);
router.get("/mycourse", isAuth, getMyCourses);
router.post("/course/checkout/:id", isAuth, checkout);
router.post("/verification/:id", isAuth, paymentVerification);

// Admin routes
router.get("/admin/courses", isAuth, isAdmin, getAdminCourses);
router.post("/admin/course", isAuth, isAdmin, createCourse);
router.put("/admin/course/:id", isAuth, isAdmin, updateCourse);
router.delete("/admin/course/:id", isAuth, isAdmin, deleteCourse);
router.get("/course/completion/:courseId", isAuth, checkCourseCompletion);
// Route to generate certificate data (assuming completion verified)
router.get("/course/:courseId/certificate", isAuth, generateCertificateData);

export default router;
