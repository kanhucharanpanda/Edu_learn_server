// import express from "express";
// import dotenv from "dotenv";
// import { connectDb } from "./database/db.js";
// import Razorpay from "razorpay";
// import cors from "cors";
// import newsletterRoutes from "./routes/newsletter.js";
// import quizRoutes from "./routes/quizRoutes.js";
// // Add this with your other route middlewares

// dotenv.config();

// export const instance = new Razorpay({
//   key_id: process.env.Razorpay_Key,
//   key_secret: process.env.Razorpay_Secret,
// });

// const app = express();

// // using middlewares
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(cors());

// const port = process.env.PORT;

// app.get("/", (req, res) => {
//   res.send("Server is working");
// });

// app.use("/uploads", express.static("uploads"));

// // // importing routes
// import userRoutes from "./routes/user.js";
// import courseRoutes from "./routes/course.js";
// import adminRoutes from "./routes/admin.js";

// // // using routes
// app.use("/api", userRoutes);
// app.use("/api", courseRoutes);
// app.use("/api", adminRoutes);
// app.use("/api", newsletterRoutes);
// app.use("/api/quiz", quizRoutes);
// // In your main server file (app.js or server.js)

// app.listen(port, () => {
//   console.log(`Server is running on http://localhost:${port}`);
//   connectDb();
// });

// server/index.js

import express from "express";
import dotenv from "dotenv";
import { connectDb } from "./database/db.js";
import Razorpay from "razorpay";
import cors from "cors";
import newsletterRoutes from "./routes/newsletter.js";
import quizRoutes from "./routes/quizRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";

dotenv.config();

export const instance = new Razorpay({
  key_id: process.env.Razorpay_Key,
  key_secret: process.env.Razorpay_Secret,
});

const app = express();

// --- CORS Configuration ---
const allowedOrigins = [
  "https://edu-learn-frontend-website.vercel.app",
  "http://localhost:5173", // Your React frontend development server
  // Add other production origins here if needed
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg =
        "The CORS policy for this site does not allow access from the specified Origin.";
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true, // This is crucial. It allows the browser to send cookies/auth headers.
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "token",
  ],
};

// using middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Apply the customized CORS middleware
app.use(cors(corsOptions));
// --------------------------

const port = process.env.PORT;

app.get("/", (req, res) => {
  res.send("Server is working");
});

app.use("/uploads", express.static("uploads"));

// // importing routes
import userRoutes from "./routes/user.js";
import courseRoutes from "./routes/course.js";
import adminRoutes from "./routes/admin.js";

// // using routes
app.use("/api", userRoutes);
app.use("/api", courseRoutes);
app.use("/api", adminRoutes);
app.use("/api", newsletterRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api", contactRoutes);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
  connectDb();
});
