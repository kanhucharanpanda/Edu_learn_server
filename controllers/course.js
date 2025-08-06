
// import { instance } from "../index.js";
// import TryCatch from "../middlewares/TryCatch.js";
// import { Courses } from "../models/Courses.js";
// import { Lecture } from "../models/Lecture.js";
// import { User } from "../models/User.js";
// import { Newsletter } from "../models/Newsletter.js";
// import crypto from "crypto";
// import { Payment } from "../models/Payment.js";
// import { Progress } from "../models/Progress.js";
// import { sendCourseNotificationEmail } from "../middlewares/sendMail.js";
// import moment from "moment";

// export const getAllCourses = TryCatch(async (req, res) => {
//   const courses = await Courses.find();
//   res.json({
//     courses,
//   });
// });

// export const getSingleCourse = TryCatch(async (req, res) => {
//   const course = await Courses.findById(req.params.id);

//   res.json({
//     course,
//   });
// });

// export const fetchLectures = TryCatch(async (req, res) => {
//   const lectures = await Lecture.find({ course: req.params.id });

//   const user = await User.findById(req.user._id);

//   if (user.role === "admin") {
//     return res.json({ lectures });
//   }

//   if (!user.subscription.includes(req.params.id))
//     return res.status(400).json({
//       message: "You have not subscribed to this course",
//     });

//   res.json({ lectures });
// });

// export const fetchLecture = TryCatch(async (req, res) => {
//   const lecture = await Lecture.findById(req.params.id);

//   const user = await User.findById(req.user._id);

//   if (user.role === "admin") {
//     return res.json({ lecture });
//   }

//   if (!user.subscription.includes(lecture.course))
//     return res.status(400).json({
//       message: "You have not subscribed to this course",
//     });

//   res.json({ lecture });
// });

// export const getMyCourses = TryCatch(async (req, res) => {
//   const courses = await Courses.find({ _id: req.user.subscription });

//   res.json({
//     courses,
//   });
// });

// export const checkout = TryCatch(async (req, res) => {
//   const user = await User.findById(req.user._id);

//   const course = await Courses.findById(req.params.id);

//   if (user.subscription.includes(course._id)) {
//     return res.status(400).json({
//       message: "You already have this course",
//     });
//   }

//   const options = {
//     amount: Number(course.price * 100),
//     currency: "INR",
//   };

//   const order = await instance.orders.create(options);

//   res.status(201).json({
//     order,
//     course,
//   });
// });

// export const paymentVerification = TryCatch(async (req, res) => {
//   const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
//     req.body;

//   const body = razorpay_order_id + "|" + razorpay_payment_id;

//   const expectedSignature = crypto
//     .createHmac("sha256", process.env.Razorpay_Secret)
//     .update(body)
//     .digest("hex");

//   const isAuthentic = expectedSignature === razorpay_signature;

//   if (isAuthentic) {
//     await Payment.create({
//       razorpay_order_id,
//       razorpay_payment_id,
//       razorpay_signature,
//     });

//     const user = await User.findById(req.user._id);

//     const course = await Courses.findById(req.params.id);

//     user.subscription.push(course._id);

//     await Progress.create({
//       course: course._id,
//       completedLectures: [],
//       user: req.user._id,
//     });

//     await user.save();

//     res.status(200).json({
//       message: "Course Purchased Successfully",
//     });
//   } else {
//     return res.status(400).json({
//       message: "Payment Failed",
//     });
//   }
// });

// export const addProgress = TryCatch(async (req, res) => {
//   const progress = await Progress.findOne({
//     user: req.user._id,
//     course: req.query.course,
//   });

//   const { lectureId } = req.query;

//   if (progress.completedLectures.includes(lectureId)) {
//     return res.json({
//       message: "Progress recorded",
//     });
//   }

//   progress.completedLectures.push(lectureId);

//   await progress.save();

//   res.status(201).json({
//     message: "new Progress added",
//   });
// });

// // export const getYourProgress = TryCatch(async (req, res) => {
// //   const progress = await Progress.find({
// //     user: req.user._id,
// //     course: req.query.course,
// //   });

// //   if (!progress) return res.status(404).json({ message: "null" });

// //   const allLectures = (await Lecture.find({ course: req.query.course })).length;

// //   const completedLectures = progress[0].completedLectures.length;

// //   const courseProgressPercentage = (completedLectures * 100) / allLectures;

