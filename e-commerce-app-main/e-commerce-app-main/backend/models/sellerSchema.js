const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

const sellerSchema = mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  firstName: {
    type: String,
    required: false,
  },
  lastName: {
    type: String,
    required: false,
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
  address: {
    type: String,
    required: false,
  },
  phone: {
    type: String,
    required: false,
  },
  birthDate: {
    type: Date,
    required: false
  },
  brandName: {
    type: String,
    required: true,
    unique: true,
  },
  products: [
    {
      type: ObjectId,
      ref: "Product",
    },
  ],
});

module.exports = mongoose.model("Seller", sellerSchema);
