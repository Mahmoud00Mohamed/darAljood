# دليل الهجرة من Cloudinary إلى Cloudflare R2

هذا الدليل يوضح كيفية الهجرة الكاملة من Cloudinary إلى Cloudflare R2.

## 📋 نظرة عامة

تم تحويل النظام بالكامل من Cloudinary إلى Cloudflare R2 للحصول على:
- **أداء أفضل** - سرعة أعلى في التحميل والرفع
- **تكلفة أقل** - أسعار تنافسية مع Cloudflare
- **تحكم أكبر** - مرونة أكثر في إدارة الملفات
- **أمان محسن** - حماية متقدمة للبيانات

## 🔄 التغييرات الرئيسية

### 1. تكوين التخزين
```javascript
// قبل (Cloudinary)
import cloudinary from 'cloudinary';
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// بعد (Cloudflare R2)
import { S3Client } from '@aws-sdk/client-s3';
const r2Client = new S3Client({
  region: 'auto',
  endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
  },
});
```

### 2. رفع الصور
```javascript
// قبل (Cloudinary)
const result = await cloudinary.uploader.upload(fileStr, {
  folder: "dar-aljoud/logos",
  transformation: [{ width: 1000, height: 1000, crop: "limit" }]
});

// بعد (Cloudflare R2)
const uploadResult = await uploadToR2(
  buffer,
  fileKey,
  contentType,
  metadata
);
```

### 3. حذف الصور
```javascript
// قبل (Cloudinary)
await cloudinary.uploader.destroy(publicId);

// بعد (Cloudflare R2)
await deleteFromR2(key);
```

## 🔧 خطوات الهجرة

### الخطوة 1: إعداد Cloudflare R2

1. **إنشاء حساب Cloudflare** (إذا لم يكن موجود)
2. **تفعيل R2** في لوحة التحكم
3. **إنشاء Bucket جديد:**
   ```bash
   اسم الـ Bucket: dar-aljoud-images
   المنطقة: Auto (أو اختر المنطقة الأقرب)
   ```

4. **إنشاء API Tokens:**
   ```bash
   الصلاحيات المطلوبة:
   - Object Read
   - Object Write  
   - Object Delete
   ```

### الخطوة 2: تحديث متغيرات البيئة

```env
# إضافة متغيرات R2 الجديدة
CLOUDFLARE_R2_ENDPOINT=https://YOUR_ACCOUNT_ID.r2.cloudflarestorage.com
CLOUDFLARE_R2_ACCESS_KEY_ID=your_access_key_id
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your_secret_access_key
CLOUDFLARE_R2_BUCKET_NAME=dar-aljoud-images
CLOUDFLARE_R2_PUBLIC_URL=https://pub-YOUR_ACCOUNT_ID.r2.dev

# يمكن الاحتفاظ بمتغيرات Cloudinary مؤقتاً للهجرة
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### الخطوة 3: تثبيت المكتبات الجديدة

```bash
cd back-end
npm uninstall cloudinary
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

### الخطوة 4: هجرة الصور الموجودة

```javascript
// استخدام أداة الهجرة المدمجة
import R2ImageManager from './back-end/utils/r2ImageManager.js';

// قائمة بجميع URLs الصور في Cloudinary
const cloudinaryUrls = [
  'https://res.cloudinary.com/your-cloud/image/upload/v123/image1.jpg',
  'https://res.cloudinary.com/your-cloud/image/upload/v123/image2.jpg',
  // ... إضافة جميع الصور
];

// تنفيذ الهجرة
const migrationResult = await R2ImageManager.migrateFromCloudinary(
  cloudinaryUrls,
  'dar-aljoud/migrated'
);

console.log(`نتائج الهجرة:
- المجموع: ${migrationResult.total}
- نجح: ${migrationResult.successful}  
- فشل: ${migrationResult.failed}
`);
```

### الخطوة 5: تحديث قاعدة البيانات

