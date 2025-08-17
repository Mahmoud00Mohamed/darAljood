import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50,
  },
  description: {
    type: String,
    trim: true,
    maxlength: 200,
    default: "",
  },
  color: {
    type: String,
    required: true,
    default: "#6B7280",
    match: /^#[0-9A-Fa-f]{6}$/,
  },
  icon: {
    type: String,
    required: true,
    default: "folder",
    enum: ["folder", "star", "shapes", "type", "image"],
  },
  isDefault: {
    type: Boolean,
    default: false,
  },
  order: {
    type: Number,
    required: true,
    default: 1,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  updatedBy: {
    type: String,
    required: true,
    default: "system",
  },
});

// إنشاء فهرس مركب للبحث السريع
categorySchema.index({ name: 1, isDefault: 1 });
categorySchema.index({ order: 1 });

// Middleware لتحديث updatedAt تلقائياً
categorySchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

categorySchema.pre("findOneAndUpdate", function (next) {
  this.set({ updatedAt: new Date() });
  next();
});

export default mongoose.model("Category", categorySchema);
