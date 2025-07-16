import { Newsletter } from "../models/Newsletter.js";
import { sendCourseNotificationEmail } from "../middlewares/sendMail.js";

// Send new course notification to all subscribers
export const notifySubscribersAboutNewCourse = async (courseData) => {
  try {
    // Get all active subscribers who want new course notifications
    const subscribers = await Newsletter.find({
      isActive: true,
      "preferences.newCourses": true,
    }).select("email");

    if (subscribers.length === 0) {
      console.log("No active subscribers found for course notifications");
      return;
    }

    console.log(
      `Sending course notification to ${subscribers.length} subscribers`
    );

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

    // Wait for all emails to be sent
    await Promise.all(emailPromises);
    console.log("Course notification emails sent successfully");
  } catch (error) {
    console.error("Error sending course notifications:", error);
  }
};

// Send bulk newsletter
export const sendBulkNewsletter = async (
  subject,
  content,
  type = "newsletter"
) => {
  try {
    const subscribers = await Newsletter.find({
      isActive: true,
    }).select("email");

    if (subscribers.length === 0) {
      console.log("No active subscribers found");
      return;
    }

    console.log(`Sending bulk newsletter to ${subscribers.length} subscribers`);

    const emailPromises = subscribers.map(async (subscriber) => {
      try {
        await sendNewsletterEmail(subscriber.email, subject, content, type);
        console.log(`Newsletter sent to: ${subscriber.email}`);
      } catch (error) {
        console.error(
          `Failed to send newsletter to ${subscriber.email}:`,
          error
        );
      }
    });

    await Promise.all(emailPromises);
    console.log("Bulk newsletter sent successfully");
  } catch (error) {
    console.error("Error sending bulk newsletter:", error);
  }
};

// Get newsletter statistics
export const getNewsletterStats = async () => {
  try {
    const totalSubscribers = await Newsletter.countDocuments({
      isActive: true,
    });
    const totalUnsubscribed = await Newsletter.countDocuments({
      isActive: false,
    });
    const recentSubscribers = await Newsletter.countDocuments({
      isActive: true,
      subscribedAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }, // Last 30 days
    });

    return {
      totalSubscribers,
      totalUnsubscribed,
      recentSubscribers,
    };
  } catch (error) {
    console.error("Error getting newsletter stats:", error);
    return null;
  }
};
