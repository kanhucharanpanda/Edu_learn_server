
import TryCatch from "../middlewares/TryCatch.js";
import { Courses } from "../models/Courses.js";
import { Lecture } from "../models/Lecture.js";
import { rm } from "fs";
import { promisify } from "util";
import fs from "fs";
import { User } from "../models/User.js";
import { Newsletter } from "../models/Newsletter.js";
import { sendCourseNotificationEmail } from "../middlewares/sendMail.js";

export const createCourse = TryCatch(async (req, res) => {
  const { title, description, category, createdBy, duration, price, level } =
    req.body;
  const image = req.file;

  // 1. Create the course
  const newCourse = await Courses.create({
    title,
    description,
    category,
    createdBy,
    image: image?.path,
    duration,
    price,
  });

  // 2. Send email notification to all active subscribers who prefer new course updates
  // Fetch active subscribers who have 'newCourses' preference set to true
  console.log(
    "Attempting to find active subscribers for course notification..."
  );

  const subscribers = await Newsletter.find({
    isActive: true,
    "preferences.newCourses": true,
  }).select("email");

  console.log(
    `Found ${subscribers.length} active subscribers for new course: ${newCourse.title}`
  );

  if (subscribers.length === 0) {
    console.log(
      "No subscribers found with isActive=true and newCourses=true. Skipping email notifications."
    );
  }
  // Prepare the course data for the email
  const courseData = {
    id: newCourse._id,
    title: newCourse.title,
    description: newCourse.description,
    instructor: newCourse.createdBy,
    category: newCourse.category,
    price: newCourse.price,
    level: level || "N/A", // Add level if available in the request body
  };

  // Send emails asynchronously (using Promise.allSettled to handle potential failures without stopping)
  const emailPromises = subscribers.map(async (subscriber) => {
    try {
      await sendCourseNotificationEmail(subscriber.email, courseData);
      console.log(
        `Notification email sent to ${subscriber.email} for new course: ${newCourse.title}`
      );
    } catch (error) {
      console.error(
        `Failed to send course notification email to ${subscriber.email}:`,
        error
      );
    }
  });

  // Execute all email sending promises
  Promise.allSettled(emailPromises);

  // 3. Respond to the admin
  res.status(201).json({
    message:
      "Course Created Successfully and notifications sent to relevant subscribers.",
    course: newCourse,
  });
});

// ... (rest of the code for addLectures, deleteLecture, deleteCourse, getAllStats, getAllUser, updateRole, etc.)
// (Ensure your existing functions are included here)
// ...

export const addLectures = TryCatch(async (req, res) => {
  const course = await Courses.findById(req.params.id);

  if (!course)
    return res.status(404).json({
      message: "No Course with this id",
    });

  const { title, description } = req.body;

  const file = req.file;

  const lecture = await Lecture.create({
    title,
    description,
    video: file?.path,
    course: course._id,
  });

  res.status(201).json({
    message: "Lecture Added",
    lecture,
  });
});

export const deleteLecture = TryCatch(async (req, res) => {
  const lecture = await Lecture.findById(req.params.id);

  rm(lecture.video, () => {
    console.log("Video deleted");
  });

  await lecture.deleteOne();

  res.json({ message: "Lecture Deleted" });
});

const unlinkAsync = promisify(fs.unlink);

export const deleteCourse = TryCatch(async (req, res) => {
  const course = await Courses.findById(req.params.id);

  const lectures = await Lecture.find({ course: course._id });

  await Promise.all(
    lectures.map(async (lecture) => {
      await unlinkAsync(lecture.video);
      console.log("video deleted");
    })
  );

  rm(course.image, () => {
    console.log("image deleted");
  });

  await Lecture.find({ course: req.params.id }).deleteMany();

  await course.deleteOne();

  await User.updateMany({}, { $pull: { subscription: req.params.id } });

  res.json({
    message: "Course Deleted",
  });
});

export const getAllStats = TryCatch(async (req, res) => {
  const totalCoures = (await Courses.find()).length;
  const totalLectures = (await Lecture.find()).length;
  const totalUsers = (await User.find()).length;

  const stats = {
    totalCoures,
    totalLectures,
    totalUsers,
  };

  res.json({
    stats,
  });
});

export const getAllUser = TryCatch(async (req, res) => {
  const users = await User.find({ _id: { $ne: req.user._id } }).select(
    "-password"
  );

  res.json({ users });
});

export const updateRole = TryCatch(async (req, res) => {
  if (req.user.mainrole !== "superadmin")
    return res.status(403).json({
      message: "This endpoint is assign to superadmin",
    });
  const user = await User.findById(req.params.id);

  if (user.role === "user") {
    user.role = "admin";
    await user.save();

    return res.status(200).json({
      message: "Role updated to admin",
    });
  }

  if (user.role === "admin") {
    user.role = "user";
    await user.save();

    return res.status(200).json({
      message: "Role updated",
    });
  }
});

export const updateUserRole = TryCatch(async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  const user = await User.findById(id);

  if (!user) {
    return res.status(404).json({
      message: "User not found",
    });
  }

  user.role = role;
  await user.save();

  res.json({
    message: "User role updated successfully",
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});

// Get dashboard stats
export const getDashboardStats = TryCatch(async (req, res) => {
  const totalCourses = await Courses.countDocuments();
  const totalUsers = await User.countDocuments();
  const totalLectures = await Lecture.countDocuments();

  // Recent courses (last 30 days)
  const recentCourses = await Courses.countDocuments({
    createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
  });

  // Recent users (last 30 days)
  const recentUsers = await User.countDocuments({
    createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
  });

  res.json({
    totalCourses,
    totalUsers,
    totalLectures,
    recentCourses,
    recentUsers,
  });
});
