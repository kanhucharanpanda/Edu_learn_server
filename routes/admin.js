
import express from "express";
import { isAdmin, isAuth } from "../middlewares/isAuth.js";
import {
  addLectures,
  createCourse, // This is where the updated logic resides
  deleteCourse,
  deleteLecture,
  getAllStats,
  getAllUser,
  updateRole,
} from "../controllers/admin.js";

import { getAdminCourses } from "../controllers/course.js";
import { uploadFiles } from "../middlewares/multer.js";

console.log("ROUTER CHECK: typeof createCourse is", typeof createCourse);
console.log("ROUTER CHECK: typeof addLectures is", typeof addLectures);

const router = express.Router();

// Route for creating a new course (uses the updated createCourse controller)
//router.post("/course/new", isAuth, isAdmin, uploadFiles, createCourse);
//router.post("/course/:id", isAuth, isAdmin, uploadFiles, addLectures);
router.post(
  "/course/new",
  isAuth,
  isAdmin,
  uploadFiles.single("image"),
  createCourse
);
router.post(
  "/course/:id",
  isAuth,
  isAdmin,
  uploadFiles.single("video"),
  addLectures
);
router.delete("/course/:id", isAuth, isAdmin, deleteCourse);
router.delete("/lecture/:id", isAuth, isAdmin, deleteLecture);
router.get("/stats", isAuth, isAdmin, getAllStats);
router.put("/user/:id", isAuth, updateRole);
router.get("/users", isAuth, isAdmin, getAllUser);

// [NOTE]: I have removed the duplicate router.post("/create-course", ...) block
// that was previously in this file, as the createCourse function now handles
// the database storage and email notification.

// Get all courses for the admin dashboard
router.get("/courses", isAuth, isAdmin, getAdminCourses);

// Create a new course with an image upload
router.post(
  "/course/new",
  isAuth,
  isAdmin,
  uploadFiles.single("image"),
  createCourse
);

// Add a lecture with a video upload to a specific course
router.post(
  "/course/:id/lecture",
  isAuth,
  isAdmin,
  uploadFiles.single("video"),
  addLectures
);

// Update an existing course
// Note: You'll need an updateCourse function in your admin.js controller
// router.put("/course/:id", isAuth, isAdmin, updateCourse);

// Delete a course
router.delete("/course/:id", isAuth, isAdmin, deleteCourse);

// Delete a lecture
router.delete("/lecture/:id", isAuth, isAdmin, deleteLecture);

export default router;
