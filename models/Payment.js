const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
    },
    amount: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      required: true,
    },
    month: {
      type: String,
      required: true,
    },
    day: {
      type: String,
      required: true,
    },
    year: {
      type: String,
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);