// //   res.json({
// //     courseProgressPercentage,
// //     completedLectures,
// //     allLectures,
// //     progress,
// //   });
// // });


// // In server/controllers/course.js

// export const getYourProgress = TryCatch(async (req, res) => {
//   // Use findOne to get a single document or null
//   const progress = await Progress.findOne({
//     user: req.user._id,
//     course: req.query.course,
//   });

//   const allLectures = (await Lecture.find({ course: req.query.course })).length;

//   // If no progress document is found, it means the user has 0% progress.
//   if (!progress) {
//     return res.json({
//       courseProgressPercentage: 0,
//       completedLectures: 0,
//       allLectures,
//       progress: { completedLectures: [] }, // Send a default progress object
//     });
//   }

//   const completedLecturesCount = progress.completedLectures.length;

//   // Prevent division by zero if a course has no lectures
//   const courseProgressPercentage =
//     allLectures > 0 ? (completedLecturesCount * 100) / allLectures : 0;

//   res.json({
//     courseProgressPercentage,
//     completedLectures: completedLecturesCount,
//     allLectures,
//     progress,
//   });
// });

// // Admin: Create new course with email notifications
// export const createCourse = TryCatch(async (req, res) => {
//   const { title, description, instructor, category, level, price, image } =
//     req.body;

//   const course = await Courses.create({
//     title,
//     description,
//     instructor,
//     category,
//     level,
//     price,
//     image,
//     createdBy: req.user._id,
//   });

//   // Send notifications to all active subscribers
//   try {
//     const subscribers = await Newsletter.find({
//       isActive: true,
//       "preferences.newCourses": true,
//     }).select("email");

//     if (subscribers.length > 0) {
//       console.log(
//         `Sending course notification to ${subscribers.length} subscribers`
//       );

//       const courseData = {
//         id: course._id,
//         title: course.title,
//         description: course.description,
//         instructor: course.instructor,
//         category: course.category,
//         level: course.level,
//         price: course.price,
//       };

//       // Send emails to all subscribers
//       const emailPromises = subscribers.map(async (subscriber) => {
//         try {
//           await sendCourseNotificationEmail(subscriber.email, courseData);
//           console.log(`Course notification sent to: ${subscriber.email}`);
//         } catch (error) {
//           console.error(
//             `Failed to send notification to ${subscriber.email}:`,
//             error
//           );
//         }
//       });

//       await Promise.all(emailPromises);
//       console.log("Course notification emails sent successfully");
//     }
//   } catch (error) {
//     console.error("Error sending course notifications:", error);
//   }

//   res.status(201).json({
//     message: "Course created successfully",
//     course,
//   });
// });

// // Admin: Update course
// export const updateCourse = TryCatch(async (req, res) => {
//   const course = await Courses.findByIdAndUpdate(req.params.id, req.body, {
//     new: true,
//   });

//   if (!course) {
//     return res.status(404).json({
//       message: "Course not found",
//     });
//   }

//   res.json({
//     message: "Course updated successfully",
//     course,
//   });
// });

// // Admin: Delete course
// export const deleteCourse = TryCatch(async (req, res) => {
//   const course = await Courses.findByIdAndDelete(req.params.id);

//   if (!course) {
//     return res.status(404).json({
//       message: "Course not found",
//     });
//   }

//   // Also delete related lectures and progress
//   await Lecture.deleteMany({ course: req.params.id });
//   await Progress.deleteMany({ course: req.params.id });

//   res.json({
//     message: "Course deleted successfully",
//   });
// });

// // Admin: Get all courses with additional info
// export const getAdminCourses = TryCatch(async (req, res) => {
//   const courses = await Courses.find().populate("createdBy", "name email");

//   res.json({
//     courses,
//   });
// });

// // server/controllers/course.js

// // ... (Existing imports: instance, TryCatch, Courses, Lecture, User, Newsletter, crypto, Payment, Progress, sendCourseNotificationEmail)

// export const checkCourseCompletion = TryCatch(async (req, res) => {
//   const { courseId } = req.params;
//   const userId = req.user._id;

//   // We rely on the Progress model to determine completion.
//   // If you define "completion" as 100% of lectures completed:
//   const courseProgress = await Progress.findOne({
//     user: userId,
//     course: courseId,
//   });
//   const totalLectures = (await Lecture.find({ course: courseId })).length;

