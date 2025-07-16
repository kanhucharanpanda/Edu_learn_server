// import express from "express";
// import { isAdmin, isAuth } from "../middlewares/isAuth.js";
// import {
//   addLectures,
//   createCourse,
//   deleteCourse,
//   deleteLecture,
//   getAllStats,
//   getAllUser,
//   updateRole,
// } from "../controllers/admin.js";
// import { uploadFiles } from "../middlewares/multer.js";

// const router = express.Router();

// router.post("/course/new", isAuth, isAdmin, uploadFiles, createCourse);
// router.post("/course/:id", isAuth, isAdmin, uploadFiles, addLectures);
// router.delete("/course/:id", isAuth, isAdmin, deleteCourse);
// router.delete("/lecture/:id", isAuth, isAdmin, deleteLecture);
// router.get("/stats", isAuth, isAdmin, getAllStats);
// router.put("/user/:id", isAuth, updateRole);
// router.get("/users", isAuth, isAdmin, getAllUser);

// router.post("/create-course", async (req, res) => {
//   try {
//     // Create the course
//     const newCourse = new Course(req.body);
//     await newCourse.save();

//     // Send newsletter notification
//     const courseData = {
//       id: newCourse._id,
//       title: newCourse.title,
//       description: newCourse.description,
//       image: newCourse.image,
//       instructor: newCourse.instructor,
//       duration: newCourse.duration,
//       price: newCourse.price,
//     };

//     // Send newsletter notification (don't wait for it)
//     fetch("/api/newsletter/send-course-notification", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ courseData }),
//     }).catch((err) => console.error("Newsletter notification failed:", err));

//     res
//       .status(201)
//       .json({ message: "Course created successfully", course: newCourse });
//   } catch (error) {
//     res.status(500).json({ error: "Failed to create course" });
//   }
// });

// export default router;

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
import { uploadFiles } from "../middlewares/multer.js";

const router = express.Router();

// Route for creating a new course (uses the updated createCourse controller)
router.post("/course/new", isAuth, isAdmin, uploadFiles, createCourse);
router.post("/course/:id", isAuth, isAdmin, uploadFiles, addLectures);
router.delete("/course/:id", isAuth, isAdmin, deleteCourse);
router.delete("/lecture/:id", isAuth, isAdmin, deleteLecture);
router.get("/stats", isAuth, isAdmin, getAllStats);
router.put("/user/:id", isAuth, updateRole);
router.get("/users", isAuth, isAdmin, getAllUser);

// [NOTE]: I have removed the duplicate router.post("/create-course", ...) block
// that was previously in this file, as the createCourse function now handles
// the database storage and email notification.

export default router;
