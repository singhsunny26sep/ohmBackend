const mongoose = require("mongoose");

const admissionSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    mobileNumber: { type: String, required: true, trim: true },
    courseSelection: {
      type: String,
      required: true,
      enum: ["astrology", "numerology", "vastu", "palmistry", "tarot"],
    },
    program: {
      type: String,
      default: "Graduation's Program in Ancient Sciences",
    },
    duration: { type: String, default: "1 Year" },
    fee: { type: String, default: "₹10,000" },
    status: {
      type: String,
      enum: ["new", "in-review", "approved", "rejected"],
      default: "new",
    },
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("Admission", admissionSchema);
