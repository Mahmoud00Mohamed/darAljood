import mongoose from "mongoose";

// Schema للشعارات
const logoSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    image: { type: String, default: null },
    position: {
      type: String,
      required: true,
      enum: [
        "chestRight",
        "chestLeft",
        "backCenter",
        "rightSide_top",
        "rightSide_middle",
        "rightSide_bottom",
        "leftSide_top",
        "leftSide_middle",
        "leftSide_bottom",
      ],
    },
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 },
    scale: { type: Number, default: 1 },
    rotation: { type: Number, default: 0 },
  },
  { _id: false }
);

// Schema للنصوص
const textSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    content: { type: String, required: true, maxlength: 50 },
    position: {
      type: String,
      required: true,
      enum: ["chestRight", "chestLeft", "backBottom"],
    },
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 },
    scale: { type: Number, default: 1 },
    font: { type: String, default: "Katibeh" },
    color: { type: String, default: "#000000" },
    isConnected: { type: Boolean, default: true },
    charStyles: [
      {
        x: { type: Number, default: 0 },
        y: { type: Number, default: 0 },
        scale: { type: Number, default: 1 },
        font: { type: String },
        color: { type: String },
      },
    ],
  },
  { _id: false }
);

// Schema للصور المرفوعة
const uploadedImageSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    url: { type: String, required: true },
    name: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now },
    publicId: { type: String },
  },
  { _id: false }
);

// Schema لتكوين الجاكيت
const jacketConfigSchema = new mongoose.Schema(
  {
    colors: {
      body: { type: String, required: true, default: "#5C1A2B" },
      sleeves: { type: String, required: true, default: "#1B263B" },
      trim: { type: String, required: true, default: "#1B263B_stripes" },
    },
    materials: {
      body: {
        type: String,
        required: true,
        default: "cotton",
        enum: ["cotton", "leather"],
      },
      sleeves: {
        type: String,
        required: true,
        default: "leather",
        enum: ["cotton", "leather"],
      },
      trim: {
        type: String,
        required: true,
        default: "cotton",
        enum: ["cotton", "leather"],
      },
    },
    size: {
      type: String,
      required: true,
      default: "M",
      enum: ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL"],
    },
    logos: [logoSchema],
    texts: [textSchema],
    currentView: {
      type: String,
      required: true,
      default: "front",
      enum: ["front", "back", "right", "left"],
    },
    totalPrice: { type: Number, required: true, default: 220 },
    isCapturing: { type: Boolean, default: false },
    uploadedImages: [uploadedImageSchema],
    pricingBreakdown: {
      basePrice: { type: Number },
      additionalCosts: [
        {
          item: String,
          cost: Number,
          quantity: Number,
        },
      ],
      totalPrice: { type: Number },
      appliedDiscount: {
        type: { type: String },
        percentage: Number,
        amount: Number,
      },
      finalPrice: { type: Number },
    },
  },
  { _id: false }
);

// Schema لعناصر الطلب
const orderItemSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    jacketConfig: { type: jacketConfigSchema, required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

// Schema لتاريخ الحالات
const statusHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      required: true,
      enum: [
        "pending",
        "confirmed",
        "in_production",
        "quality_check",
        "ready_to_ship",
        "shipped",
        "delivered",
        "cancelled",
        "returned",
      ],
    },
    timestamp: { type: Date, required: true, default: Date.now },
    note: { type: String, default: "" },
    updatedBy: { type: String, required: true, default: "system" },
  },
  { _id: false }
);

// Schema للملاحظات
const noteSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    content: { type: String, required: true, maxlength: 500 },
    addedBy: { type: String, required: true },
    addedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

// Schema الرئيسي للطلب
const orderSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  orderNumber: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  trackingCode: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  customerInfo: {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    phone: { type: String, required: true, trim: true },
  },
  items: [orderItemSchema],
  totalPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  status: {
    type: String,
    required: true,
    default: "pending",
    enum: [
      "pending",
      "confirmed",
      "in_production",
      "quality_check",
      "ready_to_ship",
      "shipped",
      "delivered",
      "cancelled",
      "returned",
    ],
    index: true,
  },
  statusHistory: [statusHistorySchema],
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  estimatedDelivery: {
    type: Date,
    required: true,
  },
  shippedAt: {
    type: Date,
  },
  deliveredAt: {
    type: Date,
  },
  notes: [noteSchema],
  backupImages: [
    {
      originalPublicId: { type: String },
      backupPublicId: { type: String },
      backupUrl: { type: String },
      copiedAt: { type: Date, default: Date.now },
      size: { type: Number },
      format: { type: String },
    },
  ],
});

// إنشاء فهارس مركبة للبحث السريع
orderSchema.index({ orderNumber: 1, trackingCode: 1 });
orderSchema.index({
  "customerInfo.name": "text",
  "customerInfo.phone": "text",
});
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ createdAt: -1 });

// Middleware لتحديث updatedAt تلقائياً
orderSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

orderSchema.pre("findOneAndUpdate", function (next) {
  this.set({ updatedAt: new Date() });
  next();
});

export default mongoose.model("Order", orderSchema);
