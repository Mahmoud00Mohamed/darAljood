import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

// تكوين Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// التحقق من صحة التكوين
const validateCloudinaryConfig = () => {
  const requiredVars = [
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET",
  ];
  const missingVars = requiredVars.filter((varName) => !process.env[varName]);

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required Cloudinary environment variables: ${missingVars.join(
        ", "
      )}`
    );
  }
};

// اختبار الاتصال مع Cloudinary
export const testCloudinaryConnection = async () => {
  try {
    await cloudinary.api.ping();
    return true;
  } catch (error) {
    return false;
  }
};

// تهيئة Cloudinary
export const initializeCloudinary = async () => {
  try {
    validateCloudinaryConfig();
    const isConnected = await testCloudinaryConnection();

    if (!isConnected) {
      throw new Error("Failed to connect to Cloudinary");
    }

    return cloudinary;
  } catch (error) {
    throw error;
  }
};

export default cloudinary;
