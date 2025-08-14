const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log(`Server successfully connected to MongoDB Atlas`);
  } catch (error) {
    console.log(`Server failed to connect to MongoDB: ${error}`);
  }
};

module.exports = connectDB;
