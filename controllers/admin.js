
// import TryCatch from "../middlewares/TryCatch.js";
// import { Courses } from "../models/Courses.js";
// import { Lecture } from "../models/Lecture.js";
// import { rm } from "fs";
// import { promisify } from "util";
// import fs from "fs";
// import { User } from "../models/User.js";
// import { Newsletter } from "../models/Newsletter.js";
// import { sendCourseNotificationEmail } from "../middlewares/sendMail.js";

// export const createCourse = TryCatch(async (req, res) => {
//   const { title, description, category, createdBy, duration, price, level } =
//     req.body;
//   const image = req.file;

//   // 1. Create the course
//   const newCourse = await Courses.create({
//     title,
//     description,
//     category,
//     createdBy,
//     image: image?.path,
//     duration,
//     price,
//   });

//   // 2. Send email notification to all active subscribers who prefer new course updates
//   // Fetch active subscribers who have 'newCourses' preference set to true
//   console.log(
//     "Attempting to find active subscribers for course notification..."
//   );

//   const subscribers = await Newsletter.find({
//     isActive: true,
//     "preferences.newCourses": true,
//   }).select("email");

//   console.log(
//     `Found ${subscribers.length} active subscribers for new course: ${newCourse.title}`
//   );

//   if (subscribers.length === 0) {
//     console.log(
//       "No subscribers found with isActive=true and newCourses=true. Skipping email notifications."
//     );
//   }
//   // Prepare the course data for the email
//   const courseData = {
//     id: newCourse._id,
//     title: newCourse.title,
//     description: newCourse.description,
//     instructor: newCourse.createdBy,
//     category: newCourse.category,
//     price: newCourse.price,
//     level: level || "N/A", // Add level if available in the request body
//   };

//   // Send emails asynchronously (using Promise.allSettled to handle potential failures without stopping)
//   const emailPromises = subscribers.map(async (subscriber) => {
//     try {
//       await sendCourseNotificationEmail(subscriber.email, courseData);
//       console.log(
//         `Notification email sent to ${subscriber.email} for new course: ${newCourse.title}`
//       );
//     } catch (error) {
//       console.error(
//         `Failed to send course notification email to ${subscriber.email}:`,
//         error
//       );
//     }
//   });

//   // Execute all email sending promises
//   Promise.allSettled(emailPromises);

//   // 3. Respond to the admin
//   res.status(201).json({
//     message:
//       "Course Created Successfully and notifications sent to relevant subscribers.",
//     course: newCourse,
//   });
// });

// // ... (rest of the code for addLectures, deleteLecture, deleteCourse, getAllStats, getAllUser, updateRole, etc.)
// // (Ensure your existing functions are included here)
// // ...

// export const addLectures = TryCatch(async (req, res) => {
//   const course = await Courses.findById(req.params.id);

//   if (!course)
//     return res.status(404).json({
//       message: "No Course with this id",
//     });

//   const { title, description } = req.body;

//   const file = req.file;

//   const lecture = await Lecture.create({
//     title,
//     description,
//     video: file?.path,
//     course: course._id,
//   });

//   res.status(201).json({
//     message: "Lecture Added",
//     lecture,
//   });
// });

// export const deleteLecture = TryCatch(async (req, res) => {
//   const lecture = await Lecture.findById(req.params.id);

//   rm(lecture.video, () => {
//     console.log("Video deleted");
//   });

//   await lecture.deleteOne();

//   res.json({ message: "Lecture Deleted" });
// });

// const unlinkAsync = promisify(fs.unlink);

// export const deleteCourse = TryCatch(async (req, res) => {
//   const course = await Courses.findById(req.params.id);

//   const lectures = await Lecture.find({ course: course._id });

//   await Promise.all(
//     lectures.map(async (lecture) => {
//       await unlinkAsync(lecture.video);
//       console.log("video deleted");
//     })
//   );

//   rm(course.image, () => {
//     console.log("image deleted");
//   });

//   await Lecture.find({ course: req.params.id }).deleteMany();

//   await course.deleteOne();

//   await User.updateMany({}, { $pull: { subscription: req.params.id } });

//   res.json({
//     message: "Course Deleted",
//   });
// });

// export const getAllStats = TryCatch(async (req, res) => {
//   const totalCoures = (await Courses.find()).length;
//   const totalLectures = (await Lecture.find()).length;
//   const totalUsers = (await User.find()).length;

//   const stats = {
//     totalCoures,
//     totalLectures,
//     totalUsers,
//   };

//   res.json({
//     stats,
//   });
// });

// export const getAllUser = TryCatch(async (req, res) => {
//   const users = await User.find({ _id: { $ne: req.user._id } }).select(
//     "-password"
//   );

//   res.json({ users });
// });

// export const updateRole = TryCatch(async (req, res) => {
//   if (req.user.mainrole !== "superadmin")
//     return res.status(403).json({
//       message: "This endpoint is assign to superadmin",
//     });
//   const user = await User.findById(req.params.id);

//   if (user.role === "user") {
//     user.role = "admin";
//     await user.save();

//     return res.status(200).json({
//       message: "Role updated to admin",
//     });
//   }

//   if (user.role === "admin") {
//     user.role = "user";
//     await user.save();

//     return res.status(200).json({
//       message: "Role updated",
//     });
//   }
// });

// export const updateUserRole = TryCatch(async (req, res) => {
//   const { id } = req.params;
//   const { role } = req.body;

