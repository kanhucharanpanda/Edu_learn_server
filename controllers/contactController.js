import TryCatch from "../middlewares/TryCatch.js";
import { sendSimpleEmail } from "../middlewares/sendMail.js";

export const handleContactForm = TryCatch(async (req, res) => {
  const { name, email, subject, message, category } = req.body;

  // --- Basic Validation ---
  if (!name || !email || !subject || !message) {
    return res.status(400).json({
      success: false,
      message: "Please fill in all required fields.",
    });
  }

  // --- 1. Prepare and Send Email to Admin ---
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminMailSubject = `New Contact Inquiry: ${subject}`;
  const adminMailHtml = `
    <h1>New Message from EduLearn Contact Form</h1>
    <p>You have received a new inquiry with the following details:</p>
    <ul>
      <li><strong>Name:</strong> ${name}</li>
      <li><strong>Email:</strong> <a href="mailto:${email}">${email}</a></li>
      <li><strong>Category:</strong> ${category}</li>
    </ul>
    <hr>
    <h2>Message:</h2>
    <p>${message}</p>
    <hr>
  `;
  await sendSimpleEmail(adminEmail, adminMailSubject, adminMailHtml);

  // --- 2. Prepare and Send Confirmation Email to User ---
  const userMailSubject = `We've received your message, ${name}!`;
  const userMailHtml = `
    <h1>Thank you for contacting EduLearn!</h1>
    <p>Hi ${name},</p>
    <p>We have successfully received your message and our team will get back to you as soon as possible, typically within 24 hours.</p>
    <p><strong>Here is a copy of your inquiry:</strong></p>
    <hr>
    <p><strong>Subject:</strong> ${subject}</p>
    <p><strong>Message:</strong> ${message}</p>
    <hr>
    <p>Best regards,</p>
    <p>The EduLearn Team</p>
  `;
  await sendSimpleEmail(email, userMailSubject, userMailHtml);

  // --- 3. Send Success Response to Frontend ---
  res.status(200).json({
    success: true,
    message: "Your message has been sent successfully!",
  });
});
