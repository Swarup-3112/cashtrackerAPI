const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    number: {
      type: Number,
    },
    month: {
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
