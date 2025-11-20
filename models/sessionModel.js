const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema(
  {
    sessionType: {
      type: String,
      enum: ["chat", "audioCall", "videoCall", "liveVideo"],
      required: true,
    },
    astrologerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plan",
    },
    startTime: { type: Date },
    endTime: { type: Date },
    duration: { type: Number }, // Duration in minutes
    // chargePerMinute: { type: Number },
    earnPercentage: { type: Number },
    totalCharge: { type: Number },
    status: {
      type: String,
      enum: ["completed", "ongoing", "canceled", "missed"],
      default: "ongoing",
    },
    isPaid: { type: Boolean, default: false },
    rating: { type: Number, min: 1, max: 5 },
    feedback: { type: String },
    totalMessages: { type: Number, default: 0 },
    // totalSize: { type: Number, default: 0 },
    isDaySession: { type: Boolean, default: false },
    // isPlanExceeded: { type: Boolean, default: false },
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("Session", sessionSchema);
