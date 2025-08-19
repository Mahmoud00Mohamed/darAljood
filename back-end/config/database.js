import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://daralgood:l1PRPzDGHy8Oyg6y@dar-algood.a0ynzpx.mongodb.net/?retryWrites=true&w=majority&appName=Dar-algood";

// خيارات الاتصال (مناسبة لـ Mongoose 6+)
const mongooseOptions = {
  maxPoolSize: 10, // الحد الأقصى لعدد الاتصالات
  serverSelectionTimeoutMS: 5000, // مهلة اختيار الخادم
  socketTimeoutMS: 45000, // مهلة الـ socket
  bufferCommands: false, // تعطيل تخزين الأوامر
};

/**
 * الاتصال بقاعدة البيانات
 */
export const connectDatabase = async () => {
  try {
    const connection = await mongoose.connect(MONGODB_URI, mongooseOptions);

    mongoose.connection.on("error", (error) => {});
    mongoose.connection.on("disconnected", () => {});
    mongoose.connection.on("reconnected", () => {});

    return connection;
  } catch (error) {
    throw error;
  }
};

/**
 * قطع الاتصال بقاعدة البيانات
 */
export const disconnectDatabase = async () => {
  try {
    await mongoose.disconnect();
  } catch (error) {
    throw error;
  }
};

/**
 * التحقق من حالة الاتصال
 */
export const getDatabaseStatus = () => {
  const states = {
    0: "منقطع",
    1: "متصل",
    2: "جاري الاتصال",
    3: "جاري قطع الاتصال",
  };

  return {
    state: mongoose.connection.readyState,
    status: states[mongoose.connection.readyState] || "غير معروف",
    host: mongoose.connection.host,
    name: mongoose.connection.name,
  };
};

export default mongoose;