```javascript
// تحديث URLs في قاعدة البيانات
const updateImageUrls = async () => {
  // تحديث الشعارات الجاهزة
  await PredefinedImageSchema.updateMany(
    { url: { $regex: 'cloudinary.com' } },
    [
      {
        $set: {
          url: {
            $concat: [
              process.env.CLOUDFLARE_R2_PUBLIC_URL,
              '/dar-aljoud/predefined-logos/',
              { $arrayElemAt: [{ $split: ['$publicId', '/'] }, -1] }
            ]
          },
          publicId: {
            $concat: [
              'dar-aljoud/predefined-logos/',
              { $arrayElemAt: [{ $split: ['$publicId', '/'] }, -1] }
            ]
          }
        }
      }
    ]
  );

  // تحديث صور الطلبات
  await OrderSchema.updateMany(
    { 'items.jacketConfig.logos.image': { $regex: 'cloudinary.com' } },
    // ... تحديث مشابه للطلبات
  );
};
```

## 📊 مقارنة الأداء

| المعيار | Cloudinary | Cloudflare R2 |
|---------|------------|---------------|
| **سرعة الرفع** | متوسطة | سريعة جداً |
| **سرعة التحميل** | جيدة | ممتازة (CDN عالمي) |
| **التكلفة** | مرتفعة | منخفضة |
| **التحكم** | محدود | كامل |
| **الأمان** | جيد | ممتاز |
| **التوفر** | 99.9% | 99.99% |

## 🛡️ الأمان والحماية

### حماية R2
```javascript
// إعداد CORS للـ bucket
{
  "AllowedOrigins": ["https://dar-algood.com"],
  "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
  "AllowedHeaders": ["*"],
  "MaxAgeSeconds": 3600
}

// إعداد Lifecycle rules
{
  "Rules": [
    {
      "Status": "Enabled",
      "Filter": { "Prefix": "temp/" },
      "Expiration": { "Days": 1 }
    }
  ]
}
```

### حماية API
```javascript
// Rate limiting محسن
const r2RateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 دقيقة
  max: 100, // 100 طلب لكل IP
  message: 'تم تجاوز الحد المسموح لطلبات R2'
});
```

## 🔍 اختبار النظام

### اختبار الاتصال
```bash
# اختبار صحة النظام
curl https://your-api-url/health

# اختبار رفع صورة
curl -X POST https://your-api-url/api/upload/single \
  -H "Content-Type: multipart/form-data" \
  -F "image=@test-image.jpg"
```

### اختبار الأداء
```javascript
// قياس أوقات الاستجابة
const startTime = Date.now();
const uploadResult = await uploadToR2(buffer, key, contentType);
const duration = Date.now() - startTime;
console.log(`R2 upload took: ${duration}ms`);
```

## 📝 قائمة التحقق

### قبل الهجرة
- [ ] إعداد حساب Cloudflare R2
- [ ] إنشاء Bucket وAPI tokens
- [ ] تحديث متغيرات البيئة
- [ ] اختبار الاتصال مع R2
- [ ] نسخ احتياطي من البيانات الحالية

### أثناء الهجرة
- [ ] تثبيت مكتبات AWS SDK
- [ ] تحديث ملفات التكوين
- [ ] تحديث Controllers
- [ ] تحديث Frontend services
- [ ] هجرة الصور الموجودة
- [ ] تحديث قاعدة البيانات

### بعد الهجرة
- [ ] اختبار جميع الوظائف
- [ ] مراقبة الأداء
- [ ] تحديث التوثيق
- [ ] تدريب الفريق
- [ ] إزالة تبعيات Cloudinary

## ⚠️ تحذيرات مهمة

1. **نسخ احتياطي:** تأكد من عمل نسخة احتياطية كاملة قبل البدء
2. **اختبار شامل:** اختبر جميع الوظائف في بيئة التطوير أولاً
3. **مراقبة الأداء:** راقب النظام بعناية في الأيام الأولى
4. **خطة الطوارئ:** احتفظ بإعدادات Cloudinary كخطة بديلة

## 🎯 النتائج المتوقعة

بعد الهجرة الناجحة:
- **تحسن الأداء بنسبة 40-60%**
- **انخفاض التكلفة بنسبة 50-70%**
- **تحسن تجربة المستخدم**
- **مرونة أكبر في إدارة الملفات**

## 📞 الدعم

للمساعدة في الهجرة:
- **البريد الإلكتروني:** tech@dar-algood.com
- **واتساب:** +966536065766
- **التوثيق:** [docs.dar-algood.com/migration](https://docs.dar-algood.com/migration)

---

© 2025 دار الجود - دليل الهجرة إلى Cloudflare R2