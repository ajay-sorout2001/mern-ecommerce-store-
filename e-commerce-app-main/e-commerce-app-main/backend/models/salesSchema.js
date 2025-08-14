const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

const salesSchema = mongoose.Schema({
  product: {
    type: ObjectId,
    ref: "Product",
    required: true,
  },
  seller: {
    type: ObjectId,
    ref: "Seller",
    required: true,
  },
  buyer: {
    type: ObjectId,
    ref: "User",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  totalPrice: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "completed", "cancelled"],
    default: "pending",
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Sale", salesSchema);