//   if (!courseProgress) {
//     return res.status(404).json({ message: "Course progress not found." });
//   }

//   const completedLecturesCount = courseProgress.completedLectures.length;

//   // Check if 100% of lectures are completed.
//   const isCompleted =
//     totalLectures > 0 && completedLecturesCount === totalLectures;

//   res.status(200).json({
//     isCompleted,
//     completedLectures: completedLecturesCount,
//     totalLectures,
//   });
// });

// // Function to generate certificate data (Placeholder for actual certificate generation)
// export const generateCertificateData = TryCatch(async (req, res) => {
//   const { courseId } = req.params;
//   const userId = req.user._id;

//   // Ensure the user has actually completed the course first
//   const courseProgress = await Progress.findOne({
//     user: userId,
//     course: courseId,
//   });
//   const totalLectures = (await Lecture.find({ course: courseId })).length;

//   if (
//     !courseProgress ||
//     courseProgress.completedLectures.length !== totalLectures ||
//     totalLectures === 0
//   ) {
//     return res
//       .status(403)
//       .json({
//         message: "Course not yet completed. Please complete all lectures.",
//       });
//   }

//   const user = await User.findById(userId);
//   const course = await Courses.findById(courseId);

//   if (!user || !course) {
//     return res.status(404).json({ message: "User or Course not found." });
//   }

//   // Prepare the data for the certificate
//   const certificateData = {
//     userName: user.name, // Assuming 'name' is the field for the user's name
//     courseName: course.title,
//     completionDate: moment().format("MMMM Do, YYYY"),
//     certificateId: crypto.randomBytes(16).toString("hex"), // Unique ID for the certificate
//   };

//   // Note: This endpoint sends the data, the frontend will render the certificate.
//   // If you want to generate a PDF on the backend, you would use a library like 'pdfkit' or 'html-pdf' here.

//   res.status(200).json({
//     message: "Certificate data generated successfully",
//     certificateData,
//   });
// });



import { uploadOnCloudinary } from "../config/cloudinary.js";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { instance } from "../index.js";
import TryCatch from "../middlewares/TryCatch.js";
import { Courses } from "../models/Courses.js";
import { Lecture } from "../models/Lecture.js";
import { User } from "../models/User.js";
import { Newsletter } from "../models/Newsletter.js";
import crypto from "crypto";
import { Payment } from "../models/Payment.js";
import { Progress } from "../models/Progress.js";
import { sendCourseNotificationEmail } from "../middlewares/sendMail.js";
import moment from "moment";

export const getAllCourses = TryCatch(async (req, res) => {
  const courses = await Courses.find();
  res.json({
    courses,
  });
});

export const getSingleCourse = TryCatch(async (req, res) => {
  const course = await Courses.findById(req.params.id);

  res.json({
    course,
  });
});

export const fetchLectures = TryCatch(async (req, res) => {
  const lectures = await Lecture.find({ course: req.params.id });

  const user = await User.findById(req.user._id);

  if (user.role === "admin") {
    return res.json({ lectures });
  }

  if (!user.subscription.includes(req.params.id))
    return res.status(400).json({
      message: "You have not subscribed to this course",
    });

  res.json({ lectures });
});

export const fetchLecture = TryCatch(async (req, res) => {
  const lecture = await Lecture.findById(req.params.id);

  const user = await User.findById(req.user._id);

  if (user.role === "admin") {
    return res.json({ lecture });
  }

  if (!user.subscription.includes(lecture.course))
    return res.status(400).json({
      message: "You have not subscribed to this course",
    });

  res.json({ lecture });
});

export const getMyCourses = TryCatch(async (req, res) => {
  const courses = await Courses.find({ _id: req.user.subscription });

  res.json({
    courses,
  });
});

export const checkout = TryCatch(async (req, res) => {
  const user = await User.findById(req.user._id);

  const course = await Courses.findById(req.params.id);

  if (user.subscription.includes(course._id)) {
    return res.status(400).json({
      message: "You already have this course",
    });
  }

  const options = {
    amount: Number(course.price * 100),
    currency: "INR",
  };

  const order = await instance.orders.create(options);

  res.status(201).json({
    order,
    course,
  });
});

