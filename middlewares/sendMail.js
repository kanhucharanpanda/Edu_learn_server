import { createTransport } from "nodemailer";

const sendMail = async (email, subject, data) => {
  const transport = createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // Use SSL/TLS
    auth: {
      user: process.env.Gmail,
      pass: process.env.Password,
    },
  });

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OTP Verification</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            background-color: #f0f2f5;
        }
        .container {
            background-color: #fff;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
            text-align: center;
            max-width: 400px;
            width: 90%;
        }
        h1 {
            color: #6A1B9A; /* Deep Purple */
            margin-bottom: 15px;
            font-size: 28px;
        }
        p {
            margin-bottom: 20px;
            color: #555;
            line-height: 1.6;
        }
        .otp {
            font-size: 40px;
            color: #00BFA5; /* Vibrant Teal */
            font-weight: bold;
            margin-bottom: 30px;
            letter-spacing: 3px;
            background-color: #e0f7fa;
            padding: 10px 20px;
            border-radius: 8px;
            display: inline-block;
        }
        .footer {
            margin-top: 25px;
            font-size: 12px;
            color: #888;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>OTP Verification</h1>
        <p>Hello ${data.name},</p>
        <p>Your One-Time Password (OTP) for account verification is:</p>
        <p class="otp">${data.otp}</p>
        <p>This OTP is valid for 5 minutes. Do not share this code with anyone.</p>
        <div class="footer">
            <p>If you did not request this, please ignore this email.</p>
            <p>&copy; ${new Date().getFullYear()} EduLearn Platform. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`;

  await transport.sendMail({
    from: process.env.Gmail,
    to: email,
    //subject,
    html,
  });
};

export default sendMail;

export const sendForgotMail = async (subject, data) => {
  const transport = createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // Use SSL/TLS
    auth: {
      user: process.env.Gmail,
      pass: process.env.Password,
    },
  });

  // Ensure frontendurl is defined, with a fallback for development
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173"; // Changed fallback to 5173

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f0f2f5;
      margin: 0;
      padding: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
    }
    .container {
      background-color: #ffffff;
      padding: 30px;
      margin: 20px auto;
      border-radius: 10px;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
      max-width: 500px;
      width: 90%;
      text-align: center;
    }
    h1 {
      color: #4A148C; /* Deep Purple */
      margin-bottom: 15px;
      font-size: 28px;
    }
    p {
      color: #666666;
      line-height: 1.6;
      margin-bottom: 15px;
    }
    .button {
      display: inline-block;
      padding: 15px 30px;
      margin: 25px 0;
      background-color: #6A1B9A; /* Medium Purple */
      color: white;
      text-decoration: none;
      border-radius: 8px;
      font-size: 18px;
      font-weight: bold;
      transition: background-color 0.3s ease, transform 0.2s ease;
      box-shadow: 0 4px 10px rgba(106, 27, 154, 0.3);
    }
    .button:hover {
      background-color: #00BFA5; /* Vibrant Teal */
      transform: translateY(-2px);
      box-shadow: 0 6px 15px rgba(0, 191, 165, 0.4);
    }
    .footer {
      margin-top: 30px;
      color: #999999;
      font-size: 12px;
      line-height: 1.5;
    }
    .footer a {
      color: #4A148C;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Reset Your Password</h1>
    <p>Hello,</p>
    <p>You have requested to reset your password for your EduLearn account. Please click the button below to proceed:</p>
    <a href="${frontendUrl}/reset-password/${
    data.token
  }" class="button">Reset Password</a>
    <p>This link is valid for a limited time. If you did not request a password reset, please ignore this email.</p>
    <div class="footer">
      <p>Thank you,<br>The EduLearn Team</p>
      <p>&copy; ${new Date().getFullYear()} EduLearn Platform. All rights reserved.</p>
      <p><a href="${frontendUrl}">Visit our website</a></p>
    </div>
  </div>
</body>
</html>`;

  await transport.sendMail({
    from: process.env.Gmail,
    to: data.email,
    subject,
    html,
  });
};

