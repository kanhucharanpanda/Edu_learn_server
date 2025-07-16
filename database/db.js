import mongoose from "mongoose";

export const connectDb = async () => {
  try {
    await mongoose.connect(process.env.DB, {
      dbName: "E-Learning",
    });
    console.log("Database Connected");
  } catch (error) {
    console.log(error);
  }
};
