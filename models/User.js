const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    }, 
    phNumber: {
      type: String,
      required: true,
    },
    income: {
      type: String,
      default: 0,
    },
    payment: [
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
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
