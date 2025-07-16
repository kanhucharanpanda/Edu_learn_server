import { User } from "../models/User.js";
import TryCatch from "./TryCatch.js";

export const isAdmin = TryCatch(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  if (user.role !== "admin") {
    return res.status(403).json({
      message: "Access denied. Admin only.",
    });
  }

  next();
});
