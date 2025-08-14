require("dotenv").config({ quiet: true });
const express = require("express");
const fileUpload = require("express-fileupload");
const cookieParser = require("cookie-parser");
const connectDB = require("./databases/connection");
const cloudinaryConnect = require("./databases/cloudinary");
const cors = require("cors");

const authRoute = require("./routes/authRoute");
const userRoute = require("./routes/userRoute");
const sellerRoute = require("./routes/sellerRoute");
const productRoute = require("./routes/productRoute");
const salesRoute = require("./routes/salesRoute");

const app = express();
const PORT = process.env.PORT || 3000;

// Remove CORS restrictions - allow all origins
app.use(cors({
  origin: true, // Allow all origins
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp",
  })
);

app.use("/api/auth", authRoute);
app.use("/api/user", userRoute);
app.use("/api/seller", sellerRoute);
app.use("/api/product", productRoute);
app.use("/api/sales", salesRoute);

connectDB();
cloudinaryConnect();

app.get(("/"), (req, res) => {
  res.send("QuickCart server is live!");
})

app.listen(PORT, () => {
  console.log(`Server up and running on port ${PORT}`);
});