export const paymentVerification = TryCatch(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;

  const body = razorpay_order_id + "|" + razorpay_payment_id;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.Razorpay_Secret)
    .update(body)
    .digest("hex");

  const isAuthentic = expectedSignature === razorpay_signature;

  if (isAuthentic) {
    await Payment.create({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });

    const user = await User.findById(req.user._id);

    const course = await Courses.findById(req.params.id);

    user.subscription.push(course._id);

    await Progress.create({
      course: course._id,
      completedLectures: [],
      user: req.user._id,
    });

    await user.save();

    res.status(200).json({
      message: "Course Purchased Successfully",
    });
  } else {
    return res.status(400).json({
      message: "Payment Failed",
    });
  }
});

export const addProgress = TryCatch(async (req, res) => {
  const progress = await Progress.findOne({
    user: req.user._id,
    course: req.query.course,
  });

  const { lectureId } = req.query;

  if (progress.completedLectures.includes(lectureId)) {
    return res.json({
      message: "Progress recorded",
    });
  }

  progress.completedLectures.push(lectureId);

  await progress.save();

  res.status(201).json({
    message: "new Progress added",
  });
});

// export const getYourProgress = TryCatch(async (req, res) => {
//   const progress = await Progress.find({
//     user: req.user._id,
//     course: req.query.course,
//   });

//   if (!progress) return res.status(404).json({ message: "null" });

//   const allLectures = (await Lecture.find({ course: req.query.course })).length;

//   const completedLectures = progress[0].completedLectures.length;

//   const courseProgressPercentage = (completedLectures * 100) / allLectures;

//   res.json({
//     courseProgressPercentage,
//     completedLectures,
//     allLectures,
//     progress,
//   });
// });

// In server/controllers/course.js

export const getYourProgress = TryCatch(async (req, res) => {
  // Use findOne to get a single document or null
  const progress = await Progress.findOne({
    user: req.user._id,
    course: req.query.course,
  });

  const allLectures = (await Lecture.find({ course: req.query.course })).length;

  // If no progress document is found, it means the user has 0% progress.
  if (!progress) {
    return res.json({
      courseProgressPercentage: 0,
      completedLectures: 0,
      allLectures,
      progress: { completedLectures: [] }, // Send a default progress object
    });
  }

  const completedLecturesCount = progress.completedLectures.length;

  // Prevent division by zero if a course has no lectures
  const courseProgressPercentage =
    allLectures > 0 ? (completedLecturesCount * 100) / allLectures : 0;

  res.json({
    courseProgressPercentage,
    completedLectures: completedLecturesCount,
    allLectures,
    progress,
  });
});

// Admin: Create new course with email notifications
export const createCourse = TryCatch(async (req, res) => {
  const { title, description, instructor, category, level, price, image } =
    req.body;

  const course = await Courses.create({
    title,
    description,
    instructor,
    category,
    level,
    price,
    image,
    createdBy: req.user._id,
  });

  // Send notifications to all active subscribers
  try {
    const subscribers = await Newsletter.find({
      isActive: true,
      "preferences.newCourses": true,
    }).select("email");

    if (subscribers.length > 0) {
      console.log(
        `Sending course notification to ${subscribers.length} subscribers`
      );

      const courseData = {
        id: course._id,
        title: course.title,
        description: course.description,
        instructor: course.instructor,
        category: course.category,
        level: course.level,
        price: course.price,
      };

      // Send emails to all subscribers
      const emailPromises = subscribers.map(async (subscriber) => {
        try {
          await sendCourseNotificationEmail(subscriber.email, courseData);
          console.log(`Course notification sent to: ${subscriber.email}`);
        } catch (error) {
          console.error(
            `Failed to send notification to ${subscriber.email}:`,
            error
          );
        }
      });

      await Promise.all(emailPromises);
      console.log("Course notification emails sent successfully");
    }
  } catch (error) {
    console.error("Error sending course notifications:", error);
  }

  res.status(201).json({
    message: "Course created successfully",
    course,
  });
});

// Admin: Update course
export const updateCourse = TryCatch(async (req, res) => {
  const course = await Courses.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  if (!course) {
    return res.status(404).json({
      message: "Course not found",
    });
  }

  res.json({
    message: "Course updated successfully",
    course,
  });
});

// Admin: Delete course
// export const deleteCourse = TryCatch(async (req, res) => {
//   const course = await Courses.findByIdAndDelete(req.params.id);

//   if (!course) {
//     return res.status(404).json({
//       message: "Course not found",
//     });
//   }

//   // Also delete related lectures and progress
//   await Lecture.deleteMany({ course: req.params.id });
//   await Progress.deleteMany({ course: req.params.id });