// Newsletter welcome email
export const sendWelcomeEmail = async (email) => {
  const transport = createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.Gmail,
      pass: process.env.Password,
    },
  });

  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173"; // Changed fallback to 5173

  const subject = "Welcome to EduLearn Newsletter! 🎉";
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to EduLearn</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
      background-color: #f4f4f4;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      text-align: center;
      border-radius: 8px 8px 0 0;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
    }
    .content {
      background: #ffffff;
      padding: 30px;
      border-radius: 0 0 8px 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    .content h2 {
      color: #5a2d82;
      margin-top: 0;
    }
    .content ul {
      padding-left: 20px;
    }
    .content li {
      margin-bottom: 8px;
    }
    .button {
      display: inline-block;
      padding: 12px 30px;
      background: #667eea;
      color: white;
      text-decoration: none;
      border-radius: 5px;
      margin: 20px 0;
      font-weight: bold;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      font-size: 12px;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welcome to EduLearn! 🎓</h1>
      <p>Thank you for subscribing to our newsletter</p>
    </div>
    <div class="content">
      <h2>You're now part of our learning community!</h2>
      <p>Hi there,</p>
      <p>Welcome to EduLearn! We're excited to have you join our community of learners. By subscribing to our newsletter, you'll be the first to know about:</p>
      <ul>
        <li>🆕 New course releases</li>
        <li>📚 Educational tips and resources</li>
        <li>🌟 Success stories from our community</li>
        <li>🔥 Trending courses and skills</li>
      </ul>
      <p>Ready to start your learning journey?</p>
      <p>If you have any questions, feel free to reach out to us at <a href="mailto:info@edulearn.com">info@edulearn.com</a></p>
      <p>Happy learning!</p>
      <p><strong>The EduLearn Team</strong></p>
    </div>
    <div class="footer">
      <p>You received this email because you subscribed to our newsletter.</p>
      <p>&copy; ${new Date().getFullYear()} EduLearn Platform. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;

  await transport.sendMail({
    from: process.env.Gmail,
    to: email,
    subject,
    html,
  });
};

// Newsletter email for updates
export const sendNewsletterEmail = async (
  email,
  subject,
  content,
  type = "newsletter"
) => {
  const transport = createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.Gmail,
      pass: process.env.Password,
    },
  });

  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173"; // Changed fallback to 5173

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
      background-color: #f4f4f4;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      text-align: center;
      border-radius: 8px 8px 0 0;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
    }
    .content {
      background: #ffffff;
      padding: 30px;
      border: 1px solid #e0e0e0;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    .content h2 {
      color: #5a2d82;
      margin-top: 0;
    }
    .button {
      display: inline-block;
      padding: 12px 30px;
      background: #667eea;
      color: white;
      text-decoration: none;
      border-radius: 5px;
      margin: 20px 0;
      font-weight: bold;
    }
    .footer {
      background: #f8f9fa;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #666;
      border-radius: 0 0 8px 8px;
    }
    .unsubscribe {
      color: #999;
      font-size: 11px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>EduLearn Newsletter</h1>
      <p>Stay updated with the latest in online learning</p>
    </div>
    <div class="content">
      <h2>${subject}</h2>
      ${content}
      <p>Keep learning and growing with us!</p>
      <a href="${frontendUrl}/courses" class="button">Explore More Courses</a>
    </div>
    <div class="footer">
      <p>Thank you for being part of the EduLearn community!</p>
      <p>&copy; ${new Date().getFullYear()} EduLearn Platform. All rights reserved.</p>
      <p class="unsubscribe">
        Don't want to receive these emails? 
        <a href="${frontendUrl}/unsubscribe?email=${encodeURIComponent(
    email
  )}">Unsubscribe</a>
      </p>
    </div>
  </div>
</body>
</html>`;

  await transport.sendMail({
    from: process.env.Gmail,
    to: email,
    subject,
    html,
  });
};

// Course notification email
export const sendCourseNotificationEmail = async (email, courseData) => {
  const transport = createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.Gmail,
      pass: process.env.Password,
    },
  });

  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173"; // Changed fallback to 5173

  const subject = `🎓 New Course Alert: ${courseData.title}`;
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Course Available</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
      background-color: #f4f4f4;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      text-align: center;
      border-radius: 8px 8px 0 0;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
    }
    .content {
      background: #ffffff;
      padding: 30px;
      border: 1px solid #e0e0e0;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    .course-card {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
      border-left: 4px solid #667eea;
    }
    .course-card h2 {
      color: #5a2d82;
      margin-top: 0;
    }
    .button {
      display: inline-block;
      padding: 12px 30px;
      background: #667eea;
      color: white;
      text-decoration: none;
      border-radius: 5px;
      margin: 20px 0;
      font-weight: bold;
    }
    .footer {
      background: #f8f9fa;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #666;
      border-radius: 0 0 8px 8px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎓 New Course Available!</h1>
      <p>Don't miss out on this exciting new learning opportunity</p>
    </div>
    <div class="content">
      <div class="course-card">
        <h2>${courseData.title}</h2>
        <p><strong>Instructor:</strong> ${courseData.instructor}</p>
        <p><strong>Category:</strong> ${courseData.category}</p>
        <p><strong>Level:</strong> ${courseData.level}</p>
        <p>${courseData.description}</p>
        ${
          courseData.price
            ? `<p><strong>Price:</strong> ${courseData.price}INR </p>`
            : ""
        }
      </div>
      <p>This course is now available and ready for enrollment. Join thousands of other learners and start your journey today!</p>
    </div>
    <div class="footer">
      <p>Happy learning from the EduLearn team!</p>
      <p>&copy; ${new Date().getFullYear()} EduLearn Platform. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;

  await transport.sendMail({
    from: process.env.Gmail,
    to: email,
    subject,
    html,
  });
};

// Simple email sender for newsletter (uses html directly)
export const sendSimpleEmail = async (email, subject, html) => {
  const transport = createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.Gmail,
      pass: process.env.Password,
    },
  });

  await transport.sendMail({
    from: process.env.Gmail,
    to: email,
    subject,
    html,
  });
};
