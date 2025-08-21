import cors from "cors";

// تكوين CORS
const corsOptions = {
  origin: function (origin, callback) {
    // السماح للطلبات بدون origin (مثل تطبيقات الهاتف المحمول)
    if (!origin) return callback(null, true);

    // قائمة النطاقات المسموحة
    const allowedOrigins = [
      process.env.FRONTEND_URL || "https://dar-algood-seniorjacket.com/",
      // "http://localhost:3000",
      "http://localhost:5174",
      "http://localhost:5173",
      // "https://daraljoud.com",
      // "https://dar-algood.netlify.app",
      "https://dar-algood-seniorjacket.com/",
    ];

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("غير مسموح بواسطة CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Origin",
    "X-Requested-With",
    "Content-Type",
    "Accept",
    "Authorization",
    "Cache-Control",
  ],
  maxAge: 86400, // 24 ساعة
};

export default cors(corsOptions);
