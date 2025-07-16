// import mongoose from "mongoose";

// const newsletterSchema = new mongoose.Schema(
//   {
//     email: {
//       type: String,
//       required: [true, "Email is required"],
//       unique: true,
//       lowercase: true,
//       trim: true,
//       match: [
//         /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
//         "Please enter a valid email address",
//       ],
//     },
//     isActive: {
//       type: Boolean,
//       default: true,
//     },
//     subscribedAt: {
//       type: Date,
//       default: Date.now,
//     },
//     lastEmailSent: {
//       type: Date,
//       default: null,
//     },
//     preferences: {
//       courseUpdates: {
//         type: Boolean,
//         default: true,
//       },
//       promotionalEmails: {
//         type: Boolean,
//         default: true,
//       },
//       weeklyNewsletter: {
//         type: Boolean,
//         default: true,
//       },
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// // Index for email lookup
// newsletterSchema.index({ email: 1 });

// // Method to deactivate subscription
// newsletterSchema.methods.unsubscribe = function () {
//   this.isActive = false;
//   return this.save();
// };

// // Method to reactivate subscription
// newsletterSchema.methods.resubscribe = function () {
//   this.isActive = true;
//   return this.save();
// };

// // Static method to find active subscribers
// newsletterSchema.statics.findActiveSubscribers = function () {
//   return this.find({ isActive: true });
// };

// export default mongoose.model("Newsletter", newsletterSchema);

import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    preferences: {
      newCourses: {
        type: Boolean,
        default: true,
      },
      promotions: {
        type: Boolean,
        default: true,
      },
      newsletters: {
        type: Boolean,
        default: true,
      },
    },
    subscribedAt: {
      type: Date,
      default: Date.now,
    },
    unsubscribedAt: {
      type: Date,
      default: null,
    },
    unsubscribeToken: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const Newsletter = mongoose.model("Newsletter", schema);
