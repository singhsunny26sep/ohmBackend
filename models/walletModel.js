const mongoose = require("mongoose");

const WalletSchema = new mongoose.Schema(
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true,
      },
      balance: {
        type: Number,
        default: 0,
        min: 0,
      },
      currency: {
        type: String,
        default: "INR",
      },
      isActive: {
        type: Boolean,
        default: true,
      },
    },
    { timestamps: true }
  );
  module.exports = mongoose.model("Wallet", WalletSchema);