//   const user = await User.findById(id);

//   if (!user) {
//     return res.status(404).json({
//       message: "User not found",
//     });
//   }

//   user.role = role;
//   await user.save();

//   res.json({
//     message: "User role updated successfully",
//     user: {
//       id: user._id,
//       name: user.name,
//       email: user.email,
//       role: user.role,
//     },
//   });
// });

// // Get dashboard stats
// export const getDashboardStats = TryCatch(async (req, res) => {
//   const totalCourses = await Courses.countDocuments();
//   const totalUsers = await User.countDocuments();
//   const totalLectures = await Lecture.countDocuments();

//   // Recent courses (last 30 days)
//   const recentCourses = await Courses.countDocuments({
//     createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
//   });

//   // Recent users (last 30 days)
//   const recentUsers = await User.countDocuments({
//     createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
//   });

//   res.json({
//     totalCourses,
//     totalUsers,
//     totalLectures,
//     recentCourses,
//     recentUsers,
//   });
// });








import TryCatch from "../middlewares/TryCatch.js";
import { Courses } from "../models/Courses.js";
import { Lecture } from "../models/Lecture.js";
import { rm } from "fs";
import { promisify } from "util";
import fs from "fs";
import { User } from "../models/User.js";
// Import the Newsletter model and the required email sender
import { Newsletter } from "../models/Newsletter.js";
import { sendCourseNotificationEmail } from "../middlewares/sendMail.js";
import { uploadOnCloudinary } from "../config/cloudinary.js";
import { v2 as cloudinary } from "cloudinary";
import { Progress } from "../models/Progress.js";

//Replace your old createCourse function with this new version
export const createCourse = TryCatch(async (req, res) => {
  const { title, description, category, createdBy, duration, price, level } =
    req.body;
  const image = req.file;
  // Get the path of the image uploaded by Multer
  const localFilePath = req.file?.path;

  if (!localFilePath) {
    return res.status(400).json({ message: "Course image is required." });
  }

  // Upload the image to Cloudinary
  const cloudinaryResponse = await uploadOnCloudinary(localFilePath);

  if (!cloudinaryResponse) {
    return res.status(500).json({ message: "Failed to upload image." });
  }

  const newCourse = await Courses.create({
    title,
    description,
    category,
    createdBy,
    // Save the Cloudinary URL and public_id
    image: {
      public_id: cloudinaryResponse.public_id,
      url: cloudinaryResponse.secure_url,
    },
    duration,
    price,
    level: level || "All Levels",
  });

  // ... (rest of your logic for sending emails)
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

  res.status(201).json({
    message: "Course Created Successfully.",
    course: newCourse,
  });
});

export const addLectures = TryCatch(async (req, res) => {
  const { title, description } = req.body;
  const { id: courseId } = req.params; // Get courseId from params

  const course = await Courses.findById(courseId);
  if (!course) {
    return res.status(404).json({ message: "No Course with this id" });
  }

  const localFilePath = req.file?.path;
  if (!localFilePath) {
    return res.status(400).json({ message: "Lecture video file is required." });
  }

  // Upload the file to Cloudinary
  const cloudinaryResponse = await uploadOnCloudinary(localFilePath);
  if (!cloudinaryResponse) {
    return res
      .status(500)
      .json({ message: "Failed to upload file to Cloudinary." });
  }

  // Create the lecture with the Cloudinary URL and public_id
  const lecture = await Lecture.create({
    title,
    description,
    video: {
      public_id: cloudinaryResponse.public_id,
      url: cloudinaryResponse.secure_url,
    },
    course: courseId,
  });

  res.status(201).json({
    message: "Lecture Added Successfully",
    lecture,
  });
});

export const deleteLecture = TryCatch(async (req, res) => {
  const lecture = await Lecture.findById(req.params.id);
  if (!lecture) {
    return res.status(404).json({ message: "Lecture not found" });
  }

  // 1. Delete the video file from Cloudinary
  if (lecture.video && lecture.video.public_id) {
    await cloudinary.uploader.destroy(lecture.video.public_id, {
      resource_type: "video",
    });
  }

  // 2. Delete the lecture record from the database
  await lecture.deleteOne();

  res.json({ message: "Lecture Deleted Successfully" });
});

const unlinkAsync = promisify(fs.unlink);

export const deleteCourse = TryCatch(async (req, res) => {
  const course = await Courses.findById(req.params.id);
  if (!course) {
    return res.status(404).json({ message: "Course not found" });
  }

  // 1. Delete course image from Cloudinary
  if (course.image && course.image.public_id) {
    await cloudinary.uploader.destroy(course.image.public_id);
  }

  const lectures = await Lecture.find({ course: course._id });

  // 2. Delete all associated lecture videos from Cloudinary
  for (const lecture of lectures) {
    if (lecture.video && lecture.video.public_id) {
      await cloudinary.uploader.destroy(lecture.video.public_id, {
        resource_type: "video",
      });
    }
  }

  // 3. Delete all records from the database
  await Lecture.deleteMany({ course: req.params.id });
  await Progress.deleteMany({ course: req.params.id });
  await course.deleteOne();
  await User.updateMany({}, { $pull: { subscription: req.params.id } });

  res.json({ message: "Course Deleted Successfully" });
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

console.log("CONTROLLER CHECK: typeof createCourse is", typeof createCourse);
console.log("CONTROLLER CHECK: typeof addLectures is", typeof addLectures);
