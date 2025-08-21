import { S3Client } from "@aws-sdk/client-s3";
import { PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import dotenv from "dotenv";

dotenv.config();

// تكوين Cloudflare R2
const r2Client = new S3Client({
  region: "auto",
  endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
  },
});

// اسم الـ bucket
const BUCKET_NAME = process.env.CLOUDFLARE_R2_BUCKET_NAME;

// التحقق من صحة التكوين
const validateR2Config = () => {
  const requiredVars = [
    "CLOUDFLARE_R2_ENDPOINT",
    "CLOUDFLARE_R2_ACCESS_KEY_ID",
    "CLOUDFLARE_R2_SECRET_ACCESS_KEY",
    "CLOUDFLARE_R2_BUCKET_NAME",
    "CLOUDFLARE_R2_PUBLIC_URL",
  ];
  const missingVars = requiredVars.filter((varName) => !process.env[varName]);

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required Cloudflare R2 environment variables: ${missingVars.join(
        ", "
      )}`
    );
  }
};

// اختبار الاتصال مع R2
export const testR2Connection = async () => {
  try {
    // محاولة إنشاء presigned URL كاختبار للاتصال
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: "test-connection",
    });
    
    await getSignedUrl(r2Client, command, { expiresIn: 60 });
    return true;
  } catch (error) {
    console.error("R2 connection test failed:", error);
    return false;
  }
};

// تهيئة R2
export const initializeR2 = async () => {
  try {
    validateR2Config();
    const isConnected = await testR2Connection();

    if (!isConnected) {
      throw new Error("Failed to connect to Cloudflare R2");
    }

    return r2Client;
  } catch (error) {
    console.error("R2 initialization failed:", error);
    throw error;
  }
};

// رفع ملف إلى R2
export const uploadToR2 = async (
  buffer,
  key,
  contentType = "image/jpeg",
  metadata = {}
) => {
  try {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      Metadata: metadata,
    });

    await r2Client.send(command);

    // إنشاء URL عام للصورة
    const publicUrl = `${process.env.CLOUDFLARE_R2_PUBLIC_URL}/${key}`;

    return {
      success: true,
      url: publicUrl,
      key: key,
      bucket: BUCKET_NAME,
      contentType,
      size: buffer.length,
    };
  } catch (error) {
    console.error("Error uploading to R2:", error);
    throw error;
  }
};

// حذف ملف من R2
export const deleteFromR2 = async (key) => {
  try {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    await r2Client.send(command);

    return {
      success: true,
      key: key,
    };
  } catch (error) {
    console.error("Error deleting from R2:", error);
    throw error;
  }
};

// الحصول على URL موقع للتحميل
export const getSignedDownloadUrl = async (key, expiresIn = 3600) => {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    const signedUrl = await getSignedUrl(r2Client, command, { expiresIn });
    return signedUrl;
  } catch (error) {
    console.error("Error generating signed URL:", error);
    throw error;
  }
};

// توليد مفتاح فريد للملف
export const generateFileKey = (originalName, folder = "images") => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = originalName.split(".").pop();
  const cleanName = originalName
    .replace(/[^a-zA-Z0-9.-]/g, "_")
    .toLowerCase();
  
  return `${folder}/${timestamp}_${randomString}_${cleanName}`;
};

// معالجة الصور وتحسينها
export const processImage = async (buffer, options = {}) => {
  // يمكن إضافة معالجة الصور هنا باستخدام مكتبات مثل Sharp
  // حالياً نرجع الـ buffer كما هو
  return buffer;
};

export default r2Client;