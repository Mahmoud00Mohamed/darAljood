import mongoose from "mongoose";

const pricingSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    default: "pricing_config",
  },
  basePrice: {
    type: Number,
    required: true,
    min: 0,
    default: 220,
  },
  includedItems: {
    backLogo: { type: Boolean, default: true },
    backText: { type: Boolean, default: true },
    rightSideLogos: { type: Number, min: 0, default: 2 },
    leftSideLogos: { type: Number, min: 0, default: 2 },
    frontItems: { type: Number, min: 0, default: 1 },
  },
  additionalCosts: {
    frontExtraItem: { type: Number, min: 0, default: 25 },
    rightSideThirdLogo: { type: Number, min: 0, default: 25 },
    leftSideThirdLogo: { type: Number, min: 0, default: 25 },
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
  updatedBy: {
    type: String,
    required: true,
    default: "system",
  },
});

// Middleware لتحديث lastUpdated تلقائياً
pricingSchema.pre("save", function(next) {
  this.lastUpdated = new Date();
  next();
});

pricingSchema.pre("findOneAndUpdate", function(next) {
  this.set({ lastUpdated: new Date() });
  next();
});

export default mongoose.model("Pricing", pricingSchema);