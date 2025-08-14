const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

const productSchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: false,
  },
  price: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    required: false,
    default: "General",
  },
  productImage: {
    type: String,
    required: false,
  },
  seller: {
    type: ObjectId,
    ref: "Seller",
    required: true,
  },
});

module.exports = mongoose.model("Product", productSchema);
