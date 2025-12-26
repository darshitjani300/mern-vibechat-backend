import mongoose, { ConnectOptions } from "mongoose";
import { config as configDotenv } from "dotenv";
configDotenv();

const mongo_password = process.env.MONGO_PASSWORD;

if (!mongo_password) {
  throw new Error("❌ MONGO_PASSWORD is not defined in environment variables");
}

const URI = `mongodb+srv://root:${mongo_password}@cluster0.869bgbn.mongodb.net/`;

const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(URI, {} as ConnectOptions);
    console.log("✅ MongoDB Connected Successfully");
  } catch (error) {
    if (error instanceof Error) {
      console.log("❌ MongoDB Connection Failed:", error.message);
    } else {
      console.log("❌ Unknown MongoDB Connection Failed:", error);
    }
    process.exit(1);
  }
};

export default connectDB;