//   res.json({
//     message: "Course deleted successfully",
//   });
// });

// REPLACE your old deleteCourse function with this updated version
export const deleteCourse = TryCatch(async (req, res) => {
  const courseId = req.params.id;
  const course = await Courses.findById(courseId);

  if (!course) {
    return res.status(404).json({ message: "Course not found" });
  }

  // Find all lectures associated with the course
  const lectures = await Lecture.find({ course: courseId });

  // Loop through and delete each video from Cloudinary
  for (const lecture of lectures) {
    if (lecture.video && lecture.video.public_id) {
      await cloudinary.uploader.destroy(lecture.video.public_id, {
        resource_type: "video",
      });
    }
  }

  // Delete all records from the database
  await Lecture.deleteMany({ course: courseId });
  await Progress.deleteMany({ course: courseId });
  await Courses.findByIdAndDelete(courseId);

  res.json({ message: "Course and all associated files deleted successfully" });
});

// Admin: Get all courses with additional info
export const getAdminCourses = TryCatch(async (req, res) => {
  const courses = await Courses.find().populate("createdBy", "name email");

  res.json({
    courses,
  });
});

// server/controllers/course.js

// ... (Existing imports: instance, TryCatch, Courses, Lecture, User, Newsletter, crypto, Payment, Progress, sendCourseNotificationEmail)

export const checkCourseCompletion = TryCatch(async (req, res) => {
  const { courseId } = req.params;
  const userId = req.user._id;

  // We rely on the Progress model to determine completion.
  // If you define "completion" as 100% of lectures completed:
  const courseProgress = await Progress.findOne({
    user: userId,
    course: courseId,
  });
  const totalLectures = (await Lecture.find({ course: courseId })).length;

  if (!courseProgress) {
    return res.status(404).json({ message: "Course progress not found." });
  }

  const completedLecturesCount = courseProgress.completedLectures.length;

  // Check if 100% of lectures are completed.
  const isCompleted =
    totalLectures > 0 && completedLecturesCount === totalLectures;

  res.status(200).json({
    isCompleted,
    completedLectures: completedLecturesCount,
    totalLectures,
  });
});

// Function to generate certificate data (Placeholder for actual certificate generation)
export const generateCertificateData = TryCatch(async (req, res) => {
  const { courseId } = req.params;
  const userId = req.user._id;

  // Ensure the user has actually completed the course first
  const courseProgress = await Progress.findOne({
    user: userId,
    course: courseId,
  });
  const totalLectures = (await Lecture.find({ course: courseId })).length;

  if (
    !courseProgress ||
    courseProgress.completedLectures.length !== totalLectures ||
    totalLectures === 0
  ) {
    return res.status(403).json({
      message: "Course not yet completed. Please complete all lectures.",
    });
  }

  const user = await User.findById(userId);
  const course = await Courses.findById(courseId);

  if (!user || !course) {
    return res.status(404).json({ message: "User or Course not found." });
  }

  // Prepare the data for the certificate
  const certificateData = {
    userName: user.name, // Assuming 'name' is the field for the user's name
    courseName: course.title,
    completionDate: moment().format("MMMM Do, YYYY"),
    certificateId: crypto.randomBytes(16).toString("hex"), // Unique ID for the certificate
  };

  // Note: This endpoint sends the data, the frontend will render the certificate.
  // If you want to generate a PDF on the backend, you would use a library like 'pdfkit' or 'html-pdf' here.

  res.status(200).json({
    message: "Certificate data generated successfully",
    certificateData,
  });
});

export const addLecture = TryCatch(async (req, res) => {
  const { title, description } = req.body;
  const { courseId } = req.params;

  const localFilePath = req.file?.path;

  if (!localFilePath) {
    return res.status(400).json({ message: "Lecture video file is required." });
  }

  const cloudinaryResponse = await uploadOnCloudinary(localFilePath);

  if (!cloudinaryResponse) {
    return res
      .status(500)
      .json({ message: "Failed to upload file to Cloudinary." });
  }

  const newLecture = await Lecture.create({
    title,
    description,
    course: courseId,
    video: {
      public_id: cloudinaryResponse.public_id,
      url: cloudinaryResponse.secure_url,
    },
  });

  res.status(201).json({
    message: "Lecture added successfully",
    lecture: newLecture,
  });
});

