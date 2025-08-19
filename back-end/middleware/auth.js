import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

// التحقق من بيانات تسجيل الدخول
export const validateAdminCredentials = (username, password) => {
  const adminUsername = process.env.ADMIN_USERNAME;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminUsername || !adminPassword) {
    throw new Error("بيانات المدير غير مكونة في ملف البيئة");
  }

  // التحقق الصارم من بيانات المدير
  if (typeof username !== "string" || typeof password !== "string") {
    return false;
  }

  // التحقق من تطابق البيانات بدقة
  return username === adminUsername && password === adminPassword;
};

// إنشاء JWT token
export const generateToken = (username) => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT secret غير مكون في ملف البيئة");
  }

  return jwt.sign(
    {
      username,
      role: "admin",
      iat: Date.now(),
    },
    secret,
    { expiresIn: "24h" }
  );
};

// التحقق من صحة JWT token
export const verifyToken = (token) => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT secret غير مكون في ملف البيئة");
  }

  try {
    return jwt.verify(token, secret);
  } catch (error) {
    throw new Error("رمز المصادقة غير صحيح أو منتهي الصلاحية");
  }
};

// Middleware للتحقق من صحة المصادقة
export const authenticateAdmin = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "رمز المصادقة مطلوب",
        error: "UNAUTHORIZED",
      });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    if (!decoded.username || decoded.role !== "admin") {
      return res.status(401).json({
        success: false,
        message: "رمز المصادقة غير صحيح",
        error: "INVALID_TOKEN_DATA",
      });
    }

    const adminUsername = process.env.ADMIN_USERNAME;
    if (!adminUsername || decoded.username !== adminUsername) {
      return res.status(403).json({
        success: false,
        message: "غير مصرح لك بالوصول لهذا المورد",
        error: "FORBIDDEN",
      });
    }

    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message || "فشل في التحقق من الهوية",
      error: "AUTHENTICATION_FAILED",
    });
  }
};

// Middleware للتحقق من صحة بيانات تسجيل الدخول
export const validateLoginData = (req, res, next) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: "اسم المستخدم وكلمة المرور مطلوبان",
      error: "MISSING_CREDENTIALS",
    });
  }

  if (typeof username !== "string" || typeof password !== "string") {
    return res.status(400).json({
      success: false,
      message: "بيانات تسجيل الدخول غير صحيحة",
      error: "INVALID_CREDENTIALS_FORMAT",
    });
  }

  next();
};
