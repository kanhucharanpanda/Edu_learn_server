import mongoose from "mongoose";

const schema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },

  // image: {
  //   type: String,
  //   required: true,
  // },
  image: {
    public_id: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
  },
  price: {
    type: Number,
    required: true,
  },
  duration: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  createdBy: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Courses = mongoose.model("Courses", schema);

// import mongoose from "mongoose";

// const schema = new mongoose.Schema(
//   {
//     title: {
//       type: String,
//       required: true,
//     },
//     description: {
//       type: String,
//       required: true,
//     },
//     instructor: {
//       type: String,
//       required: true,
//     },
//     category: {
//       type: String,
//       required: true,
//     },
//     level: {
//       type: String,
//       required: true,
//       enum: ["Beginner", "Intermediate", "Advanced"],
//     },
//     price: {
//       type: Number,
//       required: true,
//     },
//     image: {
//       type: String,
//       required: true,
//     },
//     createdBy: {
//       type: String,
//       ref: "User",
//       required: true,
//     },
//     isActive: {
//       type: Boolean,
//       default: true,
//     },
//     enrolledStudents: {
//       type: Number,
//       default: 0,
//     },
//     duration: {
//       type: String,
//       default: "0 hours",
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// export const Courses = mongoose.model("Courses", schema);
