const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;

const AstrologerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide the astrologer's name"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Please provide an email"],
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email",
      ],
    },
    phoneNumber: {
      type: String,
      required: [true, "Please provide a phone number"],
    },
    userId: { type: ObjectId, ref: "User" },
    specialties: [{ type: ObjectId, ref: "Category", required: true }],
    experience: {
      type: Number,
      required: [true, "Please provide years of experience"],
    },
    bio: { type: String },
    experienceAndQualification: { type: String },
    profileImage: { type: String },
    isAvailable: { type: Boolean, default: true },
    pricing: { type: Number },
    language: [String],
    dayEarnPercentage: { type: Number, min: 20, max: 80, default: 40 },
    nightEarnPercentage: { type: Number, min: 20, max: 80, default: 50 },
    isChatEnabled: { type: Boolean, default: true },
    isCallEnabled: { type: Boolean, default: true },
    isVideoCallEnabled: { type: Boolean, default: true },
    chatChargePerMinute: { type: Number, required: true, default: 0 },
    callChargePerMinute: { type: Number, required: true, default: 0 },
    callCount: { type: Number, default: 0 },
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("Astrologer", AstrologerSchema);
