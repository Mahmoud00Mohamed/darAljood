import { validateAdminCredentials, generateToken } from "../middleware/auth.js";

// تسجيل دخول المدير
export const adminLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    // التحقق من وجود البيانات المطلوبة
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "اسم المستخدم وكلمة المرور مطلوبان",
        error: "MISSING_CREDENTIALS",
      });
    }

    // التحقق من نوع البيانات
    if (typeof username !== "string" || typeof password !== "string") {
      return res.status(400).json({
        success: false,
        message: "بيانات تسجيل الدخول غير صحيحة",
        error: "INVALID_CREDENTIALS_TYPE",
      });
    }

    // التحقق من صحة بيانات تسجيل الدخول
    const isValid = validateAdminCredentials(username, password);

    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: "اسم المستخدم أو كلمة المرور غير صحيحة",
        error: "INVALID_CREDENTIALS",
      });
    }

    // التحقق الإضافي من أن المستخدم هو المدير المصرح له
    const adminUsername = process.env.ADMIN_USERNAME;
    if (!adminUsername || username !== adminUsername) {
      return res.status(403).json({
        success: false,
        message: "غير مصرح لك بالوصول",
        error: "UNAUTHORIZED_USER",
      });
    }

    // إنشاء JWT token
    const token = generateToken(username);

    res.status(200).json({
      success: true,
      message: "تم تسجيل الدخول بنجاح",
      data: {
        token,
        username,
        role: "admin",
        expiresIn: "24h",
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء تسجيل الدخول",
      error: "LOGIN_FAILED",
    });
  }
};

// التحقق من صحة الجلسة
export const verifySession = async (req, res) => {
  try {
    // التحقق الإضافي من صحة بيانات الجلسة
    if (!req.admin || !req.admin.username || req.admin.role !== "admin") {
      return res.status(401).json({
        success: false,
        message: "جلسة غير صحيحة",
        error: "INVALID_SESSION",
      });
    }

    // التحقق من أن المستخدم هو المدير المصرح له
    const adminUsername = process.env.ADMIN_USERNAME;
    if (!adminUsername || req.admin.username !== adminUsername) {
      return res.status(403).json({
        success: false,
        message: "غير مصرح لك بالوصول",
        error: "UNAUTHORIZED_USER",
      });
    }

    // إذا وصل الطلب إلى هنا، فهذا يعني أن المصادقة نجحت
    res.status(200).json({
      success: true,
      message: "الجلسة صحيحة",
      data: {
        username: req.admin.username,
        role: req.admin.role,
        iat: req.admin.iat,
      },
    });
  } catch (error) {
    console.error("Session verification error:", error);

    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء التحقق من الجلسة",
      error: "SESSION_VERIFICATION_FAILED",
    });
  }
};

// تسجيل خروج المدير
export const adminLogout = async (req, res) => {
  try {
    // في JWT، لا نحتاج لحذف الرمز من الخادم
    // يمكن إضافة blacklist للرموز المنتهية الصلاحية إذا لزم الأمر

    res.status(200).json({
      success: true,
      message: "تم تسجيل الخروج بنجاح",
    });
  } catch (error) {
    console.error("Logout error:", error);

    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء تسجيل الخروج",
      error: "LOGOUT_FAILED",
    });
  }
};
